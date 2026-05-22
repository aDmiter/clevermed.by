import { auth } from "@/auth";
import type { AdminSection } from "@/app/generated/prisma/client";
import {
  hasPermission,
  pathnameToSection,
  type AuthUser,
} from "@/lib/auth/rbac";
import { loadAuthUserById } from "@/lib/auth/user-repository";
import { redirect } from "next/navigation";

/** Актуальный пользователь из БД (роль и права не зависят от урезанной JWT-сессии). */
export async function getAuthUser(): Promise<AuthUser | null> {
  const session = await auth();
  if (!session?.user?.id) return null;

  const fromDb = await loadAuthUserById(session.user.id);
  if (fromDb) return fromDb;

  return {
    id: session.user.id,
    login: session.user.login ?? "",
    email: session.user.email ?? "",
    firstName: session.user.firstName ?? "",
    lastName: session.user.lastName ?? "",
    role: session.user.role ?? "ADMIN",
    permissions: session.user.permissions ?? [],
  };
}

export async function requireAuth(): Promise<AuthUser> {
  const user = await getAuthUser();
  if (!user) redirect("/admin/login");
  return user;
}

export async function requirePermission(
  section: AdminSection,
  needWrite = false,
): Promise<AuthUser> {
  const user = await requireAuth();
  if (!hasPermission(user, section, needWrite)) {
    redirect("/admin?error=forbidden");
  }
  return user;
}

export async function requirePathPermission(
  pathname: string,
  needWrite = false,
): Promise<AuthUser> {
  const section = pathnameToSection(pathname);
  if (!section) return requireAuth();
  return requirePermission(section, needWrite);
}
