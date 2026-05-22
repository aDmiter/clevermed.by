import "dotenv/config";
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma";

async function main() {
  const adminLogin = (process.env.ADMIN_LOGIN ?? "superadmin").replace(
    /^"|"$/g,
    "",
  );
  const adminPassword = (process.env.ADMIN_PASSWORD ?? "").replace(
    /^"|"$/g,
    "",
  );

  console.log("AUTH_SECRET set:", Boolean(process.env.AUTH_SECRET));
  console.log("AUTH_URL:", process.env.AUTH_URL);
  console.log("ADMIN_LOGIN:", adminLogin);

  const users = await prisma.user.findMany({
    include: { permissions: true },
  });

  for (const u of users) {
    const passOk = adminPassword
      ? await bcrypt.compare(adminPassword, u.passwordHash)
      : false;
    const locked =
      u.lockedUntil && u.lockedUntil.getTime() > Date.now();

    console.log({
      login: u.login,
      email: u.email,
      role: u.role,
      isActive: u.isActive,
      locked,
      failedLoginAttempts: u.failedLoginAttempts,
      passwordMatchesEnv: passOk,
      permissionsCount: u.permissions.length,
    });
  }

  const byLogin = await prisma.user.findFirst({
    where: {
      OR: [
        { login: adminLogin.toLowerCase() },
        { email: adminLogin.toLowerCase() },
      ],
    },
  });
  console.log("findByLoginOrEmail:", byLogin ? byLogin.login : null);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
