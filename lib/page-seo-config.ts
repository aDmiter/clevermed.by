import {
  SERVICE_NAV_ITEMS,
  SERVICES_CATALOG,
} from "@/lib/services-catalog";

export type PageSeoEntry = {
  path: string;
  label: string;
  defaultTitle: string;
  defaultDescription: string;
};

const STATIC_PAGES: PageSeoEntry[] = [
  {
    path: "/",
    label: "Главная",
    defaultTitle: "Clevermed — неврология и диагностика",
    defaultDescription:
      "Медицинский центр Clevermed: неврология, УЗИ, ЭНМГ и лабораторная диагностика в спокойной, технологичной среде.",
  },
  {
    path: "/services",
    label: "Услуги",
    defaultTitle: "Услуги",
    defaultDescription:
      "Направления медицинского центра Clevermed: неврология, УЗИ, ЭНМГ и лабораторная диагностика.",
  },
  {
    path: "/prices",
    label: "Цены",
    defaultTitle: "Цены",
    defaultDescription:
      "Актуальный прайс Clevermed: поиск по услугам, фильтр по категориям, прозрачная стоимость в BYN.",
  },
  {
    path: "/doctors",
    label: "Врачи",
    defaultTitle: "Врачи",
    defaultDescription:
      "Команда врачей Clevermed: неврологи и специалисты функциональной диагностики.",
  },
  {
    path: "/about",
    label: "О нас",
    defaultTitle: "О нас",
    defaultDescription:
      "Миссия и история медицинского центра Clevermed — неврология и диагностика в Минске.",
  },
  {
    path: "/contacts",
    label: "Контакты",
    defaultTitle: "Контакты",
    defaultDescription:
      "Адрес, телефон, email и часы работы медицинского центра Clevermed.",
  },
  {
    path: "/booking",
    label: "Запись на приём",
    defaultTitle: "Запись на приём",
    defaultDescription:
      "Онлайн-запись к врачам медицинского центра Clevermed.",
  },
  {
    path: "/reviews",
    label: "Отзывы",
    defaultTitle: "Отзывы",
    defaultDescription:
      "Отзывы пациентов о медицинском центре Clevermed.",
  },
];

const SERVICE_PAGES: PageSeoEntry[] = SERVICE_NAV_ITEMS.map((item) => {
  const content = SERVICES_CATALOG[item.slug];
  return {
    path: `/services/${item.slug}`,
    label: item.label,
    defaultTitle: content?.navLabel ?? item.label,
    defaultDescription: content?.heroDescription ?? "",
  };
});

export const PAGE_SEO_ENTRIES: PageSeoEntry[] = [
  ...STATIC_PAGES,
  ...SERVICE_PAGES,
];

export const PAGE_SEO_BY_PATH = new Map(
  PAGE_SEO_ENTRIES.map((entry) => [entry.path, entry]),
);

export const ALLOWED_PAGE_SEO_PATHS = new Set(
  PAGE_SEO_ENTRIES.map((entry) => entry.path),
);
