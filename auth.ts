import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { authConfig } from "@/auth.config";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

async function authorizeWithDatabase(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return null;

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return null;

  return { id: user.id, email: user.email, name: user.name };
}

function authorizeWithEnv(email: string, password: string) {
  if (process.env.NODE_ENV === "production") return null;

  const adminEmail = process.env.ADMIN_EMAIL?.replace(/^"|"$/g, "");
  const adminPassword = process.env.ADMIN_PASSWORD?.replace(/^"|"$/g, "");
  if (!adminEmail || !adminPassword) return null;
  if (email !== adminEmail || password !== adminPassword) return null;

  return {
    id: "env-admin",
    email: adminEmail,
    name: "Администратор",
  };
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  trustHost: true,
  secret: process.env.AUTH_SECRET,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = credentialsSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;

        try {
          const fromDb = await authorizeWithDatabase(email, password);
          if (fromDb) return fromDb;
        } catch (error) {
          console.error("[auth] Database unavailable:", error);
        }

        return authorizeWithEnv(email, password);
      },
    }),
  ],
});
