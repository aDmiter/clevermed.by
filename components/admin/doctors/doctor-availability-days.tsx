"use client";

export type DoctorAvailabilityDaySummary = {
  dateKey: string;
  durationMinutes: number;
  slotsCount: number;
};

function formatDayLabel(dateKey: string): string {
  const [, month, day] = dateKey.split("-");
  return `${day}.${month}`;
}

type DoctorAvailabilityDaysProps = {
  days: DoctorAvailabilityDaySummary[];
  maxVisible?: number;
  compact?: boolean;
};

export function DoctorAvailabilityDays({
  days,
  maxVisible = 6,
  compact = false,
}: DoctorAvailabilityDaysProps) {
  if (days.length === 0) {
    return (
      <p className="mt-2 text-xs text-primary-dark/45">
        Дни приёма не добавлены
      </p>
    );
  }

  const visible = days.slice(0, maxVisible);
  const rest = days.length - visible.length;

  return (
    <div className={compact ? "mt-1.5" : "mt-2"}>
      <p className="mb-1.5 text-xs font-medium text-primary-dark/50">
        Дни со слотами ({days.length})
      </p>
      <div className="flex flex-wrap gap-1.5">
        {visible.map((day) => (
          <span
            key={day.dateKey}
            title={`${day.dateKey}: ${day.slotsCount} слотов по ${day.durationMinutes} мин.`}
            className="inline-flex items-center gap-1 rounded-lg border border-primary-green/25 bg-secondary-mint px-2 py-0.5 text-xs font-medium text-primary-green"
          >
            {formatDayLabel(day.dateKey)}
            <span className="text-primary-dark/45">·</span>
            <span className="text-primary-dark/70">{day.slotsCount}</span>
          </span>
        ))}
        {rest > 0 && (
          <span className="rounded-lg bg-neutral-bg px-2 py-0.5 text-xs text-primary-dark/50">
            +{rest}
          </span>
        )}
      </div>
    </div>
  );
}
