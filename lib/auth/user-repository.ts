import type { User } from "@/app/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import type { AuthUser, SessionPermission } from "@/lib/auth/rbac";

export async function findUserByLoginOrEmail(
  identifier: string,
): Promise<
  | (User & {
      permissions: { section: string; canRead: boolean; canWrite: boolean }[];
    })
  | null
> {
  const normalized = identifier.trim().toLowerCase();

  return prisma.user.findFirst({
    where: {
      OR: [{ login: normalized }, { email: normalized }],
    },
    include: { permissions: true },
  });
}

export function toAuthUser(
  user: User & {
    permissions: { section: string; canRead: boolean; canWrite: boolean }[];
  },
): AuthUser {
  return {
    id: user.id,
    login: user.login,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    permissions: user.permissions.map(
      (p) =>
        ({
          section: p.section,
          canRead: p.canRead,
          canWrite: p.canWrite,
        }) as SessionPermission,
    ),
  };
}

export async function loadAuthUserById(id: string): Promise<AuthUser | null> {
  const user = await prisma.user.findUnique({
    where: { id },
    include: { permissions: true },
  });
  if (!user || !user.isActive) return null;
  return toAuthUser(user);
}
