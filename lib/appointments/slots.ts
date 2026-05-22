import { addDaysToDateKey, toDateKey } from "./clinic-time";

export type TimeSlot = {
  id: string;
  startsAt: string;
  endsAt: string;
  label: string;
  durationMinutes: number;
};

export function isDateInBookingRange(dateKey: string, now = new Date()): boolean {
  const todayKey = toDateKey(now);
  if (dateKey < todayKey) return false;
  const maxKey = addDaysToDateKey(todayKey, 120);
  return dateKey <= maxKey;
}
