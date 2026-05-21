"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AppointmentDto } from "@/lib/appointments/serializer";
import type { CalendarSlotDto } from "@/lib/appointments/calendar-view";
import { SOURCE_LABELS, STATUS_LABELS } from "@/lib/appointments/labels";
import {
  addDaysToDateKey,
  startOfWeekDateKey,
  toDateKey,
  weekDateKeys,
} from "@/lib/appointments/clinic-time";
import { cn } from "@/lib/utils";

const DAY_NAMES = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

export type CreateSlotDefaults = {
  date?: string;
  slotId?: string;
  procedureId?: string;
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
  const weekKeys = weekDateKeys(weekStart);
  const byDay = groupSlotsByDay(calendarSlots, weekKeys);
  const todayKey = toDateKey(new Date());

  return (
    <div className="admin-appt-cal">
      <div className="admin-appt-cal__toolbar">
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          onClick={() => onWeekChange(addDaysToDateKey(weekStart, -7))}
          aria-label="Предыдущая неделя"
        >
          <ChevronLeft size={16} />
        </Button>
        <p className="admin-appt-cal__week-title">
          {weekKeys[0]} — {weekKeys[6]}
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
        {weekKeys.map((dateKey, i) => {
          const daySlots = byDay.get(dateKey) ?? [];
          const isToday = dateKey === todayKey;

          return (
            <div key={dateKey} className="admin-appt-cal__day">
              <button
                type="button"
                onClick={() => onCreateSlot({ date: dateKey })}
                className={cn(
                  "admin-appt-cal__day-head",
                  isToday && "admin-appt-cal__day-head--today",
                )}
              >
                <span className="admin-appt-cal__day-name">{DAY_NAMES[i]}</span>
                <span className="admin-appt-cal__day-num">{dateKey.slice(8)}</span>
              </button>
              <div className="admin-appt-cal__slots">
                {daySlots.length === 0 ? (
                  <p className="admin-appt-cal__empty-day">
                    Нет слотов
                    <br />
                    <span className="text-primary-green">+ день</span>
                  </p>
                ) : (
                  daySlots.map((slot) => {
                    if (slot.kind === "empty") {
                      return (
                        <button
                          key={slot.id}
                          type="button"
                          className="admin-appt-cal__slot admin-appt-cal__slot--empty"
                          onClick={() =>
                            onCreateSlot({
                              date: slot.dateKey,
                              slotId: slot.id,
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
  return startOfWeekDateKey(toDateKey(new Date()));
}
