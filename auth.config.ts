import type { NextAuthConfig } from "next-auth";
import type { SessionPermission } from "@/lib/auth/rbac";

export const authConfig = {
  pages: {
    signIn: "/admin/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 8 * 60 * 60,
    updateAge: 60 * 60,
  },
  providers: [],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id ?? token.sub;
        token.login = user.login;
        token.email = user.email;
        token.firstName = user.firstName;
        token.lastName = user.lastName;
        token.role = user.role;
        token.permissions = user.permissions;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = String(token.id);
        session.user.login = String(token.login ?? "");
        session.user.email = String(token.email ?? "");
        session.user.firstName = String(token.firstName ?? "");
        session.user.lastName = String(token.lastName ?? "");
        session.user.role =
          (token.role as typeof session.user.role) ?? "ADMIN";
        session.user.permissions =
          (token.permissions as SessionPermission[] | undefined) ?? [];
        session.user.name = [token.firstName, token.lastName]
          .filter(Boolean)
          .join(" ");
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
