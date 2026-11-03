import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

// Reached without a session: the login page, Auth.js itself, and the cron jobs
// (those check their own x-cron-key).
const PUBLIC_PREFIXES = ["/login", "/api/auth", "/api/cron"];

export async function middleware(req: NextRequest) {
  const { nextUrl } = req;

  if (PUBLIC_PREFIXES.some((prefix) => nextUrl.pathname.startsWith(prefix))) {
    return NextResponse.next();
  }

  // The signature is checked, not just the cookie's presence: the admin's
  // server actions have no check of their own, so this is the only gate.
  const secure = process.env.NODE_ENV !== "development";
  const token = await getToken({
    req,
    secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
    secureCookie: secure,
    salt: secure ? "__Secure-authjs.session-token" : "authjs.session-token",
  });

  if (!token?.id) {
    if (nextUrl.pathname.startsWith("/api")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/login", nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.svg|.*\\.png|.*\\.jpg|fonts|images|public).*)",
  ],
};

export const loginPageRoute = "/login";
