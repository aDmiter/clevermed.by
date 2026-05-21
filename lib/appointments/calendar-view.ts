import { formatTimeInClinic, toDateKey } from "./clinic-time";
import type { AppointmentDto } from "./serializer";

export type CalendarSlotDto = {
  id: string;
  startsAt: string;
  endsAt: string;
  label: string;
  dateKey: string;
  durationMinutes: number;
  kind: "empty" | "booked";
  appointment: AppointmentDto | null;
};

/** Добавляет в сетку записи без слота (онлайн-заявки и т.п.). */
export function mergeAppointmentsIntoCalendarSlots(
  slots: CalendarSlotDto[],
  appointments: AppointmentDto[],
  weekDateKeysList: string[],
): CalendarSlotDto[] {
  const weekSet = new Set(weekDateKeysList);
  const seenApptIds = new Set(
    slots
      .map((s) => s.appointment?.id)
      .filter((id): id is string => Boolean(id)),
  );

  const merged = [...slots];

  for (const appt of appointments) {
    if (seenApptIds.has(appt.id)) continue;
    const dateKey = toDateKey(new Date(appt.startsAt));
    if (!weekSet.has(dateKey)) continue;
    seenApptIds.add(appt.id);
    merged.push({
      id: `appt-${appt.id}`,
      startsAt: appt.startsAt,
      endsAt: appt.endsAt,
      label: formatTimeInClinic(new Date(appt.startsAt)),
      dateKey,
      durationMinutes: appt.durationMinutes,
      kind: "booked",
      appointment: appt,
    });
  }

  merged.sort((a, b) => a.startsAt.localeCompare(b.startsAt));
  return merged;
}
