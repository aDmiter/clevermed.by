import { prisma } from "@/lib/prisma";
import { toDateKey } from "./clinic-time";

/** Привязывает запись к слоту расписания с тем же временем начала (если слот свободен). */
export async function linkAppointmentToAvailabilitySlot(
  appointmentId: string,
  doctorId: string,
  startsAt: Date,
): Promise<void> {
  const dateKey = toDateKey(startsAt);
  const targetMs = startsAt.getTime();

  const slots = await prisma.availabilitySlot.findMany({
    where: { day: { doctorId, dateKey }, appointment: null },
    select: { id: true, startsAt: true },
  });

  const match = slots.find((s) => s.startsAt.getTime() === targetMs);
  if (!match) return;

  await prisma.appointment.update({
    where: { id: appointmentId },
    data: { slotId: match.id },
  });
}

/** Снимает привязку к слоту (при переносе времени). */
export async function unlinkAppointmentFromSlot(appointmentId: string): Promise<void> {
  await prisma.appointment.update({
    where: { id: appointmentId },
    data: { slotId: null },
  });
}
