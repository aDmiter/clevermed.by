import { HomePage } from "@/components/site/home-page";
import { metadataForPath } from "@/lib/page-seo-server";

export async function generateMetadata() {
  return metadataForPath("/");
}

export default function Home() {
  return <HomePage />;
}
