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
  let items = fallbackPriceItems;
  let categories = fallbackPriceCategories;

  try {
    const data = await fetchPricesPageData();
    if (data.items.length > 0) {
      items = data.items;
      categories = data.categories;
    }
  } catch (error) {
    console.error("[prices] Failed to load from database:", error);
  }

  return <PricesPageView items={items} categories={categories} />;
}
