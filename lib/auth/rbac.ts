import type { AdminSection, UserRole } from "@/app/generated/prisma/client";

export type { AdminSection, UserRole };

export type PermissionFlags = { canRead: boolean; canWrite: boolean };

export type SessionPermission = {
  section: AdminSection;
  canRead: boolean;
  canWrite: boolean;
};

export type AuthUser = {
  id: string;
  login: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  permissions: SessionPermission[];
};

export const ADMIN_SECTION_META: Record<
  AdminSection,
  { label: string; path: string; description: string }
> = {
  DASHBOARD: {
    label: "Дашборд",
    path: "/admin",
    description: "Главная панель",
  },
  SERVICES: {
    label: "Услуги",
    path: "/admin/services",
    description: "Категории и прайс услуг",
  },
  DOCTORS: {
    label: "Врачи",
    path: "/admin/doctors",
    description: "Профили и расписание врачей",
  },
  ONLINE_BOOKINGS: {
    label: "Запись онлайн",
    path: "/admin/online-bookings",
    description: "Очередь онлайн-заявок",
  },
  APPOINTMENTS: {
    label: "Запись на приём",
    path: "/admin/appointments",
    description: "Календарь записей",
  },
  SETTINGS: {
    label: "Настройки сайта",
    path: "/admin/settings/general",
    description: "Общие параметры, аналитика, длительности приёма",
  },
  SEO: {
    label: "SEO / Meta",
    path: "/admin/seo",
    description: "Мета-теги страниц",
  },
  REVIEWS: {
    label: "Отзывы",
    path: "/admin/reviews",
    description: "Модерация отзывов",
  },
  CONTENT: {
    label: "Контент",
    path: "/admin/content",
    description: "О нас, контакты, партнёры",
  },
  USERS: {
    label: "Пользователи",
    path: "/admin/users",
    description: "Учётные записи и права",
  },
};

export const ALL_ADMIN_SECTIONS = Object.keys(
  ADMIN_SECTION_META,
) as AdminSection[];

/** Порядок чекбоксов в форме прав */
export const PERMISSION_SECTIONS_ORDER: AdminSection[] = [
  "DASHBOARD",
  "SERVICES",
  "DOCTORS",
  "ONLINE_BOOKINGS",
  "APPOINTMENTS",
  "SETTINGS",
  "SEO",
  "REVIEWS",
  "CONTENT",
  "USERS",
];

const PATH_TO_SECTION: { prefix: string; section: AdminSection }[] = [
  { prefix: "/admin/users", section: "USERS" },
  { prefix: "/admin/services", section: "SERVICES" },
  { prefix: "/admin/doctors", section: "DOCTORS" },
  { prefix: "/admin/online-bookings", section: "ONLINE_BOOKINGS" },
  { prefix: "/admin/appointments", section: "APPOINTMENTS" },
  { prefix: "/admin/settings", section: "SETTINGS" },
  { prefix: "/admin/seo", section: "SEO" },
  { prefix: "/admin/reviews", section: "REVIEWS" },
  { prefix: "/admin/content", section: "CONTENT" },
  { prefix: "/admin", section: "DASHBOARD" },
];

export function pathnameToSection(pathname: string): AdminSection | null {
  if (!pathname.startsWith("/admin")) return null;
  if (pathname === "/admin/login") return null;

  const match = PATH_TO_SECTION.find((entry) => {
    if (entry.prefix === "/admin") {
      return pathname === "/admin" || pathname === "/admin/";
    }
    return pathname === entry.prefix || pathname.startsWith(`${entry.prefix}/`);
  });

  return match?.section ?? "DASHBOARD";
}

export function isSuperAdmin(role: UserRole): boolean {
  return role === "SUPER_ADMIN";
}

export function hasPermission(
  user: Pick<AuthUser, "role" | "permissions">,
  section: AdminSection,
  needWrite = false,
): boolean {
  if (isSuperAdmin(user.role)) return true;

  const perm = user.permissions.find((p) => p.section === section);
  if (!perm) return false;
  return needWrite ? perm.canWrite : perm.canRead;
}

export function canManageUsers(user: Pick<AuthUser, "role" | "permissions">): boolean {
  return isSuperAdmin(user.role) || hasPermission(user, "USERS", true);
}

export function canAssignSuperAdmin(actor: Pick<AuthUser, "role">): boolean {
  return isSuperAdmin(actor.role);
}

export function emptyPermissions(): SessionPermission[] {
  return ALL_ADMIN_SECTIONS.map((section) => ({
    section,
    canRead: false,
    canWrite: false,
  }));
}
