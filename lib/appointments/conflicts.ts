import { prisma } from "@/lib/prisma";

const ACTIVE_STATUSES = ["SCHEDULED", "CONFIRMED"] as const;

export async function hasAppointmentConflict(
  doctorId: string,
  startsAt: Date,
  endsAt: Date,
  excludeId?: string,
): Promise<boolean> {
  const conflict = await prisma.appointment.findFirst({
    where: {
      doctorId,
      status: { in: [...ACTIVE_STATUSES] },
      ...(excludeId ? { NOT: { id: excludeId } } : {}),
      startsAt: { lt: endsAt },
      endsAt: { gt: startsAt },
    },
  });
  return Boolean(conflict);
}
