import { cookies } from "next/headers";
import { verifySessionToken, ADMIN_COOKIE_NAME, type Session } from "./auth";

export async function getSession(): Promise<Session | null> {
  const token = cookies().get(ADMIN_COOKIE_NAME)?.value;
  return verifySessionToken(token);
}
