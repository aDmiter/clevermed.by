import type { Appointment } from "@/app/generated/prisma/client";
import { addDaysToDateKey, toDateKey } from "./clinic-time";

export type TimeSlot = {
  id: string;
  startsAt: string;
  endsAt: string;
  label: string;
  durationMinutes: number;
};

const ACTIVE_STATUSES = new Set(["SCHEDULED", "CONFIRMED"]);

export function filterSlotsForProcedure<
  T extends { startsAt: Date; endsAt: Date; durationMinutes?: number },
>(
  slots: T[],
  procedureMinutes: number,
  appointments: Pick<Appointment, "startsAt" | "endsAt" | "status">[],
): T[] {
  const busy = appointments
    .filter((a) => ACTIVE_STATUSES.has(a.status))
    .map((a) => ({ start: a.startsAt.getTime(), end: a.endsAt.getTime() }));

  return slots.filter((slot) => {
    const slotMinutes =
      slot.durationMinutes ??
      Math.round((slot.endsAt.getTime() - slot.startsAt.getTime()) / 60000);
    if (slotMinutes !== procedureMinutes) return false;

    const startMs = slot.startsAt.getTime();
    const endMs = slot.endsAt.getTime();
    return !busy.some((b) => startMs < b.end && b.start < endMs);
  });
}

export function isDateInBookingRange(dateKey: string, now = new Date()): boolean {
  const todayKey = toDateKey(now);
  if (dateKey < todayKey) return false;
  const maxKey = addDaysToDateKey(todayKey, 120);
  return dateKey <= maxKey;
}
