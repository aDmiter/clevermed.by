import { DoctorsPage } from "@/components/site/doctors-page";
import { doctorToCard } from "@/lib/doctor-public";
import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Врачи",
};

export default async function DoctorsRoute() {
  let doctors;

  try {
    const rows = await prisma.doctor.findMany({
      where: { published: true },
      orderBy: [{ sortOrder: "asc" }, { lastName: "asc" }],
    });
    doctors = rows.map(doctorToCard);
  } catch (error) {
    console.error("[doctors] Failed to load from database:", error);
    doctors = undefined;
  }

  return <DoctorsPage doctors={doctors} />;
}
