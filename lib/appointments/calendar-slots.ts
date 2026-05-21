import { prisma } from "@/lib/prisma";
import {
  addDaysToDateKey,
  formatTimeInClinic,
  localDateTimeToUtc,
  startOfWeekDateKey,
  toDateKey,
} from "./clinic-time";
import { serializeAppointment } from "./serializer";
import type { CalendarSlotDto } from "./calendar-view";

export type { CalendarSlotDto } from "./calendar-view";

export async function getAdminCalendarSlots(params: {
  doctorId: string;
  fromDateKey: string;
  toDateKey: string;
}): Promise<CalendarSlotDto[]> {
  const { doctorId, fromDateKey, toDateKey: toDateKeyEnd } = params;

  const days = await prisma.doctorAvailabilityDay.findMany({
    where: {
      doctorId,
      dateKey: { gte: fromDateKey, lte: toDateKeyEnd },
    },
    include: {
      slots: {
        include: {
          appointment: {
            include: {
              doctor: { select: { name: true } },
              category: { select: { name: true } },
              procedure: { select: { title: true } },
            },
          },
        },
        orderBy: { startsAt: "asc" },
      },
    },
    orderBy: { dateKey: "asc" },
  });

  const slots: CalendarSlotDto[] = [];
  const linkedAppointmentIds = new Set<string>();

  for (const day of days) {
    for (const slot of day.slots) {
      const appt = slot.appointment;
      if (appt) linkedAppointmentIds.add(appt.id);
      slots.push({
        id: slot.id,
        startsAt: slot.startsAt.toISOString(),
        endsAt: slot.endsAt.toISOString(),
        label: formatTimeInClinic(slot.startsAt),
        dateKey: day.dateKey,
        durationMinutes: day.durationMinutes,
        kind: appt ? "booked" : "empty",
        appointment: appt ? serializeAppointment(appt) : null,
      });
    }
  }

  const fromUtc = localDateTimeToUtc(fromDateKey, "00:00");
  const toUtc = localDateTimeToUtc(addDaysToDateKey(toDateKeyEnd, 1), "00:00");

  const orphanWhere =
    linkedAppointmentIds.size > 0
      ? { id: { notIn: [...linkedAppointmentIds] } }
      : {};

  const orphanAppointments = await prisma.appointment.findMany({
    where: {
      doctorId,
      startsAt: { gte: fromUtc, lt: toUtc },
      ...orphanWhere,
    },
    include: {
      doctor: { select: { name: true } },
      category: { select: { name: true } },
      procedure: { select: { title: true } },
    },
    orderBy: { startsAt: "asc" },
  });

  for (const appt of orphanAppointments) {
    slots.push({
      id: `appt-${appt.id}`,
      startsAt: appt.startsAt.toISOString(),
      endsAt: appt.endsAt.toISOString(),
      label: formatTimeInClinic(appt.startsAt),
      dateKey: toDateKey(appt.startsAt),
      durationMinutes: appt.durationMinutes,
      kind: "booked",
      appointment: serializeAppointment(appt),
    });
  }

  slots.sort((a, b) => a.startsAt.localeCompare(b.startsAt));
  return slots;
}

/** Ближайший день с хотя бы одним слотом. */
export async function getFirstAvailabilityDateKey(
  doctorId: string,
): Promise<string | null> {
  const day = await prisma.doctorAvailabilityDay.findFirst({
    where: {
      doctorId,
      dateKey: { gte: toDateKey(new Date()) },
      slots: { some: {} },
    },
    orderBy: { dateKey: "asc" },
    select: { dateKey: true },
  });
  return day?.dateKey ?? null;
}

/** Неделя для открытия календаря: сначала с записью, иначе с расписанием. */
export async function getSuggestedWeekStartForDoctor(
  doctorId: string,
): Promise<string> {
  const todayKey = toDateKey(new Date());
  const fromUtc = localDateTimeToUtc(todayKey, "00:00");

  const nextAppointment = await prisma.appointment.findFirst({
    where: {
      doctorId,
      startsAt: { gte: fromUtc },
      status: { notIn: ["CANCELLED"] },
    },
    orderBy: { startsAt: "asc" },
    select: { startsAt: true },
  });

  if (nextAppointment) {
    return startOfWeekDateKey(toDateKey(nextAppointment.startsAt));
  }

  const availability = await getFirstAvailabilityDateKey(doctorId);
  if (availability) {
    return startOfWeekDateKey(availability);
  }

  return startOfWeekDateKey(todayKey);
}
