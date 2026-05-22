import "server-only";

import { prisma } from "@/lib/prisma";
import type { PriceCategoryFilter, PriceListItem } from "@/lib/prices";

function parseIncludes(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

export async function fetchPricesPageData(): Promise<{
  items: PriceListItem[];
  categories: PriceCategoryFilter[];
}> {
  const rows = await prisma.serviceCategory.findMany({
    orderBy: { sortOrder: "asc" },
    include: {
      services: {
        where: { published: true },
        orderBy: { sortOrder: "asc" },
        include: {
          prices: {
            where: { published: true },
            orderBy: { sortOrder: "asc" },
            take: 1,
          },
        },
      },
    },
  });

  const categories: PriceCategoryFilter[] = [
    { id: "all", label: "Все" },
    ...rows.map((cat) => ({
      id: cat.id,
      label: cat.name,
      slug: cat.slug,
    })),
  ];

  const items: PriceListItem[] = [];

  for (const cat of rows) {
    for (const service of cat.services) {
      const priceRow = service.prices[0];
      const includes = priceRow
        ? parseIncludes(priceRow.includes)
        : service.shortDesc
          ? [service.shortDesc]
          : [];

      items.push({
        id: service.id,
        categoryId: cat.id,
        categoryName: cat.name,
        categorySlug: cat.slug,
        name: priceRow?.title ?? service.title,
        price: Number(priceRow?.amount ?? service.amount),
        currency: priceRow?.currency ?? service.currency,
        includes,
      });
    }
  }

  return { items, categories };
}
