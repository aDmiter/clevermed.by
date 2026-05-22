"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CalendarPlus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  mergeAppointmentsIntoCalendarSlots,
  type CalendarSlotDto,
} from "@/lib/appointments/calendar-view";
import type { BookingCategoryDto } from "@/lib/service-serializer";
import type { AppointmentDto } from "@/lib/appointments/serializer";
import {
  addDaysToDateKey,
  localDateTimeToUtc,
  toDateKey,
  weekDateKeys,
} from "@/lib/appointments/clinic-time";
import {
  AppointmentCalendar,
  type CreateSlotDefaults,
  getCurrentWeekStart,
} from "./appointment-calendar";
import {
  AppointmentForm,
  type AppointmentFormValues,
} from "./appointment-form";
import {
  AdminDoctorPicker,
  type DoctorPickerOption,
} from "./doctor-picker";

async function parseError(res: Response) {
  const data = await res.json().catch(() => ({}));
  throw new Error(
    typeof data.error === "string" ? data.error : "Произошла ошибка",
  );
}

function valuesToBody(values: AppointmentFormValues) {
  return {
    doctorId: values.doctorId,
    categoryId: values.categoryId || null,
    procedureId: null,
    slotId: null,
    startsAt: values.timeKey,
    patientName: values.patientName,
    patientPhone: values.patientPhone,
    patientEmail: values.patientEmail || null,
    patientComment: values.patientComment || null,
    adminNotes: values.adminNotes || null,
    status: values.status,
    source: values.source,
  };
}

