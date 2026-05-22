"use server";

import { revalidatePath } from "next/cache";
import type { AdminSection, UserRole } from "@/app/generated/prisma/client";
import {
  canAssignSuperAdmin,
  canManageUsers,
  PERMISSION_SECTIONS_ORDER,
} from "@/lib/auth/rbac";
import { hashPassword, loginSchema, passwordSchema } from "@/lib/auth/password";
import { requireAuth, requirePermission } from "@/lib/auth/require-permission";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const permissionInputSchema = z.record(
  z.string(),
  z.object({
    canRead: z.boolean(),
    canWrite: z.boolean(),
  }),
);

const userFormSchema = z.object({
  login: loginSchema,
  email: z.string().email("Некорректный email"),
  firstName: z.string().min(1, "Укажите имя").max(80),
  lastName: z.string().min(1, "Укажите фамилию").max(80),
  role: z.enum(["SUPER_ADMIN", "ADMIN"]),
  isActive: z.boolean(),
  password: z.string().optional(),
  permissions: permissionInputSchema.optional(),
});

function normalizePermissions(
  raw: z.infer<typeof permissionInputSchema> | undefined,
  role: UserRole,
) {
  if (role === "SUPER_ADMIN") return [];

  return PERMISSION_SECTIONS_ORDER.map((section) => {
    const flags = raw?.[section];
    return {
      section: section as AdminSection,
      canRead: Boolean(flags?.canRead),
      canWrite: Boolean(flags?.canWrite),
    };
  }).filter((p) => p.canRead || p.canWrite);
}

export async function createAdminUser(formData: FormData) {
  const actor = await requirePermission("USERS", true);
  if (!canManageUsers(actor)) {
    return { error: "Недостаточно прав" };
  }

  const password = formData.get("password");
  const parsed = userFormSchema.safeParse({
    login: formData.get("login"),
    email: formData.get("email"),
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    role: formData.get("role"),
    isActive: formData.get("isActive") === "true",
    password: typeof password === "string" && password.length > 0 ? password : undefined,
    permissions: parsePermissionsJson(formData.get("permissions")),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Некорректные данные" };
  }

  const data = parsed.data;

  if (data.role === "SUPER_ADMIN" && !canAssignSuperAdmin(actor)) {
    return { error: "Только суперадминистратор может назначать роль суперадминистратора" };
  }

  if (!data.password) {
    return { error: "Укажите пароль для нового пользователя" };
  }

  const passwordCheck = passwordSchema.safeParse(data.password);
  if (!passwordCheck.success) {
    return { error: passwordCheck.error.issues[0]?.message };
  }

  const login = data.login.trim().toLowerCase();
  const email = data.email.trim().toLowerCase();

  try {
    const passwordHash = await hashPassword(data.password);
    const permissions = normalizePermissions(data.permissions, data.role);

    await prisma.user.create({
      data: {
        login,
        email,
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        role: data.role,
        isActive: data.isActive,
        passwordHash,
        permissions: {
          create: permissions,
        },
      },
    });

    revalidatePath("/admin/users");
    return { success: true };
  } catch {
    return { error: "Логин или email уже заняты" };
  }
}

export async function updateAdminUser(userId: string, formData: FormData) {
  const actor = await requirePermission("USERS", true);
  if (!canManageUsers(actor)) {
    return { error: "Недостаточно прав" };
  }

  const password = formData.get("password");
  const parsed = userFormSchema.safeParse({
    login: formData.get("login"),
    email: formData.get("email"),
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    role: formData.get("role"),
    isActive: formData.get("isActive") === "true",
    password: typeof password === "string" && password.length > 0 ? password : undefined,
    permissions: parsePermissionsJson(formData.get("permissions")),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Некорректные данные" };
  }

  const data = parsed.data;
  const target = await prisma.user.findUnique({ where: { id: userId } });
  if (!target) return { error: "Пользователь не найден" };

  if (target.role === "SUPER_ADMIN" && !canAssignSuperAdmin(actor)) {
    return { error: "Нельзя редактировать суперадминистратора" };
  }

  if (data.role === "SUPER_ADMIN" && !canAssignSuperAdmin(actor)) {
    return { error: "Только суперадминистратор может назначать роль суперадминистратора" };
  }

  if (typeof data.password === "string") {
    const passwordCheck = passwordSchema.safeParse(data.password);
    if (!passwordCheck.success) {
      return { error: passwordCheck.error.issues[0]?.message };
    }
  }

  const login = data.login.trim().toLowerCase();
  const email = data.email.trim().toLowerCase();
  const permissions = normalizePermissions(data.permissions, data.role);

  try {
    await prisma.$transaction(async (tx) => {
      await tx.userPermission.deleteMany({ where: { userId } });

      await tx.user.update({
        where: { id: userId },
        data: {
          login,
          email,
          firstName: data.firstName.trim(),
          lastName: data.lastName.trim(),
          role: data.role,
          isActive: data.isActive,
          ...(data.password
            ? {
                passwordHash: await hashPassword(data.password),
                passwordChangedAt: new Date(),
                failedLoginAttempts: 0,
                lockedUntil: null,
              }
            : {}),
          permissions: {
            create: permissions,
          },
        },
      });
    });

    revalidatePath("/admin/users");
    return { success: true };
  } catch {
    return { error: "Логин или email уже заняты" };
  }
}

export async function unlockAdminUser(userId: string) {
  await requirePermission("USERS", true);

  await prisma.user.update({
    where: { id: userId },
    data: { failedLoginAttempts: 0, lockedUntil: null },
  });

  revalidatePath("/admin/users");
  return { success: true };
}

function parsePermissionsJson(value: FormDataEntryValue | null) {
  if (typeof value !== "string" || !value) return undefined;
  try {
    return JSON.parse(value) as z.infer<typeof permissionInputSchema>;
  } catch {
    return undefined;
  }
}
