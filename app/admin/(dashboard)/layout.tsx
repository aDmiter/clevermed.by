import { signOut } from "@/auth";
import {
  AdminSidebar,
  type AdminNavEntry,
  type AdminNavGroup,
  type AdminNavLink,
} from "@/components/admin/admin-sidebar";
import { OnlineBookingsQueueBell } from "@/components/admin/online-bookings-queue-bell";
import {
  hasPermission,
  isSuperAdmin,
  type AdminSection,
} from "@/lib/auth/rbac";
import { getAuthUser } from "@/lib/auth/require-permission";
import { prisma } from "@/lib/prisma";
import { getSiteSettings } from "@/lib/site-settings-server";
import { redirect } from "next/navigation";

async function getOnlineQueueCount(): Promise<number> {
  try {
    return await prisma.appointment.count({
      where: { source: "ONLINE", status: "SCHEDULED" },
    });
  } catch {
    return 0;
  }
}

type NavDef = {
  href: string;
  label: string;
  section: AdminSection;
  requiresOnlineBooking?: boolean;
};

const topNavDefs: NavDef[] = [
  { href: "/admin", label: "Дашборд", section: "DASHBOARD" },
  { href: "/admin/services", label: "Услуги", section: "SERVICES" },
  { href: "/admin/doctors", label: "Врачи", section: "DOCTORS" },
  {
    href: "/admin/online-bookings",
    label: "Запись онлайн",
    section: "ONLINE_BOOKINGS",
    requiresOnlineBooking: true,
  },
  { href: "/admin/appointments", label: "Запись на приём", section: "APPOINTMENTS" },
  { href: "/admin/content", label: "Контент", section: "CONTENT" },
];

const settingsChildrenDefs: { href: string; label: string; section: AdminSection }[] =
  [
    { href: "/admin/settings/general", label: "Общие", section: "SETTINGS" },
    { href: "/admin/settings/analytics", label: "Аналитика", section: "SETTINGS" },
    { href: "/admin/seo", label: "SEO / Meta", section: "SEO" },
    { href: "/admin/users", label: "Пользователи", section: "USERS" },
  ];

function filterNavLink(
  def: NavDef,
  authUser: Parameters<typeof hasPermission>[0],
  onlineBookingEnabled: boolean,
): AdminNavLink | null {
  if (def.requiresOnlineBooking && !onlineBookingEnabled) return null;
  if (!hasPermission(authUser, def.section, false)) return null;
  return { href: def.href, label: def.label };
}

function buildSettingsGroup(
  authUser: Parameters<typeof hasPermission>[0],
): AdminNavGroup | null {
  const children = settingsChildrenDefs
    .filter((def) => hasPermission(authUser, def.section, false))
    .map(({ href, label }) => ({ href, label }));

  if (children.length === 0) return null;

  return {
    label: "Настройки",
    children,
  };
}

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const authUser = await getAuthUser();
  if (!authUser) redirect("/admin/login");

  const [onlineQueueCount, siteSettings] = await Promise.all([
    getOnlineQueueCount(),
    getSiteSettings(),
  ]);

  const nav: AdminNavEntry[] = [];

  for (const def of topNavDefs) {
    const link = filterNavLink(def, authUser, siteSettings.onlineBookingEnabled);
    if (link) nav.push(link);
  }

  const settingsGroup = buildSettingsGroup(authUser);
  if (settingsGroup) nav.push(settingsGroup);

  const roleLabel = isSuperAdmin(authUser.role)
    ? "Суперадминистратор"
    : "Администратор";

  const userBlock = (
    <p className="mb-6 rounded-xl bg-secondary-mint/40 px-3 py-2 text-xs text-primary-dark/80">
      <span className="block font-semibold text-primary-dark">
        {authUser.lastName} {authUser.firstName}
      </span>
      <span className="text-primary-dark/60">@{authUser.login}</span>
      <span className="mt-1 block text-primary-green">{roleLabel}</span>
    </p>
  );

  const logoutForm = (
    <form
      action={async () => {
        "use server";
        await signOut({ redirectTo: "/admin/login" });
      }}
    >
      <button
        type="submit"
        className="text-sm text-primary-dark/60 hover:text-accent-warmth"
      >
        Выйти
      </button>
    </form>
  );

  return (
    <div className="flex min-h-screen">
      <AdminSidebar nav={nav} userBlock={userBlock} logoutForm={logoutForm} />
      <div className="relative flex flex-1 flex-col">
        {siteSettings.onlineBookingEnabled &&
        hasPermission(authUser, "ONLINE_BOOKINGS", false) ? (
          <OnlineBookingsQueueBell initialCount={onlineQueueCount} />
        ) : null}
        <main className="flex-1 p-8 pr-16">{children}</main>
      </div>
    </div>
  );
}
