import { prisma } from "@/lib/prisma";

export const ACTIVE_APPOINTMENT_STATUSES = ["SCHEDULED", "CONFIRMED"] as const;

export function intervalsOverlap(
  aStart: number,
  aEnd: number,
  bStart: number,
  bEnd: number,
): boolean {
  return aStart < bEnd && bStart < aEnd;
}

export async function hasAppointmentConflict(
  doctorId: string,
  startsAt: Date,
  endsAt: Date,
  excludeId?: string,
): Promise<boolean> {
  const conflict = await prisma.appointment.findFirst({
    where: {
      doctorId,
      status: { in: [...ACTIVE_APPOINTMENT_STATUSES] },
      ...(excludeId ? { NOT: { id: excludeId } } : {}),
      startsAt: { lt: endsAt },
      endsAt: { gt: startsAt },
    },
  });
  return Boolean(conflict);
}
