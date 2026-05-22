/** Часовой пояс клиники (Беларусь) */
export const CLINIC_TIMEZONE = "Europe/Minsk";

const dateKeyFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: CLINIC_TIMEZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

const timeFormatter = new Intl.DateTimeFormat("en-GB", {
  timeZone: CLINIC_TIMEZONE,
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

const weekdayFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: CLINIC_TIMEZONE,
  weekday: "short",
});

/** YYYY-MM-DD в часовом поясе клиники */
export function toDateKey(date: Date): string {
  return dateKeyFormatter.format(date);
}

/** ISO day of week: 1 = Monday … 7 = Sunday */
export function getIsoDayOfWeek(date: Date): number {
  const map: Record<string, number> = {
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
    Sun: 7,
  };
  const key = weekdayFormatter.format(date).slice(0, 3);
  return map[key] ?? 1;
}

export function parseTimeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
}

export function formatMinutesAsTime(totalMinutes: number): string {
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/** Локальная полночь даты YYYY-MM-DD → UTC Date */
export function dateKeyToUtcStart(dateKey: string): Date {
  return new Date(`${dateKey}T00:00:00+03:00`);
}

export function addDaysToDateKey(dateKey: string, days: number): string {
  const d = dateKeyToUtcStart(dateKey);
  d.setUTCDate(d.getUTCDate() + days);
  return toDateKey(d);
}

/** Смещение UTC для даты в Minsk (обычно +180 мин) */
function getMinskOffsetMinutes(dateKey: string): number {
  const probe = new Date(`${dateKey}T12:00:00Z`);
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: CLINIC_TIMEZONE,
    timeZoneName: "shortOffset",
  }).formatToParts(probe);
  const offsetPart = parts.find((p) => p.type === "timeZoneName")?.value ?? "GMT+3";
  const match = offsetPart.match(/([+-])(\d+)(?::(\d+))?/);
  if (!match) return 180;
  const sign = match[1] === "-" ? -1 : 1;
  const hours = Number(match[2]);
  const mins = Number(match[3] ?? 0);
  return sign * (hours * 60 + mins);
}

/** Локальное время клиники (dateKey + ЧЧ:ММ) → UTC Date для хранения в БД */
export function localDateTimeToUtc(dateKey: string, time: string): Date {
  const [h, m] = time.split(":");
  const hh = String(Number(h ?? 0)).padStart(2, "0");
  const mm = String(Number(m ?? 0)).padStart(2, "0");
  const offsetMin = getMinskOffsetMinutes(dateKey);
  const sign = offsetMin >= 0 ? "+" : "-";
  const abs = Math.abs(offsetMin);
  const offH = String(Math.floor(abs / 60)).padStart(2, "0");
  const offM = String(abs % 60).padStart(2, "0");
  return new Date(`${dateKey}T${hh}:${mm}:00${sign}${offH}:${offM}`);
}

export function formatTimeInClinic(date: Date): string {
  return timeFormatter.format(date);
}

export function formatDateInClinic(date: Date): string {
  return new Intl.DateTimeFormat("ru-RU", {
    timeZone: CLINIC_TIMEZONE,
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

/** Подписи для выбора даты на публичной записи (dateKey YYYY-MM-DD). */
export function formatBookingDateChip(dateKey: string): {
  dayNum: string;
  weekday: string;
  month: string;
} {
  const date = dateKeyToUtcStart(dateKey);
  const opts = { timeZone: CLINIC_TIMEZONE } as const;
  return {
    dayNum: new Intl.DateTimeFormat("ru-RU", {
      ...opts,
      day: "numeric",
    }).format(date),
    weekday: new Intl.DateTimeFormat("ru-RU", {
      ...opts,
      weekday: "short",
    }).format(date),
    month: new Intl.DateTimeFormat("ru-RU", {
      ...opts,
      month: "short",
    }).format(date),
  };
}

export function formatDateTimeInClinic(date: Date): string {
  return `${formatDateInClinic(date)}, ${formatTimeInClinic(date)}`;
}

/** Понедельник недели для dateKey */
export function startOfWeekDateKey(dateKey: string): string {
  const d = dateKeyToUtcStart(dateKey);
  const dow = getIsoDayOfWeek(d);
  return addDaysToDateKey(dateKey, -(dow - 1));
}

export function weekDateKeys(weekStartKey: string): string[] {
  return Array.from({ length: 7 }, (_, i) => addDaysToDateKey(weekStartKey, i));
}

/** Левая граница календаря админки: сегодня и 6 следующих дней. */
export function getDefaultCalendarAnchor(): string {
  return toDateKey(new Date());
}

export function formatWeekdayShort(dateKey: string): string {
  return new Intl.DateTimeFormat("ru-RU", {
    timeZone: CLINIC_TIMEZONE,
    weekday: "short",
  }).format(dateKeyToUtcStart(dateKey));
}

/** Начало слота уже в прошлом (нельзя записать). */
export function isPastSlotStart(startsAt: Date): boolean {
  return startsAt.getTime() < Date.now();
}

export function isPastDateKey(dateKey: string): boolean {
  return dateKey < toDateKey(new Date());
}
