import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken, ADMIN_COOKIE_NAME } from "@/lib/auth";
import type { PageKey } from "@/lib/pageAccess";

const PAGE_ROUTES: { key: PageKey; test: (p: string) => boolean }[] = [
  {
    key: "homepage",
    test: (p) => p.startsWith("/admin/homepage") || p.startsWith("/api/admin/homepage"),
  },
  {
    key: "museums",
    test: (p) =>
      p.startsWith("/admin/museums") ||
      p.startsWith("/api/admin/museums") ||
      p.startsWith("/admin/attractions") ||
      p.startsWith("/api/admin/attractions"),
  },
  { key: "posts", test: (p) => p.startsWith("/admin/posts") || p.startsWith("/api/admin/posts") },
  { key: "privacy", test: (p) => p.startsWith("/admin/privacy") || p.startsWith("/api/admin/privacy") },
  { key: "about", test: (p) => p.startsWith("/admin/about") || p.startsWith("/api/admin/about") },
  { key: "contact", test: (p) => p.startsWith("/admin/contact") || p.startsWith("/api/admin/contact") },
  { key: "pages", test: (p) => p.startsWith("/admin/pages") || p.startsWith("/api/admin/settings") },
];

function withNoIndex(res: NextResponse) {
  res.headers.set("X-Robots-Tag", "noindex, nofollow");
  return res;
}

function withNoCache(res: NextResponse) {
  res.headers.set("Cache-Control", "no-store, must-revalidate");
  return res;
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isAdminPage = pathname.startsWith("/admin") && pathname !== "/admin/login";
  const isAdminApi = pathname.startsWith("/api/admin") && pathname !== "/api/admin/login";
  const isAdminArea = pathname.startsWith("/admin") || pathname.startsWith("/api/admin");

  if (!isAdminPage && !isAdminApi) {
    // Public site (pages AND every static asset under /images — this
    // matcher isn't scoped to just pages): no Cache-Control override here
    // any more. This used to force `no-store` on EVERY public response,
    // which meant nothing was ever cached by the browser or by Vercel's
    // CDN — every page nav and every image re-fetched from the origin on
    // every single request, the single biggest cause of the site feeling
    // slow. Freshness after an admin edit is already handled by each admin
    // save route calling revalidatePath() (see app/api/admin/*/route.ts),
    // which busts the cache the moment content actually changes — this
    // blanket no-store was pure cost with no freshness benefit on top of
    // that. /admin/login and /api/admin/login still fall into this branch
    // (excluded from isAdminPage/isAdminApi above) and still get
    // X-Robots-Tag via isAdminArea below; the login form has no
    // personalized server data in its cached shell to leak.
    return isAdminArea ? withNoIndex(NextResponse.next()) : NextResponse.next();
  }

  const token = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
  const session = await verifySessionToken(token);

  if (!session) {
    if (isAdminApi) {
      return withNoCache(withNoIndex(NextResponse.json({ error: "Unauthorized" }, { status: 401 })));
    }
    const loginUrl = new URL("/admin/login", req.url);
    loginUrl.searchParams.set("next", pathname);
    return withNoCache(withNoIndex(NextResponse.redirect(loginUrl)));
  }

  const isUsersArea = pathname.startsWith("/admin/users") || pathname.startsWith("/api/admin/users");
  const isIndexingArea = pathname.startsWith("/admin/indexing") || pathname.startsWith("/api/admin/indexing");
  const isRedirectsArea = pathname.startsWith("/admin/redirects") || pathname.startsWith("/api/admin/redirects");
  if ((isUsersArea || isIndexingArea || isRedirectsArea) && session.role !== "admin") {
    if (isAdminApi) {
      return withNoCache(withNoIndex(NextResponse.json({ error: "Admins only." }, { status: 403 })));
    }
    return withNoCache(withNoIndex(NextResponse.redirect(new URL("/admin", req.url))));
  }

  if (session.role !== "admin") {
    const matched = PAGE_ROUTES.find((r) => r.test(pathname));
    if (matched && !session.pages.includes(matched.key)) {
      if (isAdminApi) {
        return withNoCache(
          withNoIndex(NextResponse.json({ error: "You don't have access to this section." }, { status: 403 }))
        );
      }
      return withNoCache(withNoIndex(NextResponse.redirect(new URL("/admin", req.url))));
    }
  }

  return withNoCache(withNoIndex(NextResponse.next()));
}

export const config = {
  // Also skip /images (static files in /public/images — museum/blog card
  // photos etc.) so those requests bypass this function entirely instead
  // of paying its cost (and, previously, getting a no-store header) on
  // every single asset load.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|images/).*)"],
};
