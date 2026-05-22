/**
 * Сброс пароля суперадмина из .env (ADMIN_LOGIN / ADMIN_PASSWORD).
 * Запуск: npx tsx scripts/reset-admin-password.ts
 */
import "dotenv/config";
import { prisma } from "../lib/prisma";
import { hashPassword } from "../lib/auth/password";

async function main() {
  const login = (process.env.ADMIN_LOGIN ?? "superadmin")
    .replace(/^"|"$/g, "")
    .toLowerCase();
  const email = (process.env.ADMIN_EMAIL ?? "admin@clevermed.by")
    .replace(/^"|"$/g, "")
    .toLowerCase();
  const password = process.env.ADMIN_PASSWORD ?? "ChangeMe!Secure2026";

  const passwordHash = await hashPassword(password.replace(/^"|"$/g, ""));

  await prisma.user.upsert({
    where: { email },
    update: {
      login,
      passwordHash,
      role: "SUPER_ADMIN",
      isActive: true,
      failedLoginAttempts: 0,
      lockedUntil: null,
      firstName: "Супер",
      lastName: "Администратор",
    },
    create: {
      login,
      email,
      firstName: "Супер",
      lastName: "Администратор",
      passwordHash,
      role: "SUPER_ADMIN",
      isActive: true,
    },
  });

  console.log(`OK: superadmin login="${login}" email="${email}"`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