export function AppointmentsAdmin() {
  const [doctors, setDoctors] = useState<DoctorPickerOption[]>([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>("");
  const [weekStart, setWeekStart] = useState(getCurrentWeekStart);
  const [appointments, setAppointments] = useState<AppointmentDto[]>([]);
  const [calendarSlots, setCalendarSlots] = useState<CalendarSlotDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<AppointmentDto | null | "new">(null);
  const [createDefaults, setCreateDefaults] = useState<CreateSlotDefaults>({});
  const [message, setMessage] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const weekInitForDoctor = useRef<string | null>(null);

  const loadDoctors = useCallback(async () => {
    const res = await fetch("/api/admin/doctors");
    if (!res.ok) await parseError(res);
    const data = await res.json();
    const list = data.doctors.map(
      (d: { id: string; name: string; imageUrl: string | null }) => ({
        id: d.id,
        name: d.name,
        imageUrl: d.imageUrl,
      }),
    );
    setDoctors(list);
    if (!selectedDoctorId && list[0]) {
      setSelectedDoctorId(list[0].id);
    }
  }, [selectedDoctorId]);

  const loadWeekData = useCallback(async () => {
    if (!selectedDoctorId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setLoadError(null);
    try {
      const from = localDateTimeToUtc(weekStart, "00:00").toISOString();
      const to = localDateTimeToUtc(
        addDaysToDateKey(weekStart, 7),
        "00:00",
      ).toISOString();
      const weekEnd = addDaysToDateKey(weekStart, 6);
      const weekKeys = weekDateKeys(weekStart);
      const [apptRes, slotsRes] = await Promise.all([
        fetch(
          `/api/admin/appointments?doctorId=${selectedDoctorId}&from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`,
        ),
        fetch(
          `/api/admin/appointments/calendar-slots?doctorId=${selectedDoctorId}&from=${weekStart}&to=${weekEnd}`,
        ),
      ]);
      if (!apptRes.ok) await parseError(apptRes);
      if (!slotsRes.ok) await parseError(slotsRes);
      const apptData = await apptRes.json();
      const slotsData = await slotsRes.json();
      const appts = apptData.appointments as AppointmentDto[];
      const rawSlots = slotsData.slots as CalendarSlotDto[];
      setAppointments(appts);
      setCalendarSlots(
        mergeAppointmentsIntoCalendarSlots(rawSlots, appts, weekKeys),
      );
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : "Ошибка загрузки");
      setAppointments([]);
      setCalendarSlots([]);
    } finally {
      setLoading(false);
    }
  }, [selectedDoctorId, weekStart]);

  useEffect(() => {
    void loadDoctors();
  }, [loadDoctors]);

  useEffect(() => {
    if (!selectedDoctorId) return;
    if (weekInitForDoctor.current === selectedDoctorId) return;
    weekInitForDoctor.current = selectedDoctorId;
    setWeekStart(getCurrentWeekStart());
  }, [selectedDoctorId]);

  useEffect(() => {
    void loadWeekData();
  }, [loadWeekData]);

  async function saveAppointment(values: AppointmentFormValues, id?: string) {
    const body = valuesToBody(values);
    const res = await fetch(
      id ? `/api/admin/appointments/${id}` : "/api/admin/appointments",
      {
        method: id ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      },
    );
    if (!res.ok) await parseError(res);
    setEditing(null);
    setMessage(id ? "Запись обновлена" : "Запись создана");
    await loadWeekData();
  }

  async function deleteAppointment(id: string) {
    if (!confirm("Удалить запись?")) return;
    const res = await fetch(`/api/admin/appointments/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) await parseError(res);
    setEditing(null);
    setMessage("Запись удалена");
    await loadWeekData();
  }

  async function openCreateForm(defaults: CreateSlotDefaults) {
    const slot = defaults.startsAt
      ? calendarSlots.find(
          (s) => s.startsAt === defaults.startsAt && s.kind === "empty",
        )
      : undefined;

    let categoryId = defaults.categoryId;
    if (!categoryId && slot?.durationMinutes) {
      const res = await fetch(
        `/api/appointments/services?doctorId=${selectedDoctorId}`,
      );
      if (res.ok) {
        const data = await res.json();
        const cats = data.categories as BookingCategoryDto[];
        categoryId = cats.find(
          (c) => c.durationMinutes === slot.durationMinutes,
        )?.id;
      }
    }

    setCreateDefaults({
      date: defaults.date ?? slot?.dateKey,
      startsAt: defaults.startsAt,
      slotLabel: defaults.slotLabel ?? slot?.label,
      categoryId,
    });
    setEditing("new");
  }

  return (
    <div className="max-w-6xl">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary-dark">Запись на приём</h1>
          <p className="mt-1 text-sm text-primary-dark/60">
            Дни приёма настраиваются у каждого врача в разделе{" "}
            <Link href="/admin/doctors" className="text-primary-green hover:underline">
              Врачи
            </Link>
          </p>
        </div>
        {!editing && (
          <Button onClick={() => setEditing("new")}>
            <CalendarPlus size={16} data-icon="inline-start" />
            Новая запись
          </Button>
        )}
      </div>

      {message && (
        <p className="mb-4 rounded-lg bg-secondary-mint px-3 py-2 text-sm text-primary-green">
          {message}
        </p>
      )}

      <div className="mb-6 flex flex-wrap items-end gap-4">
        <AdminDoctorPicker
          doctors={doctors}
          value={selectedDoctorId}
          onChange={(id) => {
            weekInitForDoctor.current = null;
            setSelectedDoctorId(id);
            setWeekStart(getCurrentWeekStart());
            setEditing(null);
          }}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setWeekStart(getCurrentWeekStart())}
        >
          Сегодня
        </Button>
      </div>

      {editing && (
        <div className="mb-8">
          <AppointmentForm
            key={
              editing === "new"
                ? `new-${createDefaults.date}-${createDefaults.startsAt ?? ""}`
                : editing.id
            }
            doctors={doctors}
            appointment={editing === "new" ? null : editing}
            defaultDoctorId={selectedDoctorId}
            defaultDate={createDefaults.date ?? toDateKey(new Date())}
            defaultStartsAt={createDefaults.startsAt}
            defaultSlotLabel={createDefaults.slotLabel}
            defaultCategoryId={createDefaults.categoryId}
            onCancel={() => setEditing(null)}
            onSubmit={async (values) => {
              await saveAppointment(
                values,
                editing === "new" ? undefined : editing.id,
              );
            }}
            onDelete={
              editing !== "new"
                ? async () => deleteAppointment(editing.id)
                : undefined
            }
          />
        </div>
      )}

      {loadError && (
        <p className="mb-4 rounded-lg bg-accent-warmth/10 px-4 py-3 text-sm text-accent-warmth">
          {loadError}
        </p>
      )}

      {loading ? (
        <p className="text-primary-dark/60">Загрузка…</p>
      ) : (
        <AppointmentCalendar
          weekStart={weekStart}
          calendarSlots={calendarSlots}
          onWeekChange={setWeekStart}
          onSelectAppointment={(a) => setEditing(a)}
          onCreateSlot={openCreateForm}
        />
      )}

      <div className="mt-8">
        <h2 className="mb-3 text-lg font-semibold">Список на неделю</h2>
        {appointments.length === 0 ? (
          <p className="text-sm text-primary-dark/60">Нет записей.</p>
        ) : (
          <ul className="divide-y divide-neutral-border rounded-xl border border-neutral-border bg-white/70">
            {appointments.map((a) => (
              <li key={a.id}>
                <button
                  type="button"
                  onClick={() => setEditing(a)}
                  className="flex w-full flex-wrap justify-between gap-2 px-4 py-3 text-left text-sm hover:bg-secondary-mint/50"
                >
                  <span className="font-medium">
                    {a.displayTime} — {a.patientName}
                    {(a.categoryTitle ?? a.procedureTitle) && (
                      <span className="text-primary-green">
                        {" "}
                        · {a.categoryTitle ?? a.procedureTitle}
                      </span>
                    )}
                  </span>
                  <span className="text-primary-dark/50">
                    {a.source === "ONLINE" ? "Сайт" : "Телефон"}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
