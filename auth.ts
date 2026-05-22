import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";
import { authConfig } from "@/auth.config";
import {
  isAccountLocked,
  isIpRateLimited,
  recordLoginAttempt,
  registerFailedLogin,
  resetFailedLogins,
} from "@/lib/auth/login-security";
import { verifyPasswordSafe } from "@/lib/auth/password";
import { toAuthUser, findUserByLoginOrEmail } from "@/lib/auth/user-repository";

const credentialsSchema = z.object({
  login: z.string().min(1).max(128),
  password: z.string().min(1).max(128),
});

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  trustHost: true,
  secret: process.env.AUTH_SECRET,
  providers: [
    Credentials({
      credentials: {
        login: { label: "Логин", type: "text" },
        password: { label: "Пароль", type: "password" },
      },
      async authorize(credentials, request) {
        const parsed = credentialsSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { login, password } = parsed.data;
        const ip =
          request?.headers?.get("x-forwarded-for")?.split(",")[0]?.trim() ??
          request?.headers?.get("x-real-ip") ??
          null;
        const userAgent = request?.headers?.get("user-agent") ?? null;

        if (await isIpRateLimited(ip)) {
          await recordLoginAttempt({
            login,
            success: false,
            ip,
            userAgent,
          });
          return null;
        }

        let user: Awaited<ReturnType<typeof findUserByLoginOrEmail>> = null;

        try {
          user = await findUserByLoginOrEmail(login);
        } catch (error) {
          console.error("[auth] Database error:", error);
          await recordLoginAttempt({
            login,
            success: false,
            ip,
            userAgent,
          });
          return null;
        }

        if (!user || !user.isActive) {
          await verifyPasswordSafe(password, null);
          await recordLoginAttempt({
            login,
            success: false,
            ip,
            userAgent,
          });
          return null;
        }

        if (isAccountLocked(user.lockedUntil)) {
          await recordLoginAttempt({
            login,
            success: false,
            ip,
            userAgent,
          });
          return null;
        }

        const valid = await verifyPasswordSafe(password, user.passwordHash);

        if (!valid) {
          await registerFailedLogin(user.id);
          await recordLoginAttempt({
            login,
            success: false,
            ip,
            userAgent,
          });
          return null;
        }

        await resetFailedLogins(user.id);
        await recordLoginAttempt({
          login: user.login,
          success: true,
          ip,
          userAgent,
        });

        const authUser = toAuthUser(user);
        return {
          id: authUser.id,
          login: authUser.login,
          email: authUser.email,
          firstName: authUser.firstName,
          lastName: authUser.lastName,
          role: authUser.role,
          permissions: authUser.permissions,
        };
      },
    }),
  ],
});
