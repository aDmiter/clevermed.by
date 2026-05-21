"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Главная" },
  { href: "/services", label: "Услуги" },
  { href: "/prices", label: "Цены" },
  { href: "/doctors", label: "Врачи" },
  { href: "/about", label: "О нас" },
  { href: "/reviews", label: "Отзывы" },
  { href: "/contacts", label: "Контакты" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="site-header">
      <div className="site-header__inner container mx-auto px-6">
        <Link
          href="/"
          className="site-header__logo"
          aria-label="Clevermed — на главную"
        >
          <Image
            src="/images/logo-dark.svg"
            alt="Clevermed"
            width={163}
            height={57}
            className="site-header__logo-img"
            priority
            unoptimized
          />
        </Link>

        <nav className="site-header__nav" aria-label="Основное меню">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "site-header__link",
                pathname === item.href && "site-header__link--active",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <Link href="/booking" className="site-header__cta">
          Записаться
        </Link>

        <button
          type="button"
          className="site-header__toggle"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Закрыть меню" : "Открыть меню"}
          aria-expanded={open}
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {open && (
        <nav
          className="site-header__mobile-nav lg:hidden"
          aria-label="Мобильное меню"
        >
          <ul className="site-header__mobile-list">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "site-header__mobile-link",
                    pathname === item.href && "site-header__mobile-link--active",
                  )}
                >
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/booking"
                onClick={() => setOpen(false)}
                className="site-header__mobile-cta"
              >
                Записаться
              </Link>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
