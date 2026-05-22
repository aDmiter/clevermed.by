import "server-only";

import type { DoctorCard } from "@/components/site/doctors-page";
import { doctorToCard } from "@/lib/doctor-public";
import { prisma } from "@/lib/prisma";

export async function fetchPublishedDoctors(): Promise<DoctorCard[]> {
  const rows = await prisma.doctor.findMany({
    where: { published: true },
    orderBy: [{ sortOrder: "asc" }, { lastName: "asc" }],
  });
  return rows.map(doctorToCard);
}
