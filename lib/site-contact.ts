/** Контактные данные клиники (единый источник для сайта). */
export const SITE_CONTACT = {
  address: "г. Брест, просп. Республики, 16",
  phoneDisplay: "+375 (29) 239-22-27",
  phoneTel: "+375292392227",
  email: "info@clevermed.by",
  hours: [{ label: "Пн – Сб:", value: "07:30 – 20:00" }],
  licenseTitle: "Лицензия № М-8704",
  licenseErl: "Номер лицензии в ЕРЛ: 32250000082311",
  mapEmbedUrl:
    "https://yandex.ru/map-widget/v1/?um=constructor%3A4ba02846f5b5f3c1a9df7b05ab4a7732ab9de8367307c24f2f99c1a53bf61c4f&source=constructor",
} as const;

export type ContactHourRow = {
  label: string;
  value: string;
  highlight?: boolean;
};

export type ContactData = {
  address: string;
  phone: string;
  phoneTel: string;
  email: string;
  hours: ContactHourRow[];
  licenseTitle: string;
  licenseErl: string;
  mapEmbedUrl: string;
};

export const defaultContactData: ContactData = {
  address: SITE_CONTACT.address,
  phone: SITE_CONTACT.phoneDisplay,
  phoneTel: SITE_CONTACT.phoneTel,
  email: SITE_CONTACT.email,
  hours: [...SITE_CONTACT.hours],
  licenseTitle: SITE_CONTACT.licenseTitle,
  licenseErl: SITE_CONTACT.licenseErl,
  mapEmbedUrl: SITE_CONTACT.mapEmbedUrl,
};
