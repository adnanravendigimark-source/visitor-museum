import { NextResponse } from "next/server";
import { createSessionToken, ADMIN_COOKIE_NAME, type Session } from "@/lib/auth";
import { verifyUserCredentials } from "@/lib/users";
import { verifyOwnerPassword } from "@/lib/adminPassword";
import { PAGE_KEYS } from "@/lib/pageAccess";
import { DB_ERROR_MESSAGE } from "@/lib/db";

// Force this route to always run as a live serverless function rather than
// get statically optimized at build time — Next.js can otherwise pre-render
// a GET-only static response for a route handler like this and silently drop
// every other exported method (PUT/POST/DELETE), returning 405 for all of
// them in production even though the code is correct.
export const dynamic = "force-dynamic";

// Verifies a Turnstile token with Cloudflare's siteverify endpoint. Returns
// true if TURNSTILE_SECRET_KEY isn't set at all (captcha not configured —
// don't lock everyone out), false for any actual failure/error so a bad or
// missing token always blocks the login.
async function verifyCaptcha(token: string, ip: string | null): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true;
  if (!token) return false;

  try {
    const form = new URLSearchParams();
    form.append("secret", secret);
    form.append("response", token);
    if (ip) form.append("remoteip", ip);

    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: form.toString(),
    });
    const data = await res.json();
    if (data.success !== true) {
      // Logged so the real reason (bad-hostname, invalid-input-response,
      // timeout-or-duplicate, etc.) shows up in Vercel's function logs
      // instead of just a generic "failed" on the client.
      console.error("[turnstile] verification failed:", data["error-codes"] || data);
    }
    return data.success === true;
  } catch (err) {
    console.error("[turnstile] siteverify request threw:", err);
    return false;
  }
}

export async function POST(req: Request) {
  let email = "";
  let password = "";
  let captchaToken = "";
  try {
    const body = await req.json();
    email = (body.email || "").trim();
    password = body.password || "";
    captchaToken = body.captchaToken || "";
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  // x-forwarded-for on Vercel can be a comma-separated chain (client, then
  // internal proxies) — Cloudflare's remoteip param wants a single address,
  // so only pass the first (the real client IP).
  const forwardedFor = req.headers.get("x-forwarded-for");
  const ip = forwardedFor ? forwardedFor.split(",")[0].trim() : null;
  const captchaOk = await verifyCaptcha(captchaToken, ip);
  if (!captchaOk) {
    return NextResponse.json(
      { error: "Captcha verification failed. Please try again." },
      { status: 400 }
    );
  }

  const rootEmail = process.env.ADMIN_EMAIL;

  if (!rootEmail) {
    return NextResponse.json(
      { error: "Admin email is not configured on the server (.env)." },
      { status: 500 }
    );
  }

  // The .env owner account (role: admin) is always valid — can't be deleted
  // and works even if the users table is empty or unreachable. The password
  // is verified via verifyOwnerPassword(), which checks a DB-stored hash
  // first (set when the owner changes their password through /admin/account)
  // and falls back to the plain-text ADMIN_PASSWORD env var otherwise.
  let session: Session | null = null;

  if (email.toLowerCase() === rootEmail.toLowerCase()) {
    const ownerOk = await verifyOwnerPassword(password);
    if (ownerOk) {
      session = { email: rootEmail, role: "admin", pages: [...PAGE_KEYS] };
    }
  } else {
    let user;
    try {
      user = await verifyUserCredentials(email, password);
    } catch {
      return NextResponse.json({ error: DB_ERROR_MESSAGE }, { status: 500 });
    }
    if (user) session = { email: user.email, role: user.role, pages: user.pages };
  }

  if (!session) {
    return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
  }

  const token = await createSessionToken(session);
  const res = NextResponse.json({ ok: true, role: session.role });
  res.cookies.set(ADMIN_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8, // 8 hours
  });
  return res;
}
