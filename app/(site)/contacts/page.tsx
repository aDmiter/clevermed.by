import { ContactsPage } from "@/components/site/contacts-page";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Контакты",
};

export default function ContactsRoute() {
  return <ContactsPage />;
}
