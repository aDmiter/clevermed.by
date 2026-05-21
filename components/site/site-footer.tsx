import Image from "next/image";
import Link from "next/link";

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
              <a href="tel:+375291234567" className="site-footer__link">
                +375 (29) 123-45-67
              </a>
            </li>
            <li>
              <a href="mailto:info@clevermed.by" className="site-footer__link">
                info@clevermed.by
              </a>
            </li>
            <li className="site-footer__text">г. Минск, ул. Примерная, 1</li>
          </ul>
        </div>
      </div>

      <div className="site-footer__bottom">
        © {new Date().getFullYear()} Clevermed. Все права защищены.
      </div>
    </footer>
  );
}
