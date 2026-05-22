export type PriceListItem = {
  id: string;
  categoryId: string;
  categoryName: string;
  categorySlug: string;
  name: string;
  price: number;
  currency: string;
  includes: string[];
};

export type PriceCategoryFilter = {
  id: string;
  label: string;
  slug?: string;
};

export function formatPriceAmount(amount: number, currency: string): string {
  const value = amount.toLocaleString("ru-RU", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  if (currency === "BYN") return `${value} BYN`;
  return `${value} ${currency}`;
}

export const fallbackPriceCategories: PriceCategoryFilter[] = [
  { id: "all", label: "Все" },
  { id: "neurology", label: "Неврология", slug: "neurology" },
  { id: "ultrasound", label: "УЗИ-диагностика", slug: "ultrasound" },
  { id: "enmg", label: "ЭНМГ", slug: "enmg" },
  { id: "lab", label: "Анализы", slug: "lab" },
];

export const fallbackPriceItems: PriceListItem[] = [
  {
    id: "1",
    categoryId: "neurology",
    categoryName: "Неврология",
    categorySlug: "neurology",
    name: "Первичная консультация невролога",
    price: 66.59,
    currency: "BYN",
    includes: [
      "Сбор анамнеза",
      "Неврологический осмотр",
      "Предварительный диагноз и рекомендации",
    ],
  },
  {
    id: "2",
    categoryId: "ultrasound",
    categoryName: "УЗИ-диагностика",
    categorySlug: "ultrasound",
    name: "УЗИ брахиоцефальных артерий (БЦА)",
    price: 55.05,
    currency: "BYN",
    includes: [
      "Оценка сонных артерий",
      "Исследование позвоночных артерий",
      "Протокол исследования",
    ],
  },
  {
    id: "3",
    categoryId: "enmg",
    categoryName: "ЭНМГ",
    categorySlug: "enmg",
    name: "Электромиография с исследованием моторных волокон 1 нерва",
    price: 60.13,
    currency: "BYN",
    includes: [
      "Исследование проводимости",
      "Письменный протокол",
      "Рекомендации врача",
    ],
  },
];
