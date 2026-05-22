import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/auth.config";

/**
 * Edge-safe middleware: только auth.config, без Prisma (auth.ts тянет node:path).
 * Права по разделам проверяются в app/admin/(dashboard)/layout.tsx на сервере.
 */
const { auth } = NextAuth({
  ...authConfig,
  trustHost: true,
  secret: process.env.AUTH_SECRET,
});

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const loggedIn = Boolean(req.auth?.user);

  if (pathname === "/admin/login") {
    if (loggedIn) {
      return NextResponse.redirect(new URL("/admin", req.nextUrl.origin));
    }
    return NextResponse.next();
  }

  if (!loggedIn) {
    const loginUrl = new URL("/admin/login", req.nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-pathname", pathname);

  return NextResponse.next({
    request: { headers: requestHeaders },
  });
});

export const config = {
  matcher: ["/admin/:path*"],
};
