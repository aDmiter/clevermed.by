import { prisma } from "@/lib/prisma";

/** Категория услуги врача с длительностью приёма (как на /booking). */
export async function resolveDoctorServiceCategory(
  doctorId: string,
  categoryId: string,
) {
  return prisma.serviceCategory.findFirst({
    where: {
      id: categoryId,
      durationId: { not: null },
      doctors: { some: { doctorId } },
    },
    include: { duration: true },
  });
}
