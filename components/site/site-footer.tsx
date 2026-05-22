import Image from "next/image";
import Link from "next/link";
import { SITE_CONTACT } from "@/lib/site-contact";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer__grid container mx-auto px-6">
        <div className="site-footer__brand">
          <Link
            href="/"
            className="site-footer__logo"
            aria-label="Clevermed — на главную"
          >
            <Image
              src="/images/logo-light.svg"
              alt="Clevermed"
              width={168}
              height={57}
              className="site-footer__logo-img"
              unoptimized
            />
          </Link>
          <p className="site-footer__tagline">
            Неврология и диагностика в концепции OrganiTech — ясность, забота и
            технологичная прозрачность.
          </p>
          <p className="site-footer__license">
            {SITE_CONTACT.licenseTitle}
            <br />
            {SITE_CONTACT.licenseErl}
          </p>
        </div>

        <div className="site-footer__column">
          <p className="site-footer__title">Навигация</p>
          <ul className="site-footer__list">
            <li>
              <Link href="/services" className="site-footer__link">
                Услуги
              </Link>
            </li>
            <li>
              <Link href="/prices" className="site-footer__link">
                Цены
              </Link>
            </li>
            <li>
              <Link href="/doctors" className="site-footer__link">
                Врачи
              </Link>
            </li>
            <li>
              <Link href="/contacts" className="site-footer__link">
                Контакты
              </Link>
            </li>
          </ul>
        </div>

        <div className="site-footer__column">
          <p className="site-footer__title">Контакты</p>
          <ul className="site-footer__list">
            <li>
              <a
                href={`tel:${SITE_CONTACT.phoneTel}`}
                className="site-footer__link"
              >
                {SITE_CONTACT.phoneDisplay}
              </a>
            </li>
            <li>
              <a
                href={`mailto:${SITE_CONTACT.email}`}
                className="site-footer__link"
              >
                {SITE_CONTACT.email}
              </a>
            </li>
            <li className="site-footer__text">{SITE_CONTACT.address}</li>
            <li className="site-footer__text">
              {SITE_CONTACT.hours[0].label} {SITE_CONTACT.hours[0].value}
            </li>
          </ul>
        </div>
      </div>

      <div className="site-footer__bottom">
        © {new Date().getFullYear()} Clevermed. Все права защищены.
      </div>
    </footer>
  );
}
