"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { useSiteBooking } from "@/components/providers/site-booking-provider";
import { SITE_CONTACT } from "@/lib/site-contact";
import { getServiceBySlug, SERVICE_NAV_ITEMS } from "@/lib/services-catalog";
import { SERVICE_ICONS } from "@/lib/service-icons";

const navItems = [
  { href: "/prices", label: "Цены" },
  { href: "/doctors", label: "Врачи" },
  { href: "/about", label: "О нас" },
  { href: "/contacts", label: "Контакты" },
];

function isServicesActive(pathname: string) {
  return pathname === "/services" || pathname.startsWith("/services/");
}

function ServiceSubmenuIcon({ slug }: { slug: string }) {
  const iconKey = getServiceBySlug(slug)?.icon ?? "brain";
  const Icon = SERVICE_ICONS[iconKey];
  return (
    <span className="site-header__submenu-icon" aria-hidden>
      <Icon size={18} />
    </span>
  );
}

export function SiteHeader() {
  const { bookHref } = useSiteBooking();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const servicesActive = isServicesActive(pathname);

  useEffect(() => {
    setServicesOpen(false);
    setOpen(false);
  }, [pathname]);

  const closeServicesMenu = () => {
    setServicesOpen(false);
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  };

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
          <div
            className={cn(
              "site-header__nav-item",
              servicesOpen && "site-header__nav-item--open",
            )}
            onMouseEnter={() => setServicesOpen(true)}
            onMouseLeave={() => setServicesOpen(false)}
          >
            <Link
              href="/services"
              onClick={closeServicesMenu}
              className={cn(
                "site-header__link site-header__link--has-submenu",
                servicesActive && "site-header__link--active",
              )}
            >
              Услуги
              <ChevronDown
                size={14}
                className={cn(
                  "site-header__chevron",
                  servicesOpen && "site-header__chevron--open",
                )}
                aria-hidden
              />
            </Link>
            <ul className="site-header__submenu" role="list">
              {SERVICE_NAV_ITEMS.map((item) => (
                <li key={item.slug}>
                  <Link
                    href={item.href}
                    onClick={closeServicesMenu}
                    className={cn(
                      "site-header__submenu-link",
                      pathname === item.href && "site-header__submenu-link--active",
                    )}
                  >
                    <ServiceSubmenuIcon slug={item.slug} />
                    <span>{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

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

        <div className="site-header__actions">
          <a href={`tel:${SITE_CONTACT.phoneTel}`} className="site-header__phone">
            {SITE_CONTACT.phoneDisplay}
          </a>
          <Link href={bookHref} className="site-header__cta">
            Записаться
          </Link>
        </div>

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
            <li>
              <button
                type="button"
                className={cn(
                  "site-header__mobile-services-trigger",
                  servicesActive && "site-header__mobile-link--active",
                )}
                onClick={() => setServicesOpen((v) => !v)}
                aria-expanded={servicesOpen}
              >
                Услуги
                <ChevronDown
                  size={18}
                  className={cn(
                    "site-header__chevron",
                    servicesOpen && "site-header__chevron--open",
                  )}
                />
              </button>
              {servicesOpen && (
                <ul className="site-header__mobile-submenu">
                  <li>
                    <Link
                      href="/services"
                      onClick={() => {
                        setOpen(false);
                        closeServicesMenu();
                      }}
                      className="site-header__mobile-sublink"
                    >
                      Все услуги
                    </Link>
                  </li>
                  {SERVICE_NAV_ITEMS.map((item) => (
                    <li key={item.slug}>
                      <Link
                        href={item.href}
                        onClick={() => {
                          setOpen(false);
                          closeServicesMenu();
                        }}
                        className={cn(
                          "site-header__mobile-sublink",
                          pathname === item.href &&
                            "site-header__mobile-sublink--active",
                        )}
                      >
                        <ServiceSubmenuIcon slug={item.slug} />
                        <span>{item.label}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>
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
              <a
                href={`tel:${SITE_CONTACT.phoneTel}`}
                className="site-header__mobile-phone"
                onClick={() => setOpen(false)}
              >
                {SITE_CONTACT.phoneDisplay}
              </a>
            </li>
            <li>
              <Link
                href={bookHref}
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
