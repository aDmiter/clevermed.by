import { prisma } from "@/lib/prisma";
import {
  addDaysToDateKey,
  formatTimeInClinic,
  localDateTimeToUtc,
  getDefaultCalendarAnchor,
  isPastSlotStart,
  toDateKey,
} from "./clinic-time";
import {
  ACTIVE_APPOINTMENT_STATUSES,
  intervalsOverlap,
} from "./conflicts";
import { serializeAppointment } from "./serializer";
import type { CalendarSlotDto } from "./calendar-view";

export type { CalendarSlotDto } from "./calendar-view";

function isBlockingStatus(status: string): boolean {
  return (ACTIVE_APPOINTMENT_STATUSES as readonly string[]).includes(status);
}

type AppointmentWithRelations = Awaited<
  ReturnType<typeof fetchBlockingAppointments>
>[number];

async function fetchBlockingAppointments(
  doctorId: string,
  fromUtc: Date,
  toUtc: Date,
) {
  return prisma.appointment.findMany({
    where: {
      doctorId,
      status: { in: [...ACTIVE_APPOINTMENT_STATUSES] },
      startsAt: { lt: toUtc },
      endsAt: { gt: fromUtc },
    },
    include: {
      doctor: { select: { name: true } },
      category: { select: { name: true } },
      procedure: { select: { title: true } },
    },
    orderBy: { startsAt: "asc" },
  });
}

function findOverlappingAppointment(
  slotStart: Date,
  slotEnd: Date,
  appointments: AppointmentWithRelations[],
): AppointmentWithRelations | undefined {
  const s = slotStart.getTime();
  const e = slotEnd.getTime();
  return appointments.find((a) =>
    intervalsOverlap(s, e, a.startsAt.getTime(), a.endsAt.getTime()),
  );
}

export async function getAdminCalendarSlots(params: {
  doctorId: string;
  fromDateKey: string;
  toDateKey: string;
}): Promise<CalendarSlotDto[]> {
  const { doctorId, fromDateKey, toDateKey: toDateKeyEnd } = params;

  const fromUtc = localDateTimeToUtc(fromDateKey, "00:00");
  const toUtc = localDateTimeToUtc(addDaysToDateKey(toDateKeyEnd, 1), "00:00");

  const [days, blockingAppointments] = await Promise.all([
    prisma.doctorAvailabilityDay.findMany({
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
    }),
    fetchBlockingAppointments(doctorId, fromUtc, toUtc),
  ]);

  const slots: CalendarSlotDto[] = [];
  const displayedAppointmentIds = new Set<string>();

  for (const day of days) {
    for (const slot of day.slots) {
      let appt = slot.appointment;
      if (appt && !isBlockingStatus(appt.status)) {
        appt = null;
      }
      if (!appt) {
        appt =
          findOverlappingAppointment(
            slot.startsAt,
            slot.endsAt,
            blockingAppointments,
          ) ?? null;
      }

      if (!appt && isPastSlotStart(slot.startsAt)) continue;

      if (appt) {
        if (
          displayedAppointmentIds.has(appt.id) &&
          slot.startsAt.getTime() > appt.startsAt.getTime()
        ) {
          continue;
        }
        displayedAppointmentIds.add(appt.id);
      }

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

  for (const appt of blockingAppointments) {
    if (displayedAppointmentIds.has(appt.id)) continue;
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
    displayedAppointmentIds.add(appt.id);
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

/** Якорь календаря админки: сегодня слева, без прошлых дней. */
export async function getSuggestedWeekStartForDoctor(
  _doctorId: string,
): Promise<string> {
  return getDefaultCalendarAnchor();
}
