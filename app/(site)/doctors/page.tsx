import { DoctorsPage } from "@/components/site/doctors-page";
import { fetchPublishedDoctors } from "@/lib/doctors-server";
import { metadataForPath } from "@/lib/page-seo-server";

export async function generateMetadata() {
  return metadataForPath("/doctors");
}

export default async function DoctorsRoute() {
  let doctors;

  try {
    doctors = await fetchPublishedDoctors();
  } catch (error) {
    console.error("[doctors] Failed to load from database:", error);
    doctors = undefined;
  }

  return <DoctorsPage doctors={doctors} />;
}
