import { ServicesPage } from "@/components/site/services-page";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Услуги",
};

export default function ServicesRoute() {
  return <ServicesPage />;
}
