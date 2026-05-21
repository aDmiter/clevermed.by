import { auth, signOut } from "@/auth";
import { OnlineBookingsQueueBell } from "@/components/admin/online-bookings-queue-bell";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
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

const adminNav = [
  { href: "/admin", label: "Дашборд" },
  { href: "/admin/services", label: "Услуги" },
  { href: "/admin/doctors", label: "Врачи" },
  { href: "/admin/online-bookings", label: "Запись онлайн" },
  { href: "/admin/appointments", label: "Запись на приём" },
  { href: "/admin/settings", label: "Настройки сайта" },
  { href: "/admin/reviews", label: "Отзывы" },
  { href: "/admin/content", label: "Контент" },
];

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");

  const onlineQueueCount = await getOnlineQueueCount();

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 shrink-0 border-r border-neutral-border bg-white p-6">
        <Link href="/admin" className="mb-8 block text-lg font-bold">
          Clever<span className="text-primary-green">med</span>
          <span className="mt-1 block text-xs font-normal text-primary-dark/50">
            Админ-панель
          </span>
        </Link>
        <nav className="flex flex-col gap-2">
          {adminNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-primary-dark/80 hover:bg-secondary-mint hover:text-primary-green"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/admin/login" });
          }}
          className="mt-8"
        >
          <button
            type="submit"
            className="text-sm text-primary-dark/60 hover:text-accent-warmth"
          >
            Выйти
          </button>
        </form>
        <Link
          href="/"
          className="mt-4 block text-sm text-primary-green hover:underline"
        >
          ← На сайт
        </Link>
      </aside>
      <div className="relative flex flex-1 flex-col">
        <OnlineBookingsQueueBell initialCount={onlineQueueCount} />
        <main className="flex-1 p-8 pr-16">{children}</main>
      </div>
    </div>
  );
}
