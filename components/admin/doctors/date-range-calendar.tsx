"use client";

import { useCallback, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  addDaysToDateKey,
  toDateKey,
} from "@/lib/appointments/clinic-time";

const WEEKDAYS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

function monthMatrix(year: number, month: number): (string | null)[][] {
  const first = new Date(year, month, 1);
  const startPad = (first.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (string | null)[] = [];
  for (let i = 0; i < startPad; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    const key = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    cells.push(key);
  }
  while (cells.length % 7 !== 0) cells.push(null);
  const rows: (string | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    rows.push(cells.slice(i, i + 7));
  }
  return rows;
}

function rangeBetween(a: string, b: string): string[] {
  const [start, end] = a < b ? [a, b] : [b, a];
  const out: string[] = [];
  let cur = start;
  while (cur <= end) {
    out.push(cur);
    cur = addDaysToDateKey(cur, 1);
  }
  return out;
}

export type ExistingAvailabilityDay = {
  dateKey: string;
  slotsCount: number;
  durationMinutes: number;
};

type DateRangeCalendarProps = {
  selected: string[];
  onChange: (dates: string[]) => void;
  minDateKey?: string;
  existingDays?: ExistingAvailabilityDay[];
};

export function DateRangeCalendar({
  selected,
  onChange,
  minDateKey,
  existingDays = [],
}: DateRangeCalendarProps) {
  const todayKey = minDateKey ?? toDateKey(new Date());
  const existingMap = useMemo(
    () => new Map(existingDays.map((d) => [d.dateKey, d])),
    [existingDays],
  );
  const [view, setView] = useState(() => {
    const [y, m] = todayKey.split("-").map(Number);
    return { year: y, month: m - 1 };
  });
  const [dragAnchor, setDragAnchor] = useState<string | null>(null);

  const matrix = useMemo(
    () => monthMatrix(view.year, view.month),
    [view.year, view.month],
  );

  const monthLabel = new Intl.DateTimeFormat("ru-RU", {
    month: "long",
    year: "numeric",
  }).format(new Date(view.year, view.month, 1));

  const toggleDate = useCallback(
    (dateKey: string) => {
      if (dateKey < todayKey) return;
      const set = new Set(selected);
      if (set.has(dateKey)) set.delete(dateKey);
      else set.add(dateKey);
      onChange([...set].sort());
    },
    [selected, onChange, todayKey],
  );

  function handleMouseDown(dateKey: string) {
    if (dateKey < todayKey) return;
    setDragAnchor(dateKey);
    toggleDate(dateKey);
  }

  function handleMouseEnter(dateKey: string) {
    if (!dragAnchor || dateKey < todayKey) return;
    const range = rangeBetween(dragAnchor, dateKey);
    const valid = range.filter((d) => d >= todayKey);
    onChange([...new Set([...selected, ...valid])].sort());
  }

  function handleMouseUp() {
    setDragAnchor(null);
  }

  return (
    <div
      className="select-none"
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div className="mb-4 flex items-center justify-between">
        <button
          type="button"
          className="rounded-lg p-2 text-primary-dark/60 hover:bg-secondary-mint"
          onClick={() =>
            setView((v) => {
              const d = new Date(v.year, v.month - 1, 1);
              return { year: d.getFullYear(), month: d.getMonth() };
            })
          }
        >
          <ChevronLeft size={18} />
        </button>
        <span className="text-sm font-semibold capitalize text-primary-dark">
          {monthLabel}
        </span>
        <button
          type="button"
          className="rounded-lg p-2 text-primary-dark/60 hover:bg-secondary-mint"
          onClick={() =>
            setView((v) => {
              const d = new Date(v.year, v.month + 1, 1);
              return { year: d.getFullYear(), month: d.getMonth() };
            })
          }
        >
          <ChevronRight size={18} />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-primary-dark/50">
        {WEEKDAYS.map((d) => (
          <div key={d} className="py-1">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {matrix.flat().map((dateKey, i) => {
          if (!dateKey) {
            return <div key={`empty-${i}`} className="aspect-square" />;
          }
          const isPast = dateKey < todayKey;
          const isSelected = selected.includes(dateKey);
          const existing = existingMap.get(dateKey);
          const hasSlots = Boolean(existing && existing.slotsCount > 0);
          return (
            <button
              key={dateKey}
              type="button"
              disabled={isPast}
              title={
                hasSlots
                  ? `${existing!.slotsCount} слотов · ${existing!.durationMinutes} мин.`
                  : undefined
              }
              onMouseDown={() => handleMouseDown(dateKey)}
              onMouseEnter={() => handleMouseEnter(dateKey)}
              className={cn(
                "relative flex aspect-square flex-col items-center justify-center rounded-xl text-sm font-medium transition-all",
                isPast && "cursor-not-allowed text-primary-dark/20",
                !isPast &&
                  !isSelected &&
                  !hasSlots &&
                  "text-primary-dark hover:bg-secondary-mint",
                !isPast &&
                  !isSelected &&
                  hasSlots &&
                  "border-2 border-primary-green/40 bg-secondary-mint/80 text-primary-green hover:bg-secondary-mint",
                isSelected &&
                  "bg-primary-green text-white shadow-sm ring-2 ring-primary-green/30",
                isSelected &&
                  hasSlots &&
                  "ring-2 ring-white/80",
              )}
            >
              <span>{Number(dateKey.slice(8))}</span>
              {hasSlots && !isSelected && (
                <span className="mt-0.5 text-[9px] font-normal leading-none opacity-80">
                  {existing!.slotsCount}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-4 space-y-2">
        {existingDays.length > 0 && (
          <p className="flex flex-wrap items-center gap-2 text-xs text-primary-dark/55">
            <span className="inline-block h-3 w-3 rounded border-2 border-primary-green/40 bg-secondary-mint/80" />
            Уже есть слоты для записи
            <span className="text-primary-dark/35">·</span>
            <span className="inline-block h-3 w-3 rounded bg-primary-green" />
            Выбрано для добавления/обновления
          </p>
        )}
        {selected.length > 0 && (
          <p className="text-sm text-primary-dark/60">
            Выбрано дней:{" "}
            <strong className="text-primary-green">{selected.length}</strong>
          </p>
        )}
      </div>
    </div>
  );
}
