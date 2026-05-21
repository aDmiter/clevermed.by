import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";

export default NextAuth({
  ...authConfig,
  trustHost: true,
  secret: process.env.AUTH_SECRET,
}).auth;

export const config = {
  matcher: ["/admin/:path*"],
};
