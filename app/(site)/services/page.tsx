import { ServicesPage } from "@/components/site/services-page";
import { metadataForPath } from "@/lib/page-seo-server";

export async function generateMetadata() {
  return metadataForPath("/services");
}

export default function ServicesRoute() {
  return <ServicesPage />;
}
