"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export type AdminNavLink = {
  href: string;
  label: string;
};

export type AdminNavGroup = {
  label: string;
  children: AdminNavLink[];
  /** Если не задан — пункт только раскрывает подменю, без перехода */
  href?: string;
};

export type AdminNavEntry = AdminNavLink | AdminNavGroup;

export function isNavGroup(entry: AdminNavEntry): entry is AdminNavGroup {
  return "children" in entry;
}

function isActive(pathname: string, href: string) {
  if (href === "/admin") {
    return pathname === "/admin" || pathname === "/admin/";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

function isGroupActive(pathname: string, group: AdminNavGroup) {
  return (
    (group.href != null && isActive(pathname, group.href)) ||
    group.children.some((child) => isActive(pathname, child.href))
  );
}

const linkClass =
  "rounded-lg px-3 py-2 text-sm font-medium text-primary-dark/80 transition-colors hover:bg-secondary-mint hover:text-primary-green";
const linkActiveClass = "bg-secondary-mint text-primary-green";
const subLinkClass =
  "rounded-lg py-1.5 pr-3 pl-6 text-sm text-primary-dark/70 transition-colors hover:bg-secondary-mint hover:text-primary-green";
const subLinkActiveClass = "bg-secondary-mint/80 font-medium text-primary-green";

type AdminSidebarProps = {
  nav: AdminNavEntry[];
  userBlock: React.ReactNode;
  logoutForm: React.ReactNode;
};

export function AdminSidebar({ nav, userBlock, logoutForm }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-neutral-border bg-white p-6">
      <Link
        href="/admin"
        className="admin-sidebar__logo mb-6 block"
        aria-label="Clevermed — админ-панель"
      >
        <Image
          src="/images/logo-dark.svg"
          alt="Clevermed"
          width={163}
          height={57}
          className="h-10 w-auto max-w-[180px]"
          priority
          unoptimized
        />
      </Link>

      {userBlock}

      <nav className="flex flex-col gap-1" aria-label="Меню админ-панели">
        {nav.map((entry) => {
          if (isNavGroup(entry)) {
            const groupActive = isGroupActive(pathname, entry);
            return (
              <div key={entry.label} className="flex flex-col gap-0.5">
                {entry.href ? (
                  <Link
                    href={entry.href}
                    className={cn(linkClass, groupActive && linkActiveClass)}
                  >
                    {entry.label}
                  </Link>
                ) : (
                  <span
                    className={cn(
                      "rounded-lg px-3 py-2 text-sm font-semibold",
                      groupActive
                        ? "text-primary-green"
                        : "text-primary-dark/80",
                    )}
                  >
                    {entry.label}
                  </span>
                )}
                <div className="ml-1 flex flex-col gap-0.5 border-l border-neutral-border/80 pl-1">
                  {entry.children.map((child) => (
                    <Link
                      key={child.href}
                      href={child.href}
                      className={cn(
                        subLinkClass,
                        isActive(pathname, child.href) && subLinkActiveClass,
                      )}
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              </div>
            );
          }

          return (
            <Link
              key={entry.href}
              href={entry.href}
              className={cn(
                linkClass,
                isActive(pathname, entry.href) && linkActiveClass,
              )}
            >
              {entry.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-8">{logoutForm}</div>
      <Link
        href="/"
        className="mt-4 block text-sm text-primary-green hover:underline"
      >
        ← На сайт
      </Link>
    </aside>
  );
}
