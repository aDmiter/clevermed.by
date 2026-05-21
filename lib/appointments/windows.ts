import {
  formatMinutesAsTime,
  localDateTimeToUtc,
  parseTimeToMinutes,
} from "./clinic-time";

export type TimeWindow = {
  startTime: string;
  endTime: string;
};

export type GeneratedSlot = {
  startsAt: Date;
  endsAt: Date;
  label: string;
};

/** Разбивает окна работы на слоты заданной длительности */
export function generateSlotsFromWindows(
  dateKey: string,
  windows: TimeWindow[],
  durationMinutes: number,
): GeneratedSlot[] {
  const slots: GeneratedSlot[] = [];

  for (const window of windows) {
    const windowStart = parseTimeToMinutes(window.startTime);
    const windowEnd = parseTimeToMinutes(window.endTime);
    if (windowEnd <= windowStart) continue;

    for (
      let cursor = windowStart;
      cursor + durationMinutes <= windowEnd;
      cursor += durationMinutes
    ) {
      const startTime = formatMinutesAsTime(cursor);
      const endTime = formatMinutesAsTime(cursor + durationMinutes);
      slots.push({
        startsAt: localDateTimeToUtc(dateKey, startTime),
        endsAt: localDateTimeToUtc(dateKey, endTime),
        label: startTime,
      });
    }
  }

  slots.sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime());
  return slots;
}

export function previewSlotLabels(
  windows: TimeWindow[],
  durationMinutes: number,
): string[] {
  if (windows.length === 0) return [];
  const sample = generateSlotsFromWindows("2099-01-01", windows, durationMinutes);
  return sample.map((s) => s.label);
}
