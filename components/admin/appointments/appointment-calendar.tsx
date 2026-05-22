"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AppointmentDto } from "@/lib/appointments/serializer";
import type { CalendarSlotDto } from "@/lib/appointments/calendar-view";
import { SOURCE_LABELS, STATUS_LABELS } from "@/lib/appointments/labels";
import {
  addDaysToDateKey,
  formatWeekdayShort,
  getDefaultCalendarAnchor,
  isPastDateKey,
  isPastSlotStart,
  toDateKey,
  weekDateKeys,
} from "@/lib/appointments/clinic-time";
import { cn } from "@/lib/utils";

export type CreateSlotDefaults = {
  date?: string;
  /** ISO начала приёма (как в публичной записи) */
  startsAt?: string;
  slotLabel?: string;
  categoryId?: string;
};

type AppointmentCalendarProps = {
  weekStart: string;
  calendarSlots: CalendarSlotDto[];
  onWeekChange: (weekStart: string) => void;
  onSelectAppointment: (appointment: AppointmentDto) => void;
  onCreateSlot: (defaults: CreateSlotDefaults) => void;
};

function groupSlotsByDay(slots: CalendarSlotDto[], weekKeys: string[]) {
  const weekSet = new Set(weekKeys);
  const map = new Map<string, CalendarSlotDto[]>();
  for (const key of weekKeys) map.set(key, []);
  for (const slot of slots) {
    if (!weekSet.has(slot.dateKey)) continue;
    map.get(slot.dateKey)!.push(slot);
  }
  for (const [, list] of map) {
    list.sort((a, b) => a.startsAt.localeCompare(b.startsAt));
  }
  return map;
}

export function AppointmentCalendar({
  weekStart,
  calendarSlots,
  onWeekChange,
  onSelectAppointment,
  onCreateSlot,
}: AppointmentCalendarProps) {
  const todayKey = toDateKey(new Date());
  const weekKeys = weekDateKeys(weekStart);
  const weekEnd = weekKeys[6];
  const byDay = groupSlotsByDay(calendarSlots, weekKeys);
  const atTodayAnchor = weekStart <= todayKey;

  return (
    <div className="admin-appt-cal">
      <div className="admin-appt-cal__toolbar">
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          onClick={() => {
            const prev = addDaysToDateKey(weekStart, -7);
            onWeekChange(prev < todayKey ? todayKey : prev);
          }}
          disabled={atTodayAnchor}
          aria-label="Предыдущая неделя"
        >
          <ChevronLeft size={16} />
        </Button>
        <p className="admin-appt-cal__week-title">
          {weekKeys[0]} — {weekEnd}
        </p>
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          onClick={() => onWeekChange(addDaysToDateKey(weekStart, 7))}
          aria-label="Следующая неделя"
        >
          <ChevronRight size={16} />
        </Button>
      </div>

      <div className="admin-appt-cal__legend">
        <span className="admin-appt-cal__legend-item">
          <span className="admin-appt-cal__legend-swatch admin-appt-cal__legend-swatch--empty" />
          Свободный слот — новая запись
        </span>
        <span className="admin-appt-cal__legend-item">
          <span className="admin-appt-cal__legend-swatch admin-appt-cal__legend-swatch--booked" />
          Занято — редактирование
        </span>
      </div>

      <div className="admin-appt-cal__grid">
        {weekKeys.map((dateKey) => {
          const daySlots = byDay.get(dateKey) ?? [];
          const isToday = dateKey === todayKey;
          const isPastDay = isPastDateKey(dateKey);

          return (
            <div key={dateKey} className="admin-appt-cal__day">
              <button
                type="button"
                disabled={isPastDay}
                onClick={() => !isPastDay && onCreateSlot({ date: dateKey })}
                className={cn(
                  "admin-appt-cal__day-head",
                  isToday && "admin-appt-cal__day-head--today",
                  isPastDay && "cursor-not-allowed opacity-40",
                )}
              >
                <span className="admin-appt-cal__day-name">
                  {formatWeekdayShort(dateKey)}
                </span>
                <span className="admin-appt-cal__day-num">{dateKey.slice(8)}</span>
              </button>
              <div className="admin-appt-cal__slots">
                {daySlots.length === 0 ? (
                  <p className="admin-appt-cal__empty-day">
                    {isPastDay ? "—" : "Нет слотов"}
                    {!isPastDay && (
                      <>
                        <br />
                        <span className="text-primary-green">+ день</span>
                      </>
                    )}
                  </p>
                ) : (
                  daySlots.map((slot) => {
                    if (slot.kind === "empty") {
                      if (isPastSlotStart(new Date(slot.startsAt))) {
                        return null;
                      }
                      return (
                        <button
                          key={slot.id}
                          type="button"
                          className="admin-appt-cal__slot admin-appt-cal__slot--empty"
                          onClick={() =>
                            onCreateSlot({
                              date: slot.dateKey,
                              startsAt: slot.startsAt,
                              slotLabel: slot.label,
                            })
                          }
                        >
                          <span className="admin-appt-cal__slot-time">
                            {slot.label}
                          </span>
                          <span className="admin-appt-cal__slot-meta">
                            Свободно · {slot.durationMinutes} мин
                          </span>
                        </button>
                      );
                    }

                    const appt = slot.appointment!;
                    return (
                      <button
                        key={slot.id}
                        type="button"
                        className={cn(
                          "admin-appt-cal__slot admin-appt-cal__slot--booked",
                          appt.status === "SCHEDULED" &&
                            "admin-appt-cal__slot--scheduled",
                          appt.status === "CANCELLED" &&
                            "admin-appt-cal__slot--cancelled",
                        )}
                        onClick={() => onSelectAppointment(appt)}
                      >
                        <span className="admin-appt-cal__slot-time">
                          {slot.label}
                        </span>
                        <span className="admin-appt-cal__slot-patient">
                          {appt.patientName}
                        </span>
                        <span className="admin-appt-cal__slot-meta">
                          {STATUS_LABELS[appt.status]}
                          {appt.source === "ONLINE" &&
                            ` · ${SOURCE_LABELS.ONLINE}`}
                        </span>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function getCurrentWeekStart(): string {
  return getDefaultCalendarAnchor();
}
