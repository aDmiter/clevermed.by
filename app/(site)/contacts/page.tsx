import { ContactsPage } from "@/components/site/contacts-page";
import { metadataForPath } from "@/lib/page-seo-server";

export async function generateMetadata() {
  return metadataForPath("/contacts");
}

export default function ContactsRoute() {
  return <ContactsPage />;
}
