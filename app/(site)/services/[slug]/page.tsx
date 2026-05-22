import { ServiceLandingPage } from "@/components/site/service-landing-page";
import { fetchPublishedDoctors } from "@/lib/doctors-server";
import { metadataForPath } from "@/lib/page-seo-server";
import {
  getServiceBySlug,
  SERVICE_SLUGS,
} from "@/lib/services-catalog";
import { notFound } from "next/navigation";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return SERVICE_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  if (!getServiceBySlug(slug)) return { title: "Услуга" };
  return metadataForPath(`/services/${slug}`);
}

export default async function ServiceDetailRoute({ params }: PageProps) {
  const { slug } = await params;
  const content = getServiceBySlug(slug);
  if (!content) notFound();

  let doctors: Awaited<ReturnType<typeof fetchPublishedDoctors>> = [];
  try {
    doctors = await fetchPublishedDoctors();
  } catch (error) {
    console.error("[services] Failed to load doctors:", error);
  }

  return <ServiceLandingPage content={content} doctors={doctors} />;
}
