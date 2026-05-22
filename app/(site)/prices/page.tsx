import { PricesPage as PricesPageView } from "@/components/site/prices-page";
import {
  fallbackPriceCategories,
  fallbackPriceItems,
} from "@/lib/prices";
import { fetchPricesPageData } from "@/lib/prices-server";
import { metadataForPath } from "@/lib/page-seo-server";

export async function generateMetadata() {
  return metadataForPath("/prices");
}

export default async function PricesRoute() {
  const useFallback = process.env.NODE_ENV !== "production";

  let items: typeof fallbackPriceItems = [];
  let categories: typeof fallbackPriceCategories = [
    { id: "all", label: "Все" },
  ];

  try {
    const data = await fetchPricesPageData();
    if (data.items.length > 0) {
      items = data.items;
      categories = data.categories;
    } else if (useFallback) {
      items = fallbackPriceItems;
      categories = fallbackPriceCategories;
    }
  } catch (error) {
    console.error("[prices] Failed to load from database:", error);
    if (useFallback) {
      items = fallbackPriceItems;
      categories = fallbackPriceCategories;
    }
  }

  return <PricesPageView items={items} categories={categories} />;
}
