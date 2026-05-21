import { prisma } from "@/lib/prisma";
import {
  addDaysToDateKey,
  dateKeyToUtcStart,
  formatMinutesAsTime,
  formatTimeInClinic,
  localDateTimeToUtc,
  parseTimeToMinutes,
  toDateKey,
} from "./clinic-time";
import type { TimeWindow } from "./windows";

const ACTIVE_STATUSES = ["SCHEDULED", "CONFIRMED"] as const;

/** Шаг перебора начала приёма (минуты) */
export const BOOKING_GRID_MINUTES = 5;

export type BookableSlot = {
  id: string;
  startsAt: string;
  endsAt: string;
  label: string;
  durationMinutes: number;
};

function intervalsOverlap(
  aStart: number,
  aEnd: number,
  bStart: number,
  bEnd: number,
): boolean {
  return aStart < bEnd && bStart < aEnd;
}

function isWithinWindows(
  dateKey: string,
  startsAt: Date,
  endsAt: Date,
  windows: TimeWindow[],
): boolean {
  if (toDateKey(startsAt) !== dateKey || toDateKey(endsAt) !== dateKey) {
    return false;
  }
  const startMins = parseTimeToMinutes(formatTimeInClinic(startsAt));
  const endMins = parseTimeToMinutes(formatTimeInClinic(endsAt));
  return windows.some((w) => {
    const ws = parseTimeToMinutes(w.startTime);
    const we = parseTimeToMinutes(w.endTime);
    return startMins >= ws && endMins <= we;
  });
}

async function getBookedIntervalsForDay(
  doctorId: string,
  dateKey: string,
): Promise<{ start: number; end: number }[]> {
  const dayStart = dateKeyToUtcStart(dateKey);
  const dayEnd = dateKeyToUtcStart(addDaysToDateKey(dateKey, 1));

  const appointments = await prisma.appointment.findMany({
    where: {
      doctorId,
      status: { in: [...ACTIVE_STATUSES] },
      startsAt: { lt: dayEnd },
      endsAt: { gt: dayStart },
    },
    select: { startsAt: true, endsAt: true },
  });

  return appointments.map((a) => ({
    start: a.startsAt.getTime(),
    end: a.endsAt.getTime(),
  }));
}

/** Свободные интервалы начала приёма с учётом длительности услуги и занятых записей */
export async function getBookableSlotsForService(params: {
  doctorId: string;
  dateKey: string;
  durationMinutes: number;
}): Promise<BookableSlot[]> {
  const { doctorId, dateKey, durationMinutes } = params;
  const now = new Date();

  const day = await prisma.doctorAvailabilityDay.findUnique({
    where: { doctorId_dateKey: { doctorId, dateKey } },
  });

  if (!day) return [];

  const windows = day.windows as TimeWindow[];
  if (windows.length === 0) return [];

  const booked = await getBookedIntervalsForDay(doctorId, dateKey);
  const result: BookableSlot[] = [];

  for (const window of windows) {
    const windowStart = parseTimeToMinutes(window.startTime);
    const windowEnd = parseTimeToMinutes(window.endTime);
    if (windowEnd <= windowStart) continue;

    for (
      let cursor = windowStart;
      cursor + durationMinutes <= windowEnd;
      cursor += BOOKING_GRID_MINUTES
    ) {
      const startTime = formatMinutesAsTime(cursor);
      const startsAt = localDateTimeToUtc(dateKey, startTime);
      const endsAt = localDateTimeToUtc(
        dateKey,
        formatMinutesAsTime(cursor + durationMinutes),
      );

      if (startsAt <= now) continue;
      if (!isWithinWindows(dateKey, startsAt, endsAt, windows)) continue;

      const s = startsAt.getTime();
      const e = endsAt.getTime();
      if (booked.some((b) => intervalsOverlap(s, e, b.start, b.end))) continue;

      result.push({
        id: startsAt.toISOString(),
        startsAt: startsAt.toISOString(),
        endsAt: endsAt.toISOString(),
        label: startTime,
        durationMinutes,
      });
    }
  }

  return result;
}

export async function getDoctorAvailabilityDatesForService(
  doctorId: string,
  durationMinutes: number,
): Promise<string[]> {
  const days = await prisma.doctorAvailabilityDay.findMany({
    where: {
      doctorId,
      dateKey: { gte: toDateKey(new Date()) },
    },
    orderBy: { dateKey: "asc" },
    select: { dateKey: true },
  });

  const dates: string[] = [];
  for (const day of days) {
    const slots = await getBookableSlotsForService({
      doctorId,
      dateKey: day.dateKey,
      durationMinutes,
    });
    if (slots.length > 0) dates.push(day.dateKey);
  }
  return dates;
}

export async function assertBookableSlot(params: {
  doctorId: string;
  startsAt: Date;
  durationMinutes: number;
}): Promise<{ endsAt: Date; dateKey: string } | null> {
  const { doctorId, startsAt, durationMinutes } = params;
  const dateKey = toDateKey(startsAt);
  const endsAt = new Date(
    startsAt.getTime() + durationMinutes * 60 * 1000,
  );

  const day = await prisma.doctorAvailabilityDay.findUnique({
    where: { doctorId_dateKey: { doctorId, dateKey } },
  });
  if (!day) return null;

  const windows = day.windows as TimeWindow[];
  if (!isWithinWindows(dateKey, startsAt, endsAt, windows)) return null;

  const slots = await getBookableSlotsForService({
    doctorId,
    dateKey,
    durationMinutes,
  });

  const match = slots.find(
    (s) => new Date(s.startsAt).getTime() === startsAt.getTime(),
  );
  if (!match) return null;

  return { endsAt, dateKey };
}
