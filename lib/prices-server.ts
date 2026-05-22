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
      if (service.prices.length > 0) {
        for (const priceRow of service.prices) {
          items.push({
            id: priceRow.id,
            categoryId: cat.id,
            categoryName: cat.name,
            categorySlug: cat.slug,
            name: priceRow.title,
            price: Number(priceRow.amount),
            currency: priceRow.currency,
            includes: parseIncludes(priceRow.includes),
          });
        }
        continue;
      }

      const includes = service.shortDesc ? [service.shortDesc] : [];
      items.push({
        id: service.id,
        categoryId: cat.id,
        categoryName: cat.name,
        categorySlug: cat.slug,
        name: service.title,
        price: Number(service.amount),
        currency: service.currency,
        includes,
      });
    }
  }

  return { items, categories };
}
