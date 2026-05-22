import {
  AppointmentBooking,
  type BookingDoctor,
} from "@/components/site/appointment-booking";
import { doctorToCard } from "@/lib/doctor-public";
import { prisma } from "@/lib/prisma";
import { metadataForPath } from "@/lib/page-seo-server";
import { getSiteSettings } from "@/lib/site-settings-server";
import { redirect } from "next/navigation";
export const dynamic = "force-dynamic";

export async function generateMetadata() {
  return metadataForPath("/booking");
}

type PageProps = {
  searchParams: Promise<{ doctor?: string }>;
};

export default async function BookingPage({ searchParams }: PageProps) {
  const settings = await getSiteSettings();
  if (!settings.onlineBookingEnabled) {
    redirect("/contacts");
  }

  const { doctor: doctorSlug } = await searchParams;
  let doctors: BookingDoctor[] = [];
  let preselectedDoctorId: string | undefined;

  try {
    const rows = await prisma.doctor.findMany({
      where: { published: true },
      orderBy: [{ sortOrder: "asc" }, { lastName: "asc" }],
    });
    doctors = rows.map((d) => {
      const card = doctorToCard(d);
      return {
        id: d.id,
        name: card.name,
        title: card.title,
        image: card.image,
        specialty: card.specialty,
      };
    });
    if (doctorSlug) {
      const match = rows.find(
        (d) => d.slug === doctorSlug || d.id === doctorSlug,
      );
      preselectedDoctorId = match?.id;
    }
  } catch (error) {
    console.error("[booking] Failed to load doctors:", error);
  }

  return (
    <div className="min-h-screen bg-neutral-bg py-24">
      <div className="container mx-auto px-6">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <h1 className="mb-4 text-4xl font-bold text-primary-dark md:text-5xl">
            Запись на приём
          </h1>
          <p className="text-lg text-primary-dark/70">
            Выберите врача, услугу и удобное время.
            Подтверждение записи — после звонка из клиники.
          </p>
        </div>
        {doctors.length > 0 ? (
          <AppointmentBooking
            doctors={doctors}
            preselectedDoctorId={preselectedDoctorId}
          />
        ) : (
          <p className="text-center text-primary-dark/60">
            Запись временно недоступна. Позвоните в регистратуру.
          </p>
        )}
      </div>
    </div>
  );
}
