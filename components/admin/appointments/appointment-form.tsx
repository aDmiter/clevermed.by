"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AppointmentDto } from "@/lib/appointments/serializer";
import type { BookingCategoryDto } from "@/lib/service-serializer";
import { STATUS_LABELS } from "@/lib/appointments/labels";
import { formatTimeInClinic, toDateKey } from "@/lib/appointments/clinic-time";

export type AppointmentFormValues = {
  doctorId: string;
  categoryId: string;
  /** ISO startsAt — как на публичной записи */
  timeKey: string;
  date: string;
  patientName: string;
  patientPhone: string;
  patientEmail: string;
  patientComment: string;
  adminNotes: string;
  status: AppointmentDto["status"];
  source: AppointmentDto["source"];
};

const fieldClass =
  "w-full rounded-lg border border-neutral-border bg-white px-3 py-2 text-sm text-primary-dark outline-none focus:border-primary-green focus:ring-2 focus:ring-primary-green/20";

function appointmentToValues(a: AppointmentDto): AppointmentFormValues {
  return {
    doctorId: a.doctorId,
    categoryId: a.categoryId ?? "",
    timeKey: a.startsAt,
    date: toDateKey(new Date(a.startsAt)),
    patientName: a.patientName,
    patientPhone: a.patientPhone,
    patientEmail: a.patientEmail ?? "",
    patientComment: a.patientComment ?? "",
    adminNotes: a.adminNotes ?? "",
    status: a.status,
    source: a.source,
  };
}

type AppointmentFormProps = {
  doctors: { id: string; name: string }[];
  appointment?: AppointmentDto | null;
  defaultDoctorId?: string;
  defaultDate?: string;
  defaultStartsAt?: string;
  defaultSlotLabel?: string;
  defaultCategoryId?: string;
  onSubmit: (values: AppointmentFormValues) => Promise<void>;
  onCancel: () => void;
  onDelete?: () => Promise<void>;
};

export function AppointmentForm({
  doctors,
  appointment,
  defaultDoctorId,
  defaultDate,
  defaultStartsAt,
  defaultSlotLabel,
  defaultCategoryId,
  onSubmit,
  onCancel,
  onDelete,
}: AppointmentFormProps) {
  const [values, setValues] = useState<AppointmentFormValues>(() => {
    if (appointment) return appointmentToValues(appointment);
    return {
      doctorId: defaultDoctorId ?? doctors[0]?.id ?? "",
      categoryId: defaultCategoryId ?? "",
      timeKey: defaultStartsAt ?? "",
      date: defaultDate ?? toDateKey(new Date()),
      patientName: "",
      patientPhone: "",
      patientEmail: "",
      patientComment: "",
      adminNotes: "",
      status: "CONFIRMED",
      source: "PHONE",
    };
  });
  const [categories, setCategories] = useState<BookingCategoryDto[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [slots, setSlots] = useState<
    { id: string; label: string; startsAt: string }[]
  >([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedCategory = useMemo(
    () => categories.find((c) => c.id === values.categoryId),
    [categories, values.categoryId],
  );

  useEffect(() => {
    if (!values.doctorId) {
      setCategories([]);
      return;
    }
    let cancelled = false;
    setLoadingCategories(true);
    void fetch(`/api/appointments/services?doctorId=${values.doctorId}`)
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Ошибка");
        if (cancelled) return;
        const list = data.categories as BookingCategoryDto[];
        setCategories(list);
      })
      .catch((e: Error) => {
        if (!cancelled) setError(e.message);
      })
      .finally(() => {
        if (!cancelled) setLoadingCategories(false);
      });
    return () => {
      cancelled = true;
    };
  }, [values.doctorId, defaultStartsAt, appointment]);

  useEffect(() => {
    if (!values.doctorId || !values.categoryId) {
      setAvailableDates([]);
      return;
    }
    let cancelled = false;
    void fetch(
      `/api/appointments/dates?doctorId=${values.doctorId}&categoryId=${values.categoryId}`,
    )
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Ошибка");
        if (!cancelled) setAvailableDates(data.dates ?? []);
      })
      .catch(() => {
        if (!cancelled) setAvailableDates([]);
      });
    return () => {
      cancelled = true;
    };
  }, [values.doctorId, values.categoryId]);

  useEffect(() => {
    if (!values.doctorId || !values.categoryId || !values.date) {
      setSlots([]);
      return;
    }
    let cancelled = false;
    setLoadingSlots(true);
    void fetch(
      `/api/admin/appointments/slots?doctorId=${values.doctorId}&categoryId=${values.categoryId}&date=${values.date}`,
    )
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Ошибка");
        if (!cancelled) {
          let list = data.slots as { id: string; label: string; startsAt: string }[];
          if (
            appointment &&
            values.timeKey &&
            !list.some((s) => s.startsAt === values.timeKey)
          ) {
            list = [
              {
                id: values.timeKey,
                label: formatTimeInClinic(new Date(values.timeKey)),
                startsAt: values.timeKey,
              },
              ...list,
            ];
          } else if (
            values.timeKey &&
            !list.some((s) => s.startsAt === values.timeKey)
          ) {
            setValues((prev) =>
              prev.timeKey === values.timeKey ? { ...prev, timeKey: "" } : prev,
            );
          }
          setSlots(list);
        }
      })
      .catch((e: Error) => {
        if (!cancelled) setError(e.message);
      })
      .finally(() => {
        if (!cancelled) setLoadingSlots(false);
      });
    return () => {
      cancelled = true;
    };
  }, [
    values.doctorId,
    values.categoryId,
    values.date,
    values.timeKey,
    appointment,
  ]);

  useEffect(() => {
    if (appointment || !defaultCategoryId || values.categoryId) return;
    setValues((prev) => ({ ...prev, categoryId: defaultCategoryId }));
  }, [defaultCategoryId, appointment, values.categoryId]);

  function update<K extends keyof AppointmentFormValues>(
    key: K,
    value: AppointmentFormValues[K],
  ) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await onSubmit(values);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка");
    } finally {
      setSaving(false);
    }
  }

  const durationLabel =
    selectedCategory?.durationLabel ??
    (selectedCategory?.durationMinutes != null
      ? `${selectedCategory.durationMinutes} мин`
      : null);

  return (
    <form
      onSubmit={(e) => void handleSubmit(e)}
      className="rounded-xl border border-neutral-border bg-white/80 p-6"
    >
      <h2 className="mb-4 text-lg font-semibold text-primary-dark">
        {appointment ? "Редактирование записи" : "Новая запись"}
      </h2>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block sm:col-span-2">
          <span className="mb-1 block text-sm font-medium">Врач</span>
          <select
            className={fieldClass}
            value={values.doctorId}
            onChange={(e) => {
              update("doctorId", e.target.value);
              update("categoryId", "");
              update("timeKey", "");
              update("date", toDateKey(new Date()));
            }}
            required
          >
            {doctors.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </label>

        <label className="block sm:col-span-2">
          <span className="mb-1 block text-sm font-medium">Услуга</span>
          <select
            className={fieldClass}
            value={values.categoryId}
            onChange={(e) => {
              update("categoryId", e.target.value);
              update("timeKey", "");
              update("date", toDateKey(new Date()));
            }}
            required
            disabled={loadingCategories || categories.length === 0}
          >
            <option value="">
              {loadingCategories
                ? "Загрузка…"
                : categories.length === 0
                  ? "Нет услуг у врача"
                  : "—"}
            </option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          {categories.length === 0 && !loadingCategories && (
            <p className="mt-1 text-xs text-primary-dark/50">
              Назначьте категории услуг врачу в разделе «Врачи».
            </p>
          )}
        </label>

        {durationLabel && (
          <div className="sm:col-span-2">
            <p className="text-sm text-primary-dark/60">
              Продолжительность приёма:{" "}
              <span className="font-semibold text-primary-green">
                {durationLabel}
              </span>
            </p>
          </div>
        )}

        <label>
          <span className="mb-1 block text-sm font-medium">Дата</span>
          <input
            type="date"
            className={fieldClass}
            value={values.date}
            min={toDateKey(new Date())}
            max={availableDates[availableDates.length - 1]}
            onChange={(e) => {
              update("date", e.target.value);
              update("timeKey", "");
            }}
            required
            disabled={!values.categoryId}
          />
        </label>

        <label>
          <span className="mb-1 block text-sm font-medium">Время</span>
          <select
            className={fieldClass}
            value={values.timeKey}
            onChange={(e) => update("timeKey", e.target.value)}
            required
            disabled={loadingSlots || !values.categoryId}
          >
            <option value="">
              {loadingSlots ? "Загрузка…" : "—"}
            </option>
            {slots.map((s) => (
              <option key={s.startsAt} value={s.startsAt}>
                {s.label}
              </option>
            ))}
          </select>
        </label>

        <label className="sm:col-span-2">
          <span className="mb-1 block text-sm font-medium">ФИО пациента</span>
          <input
            className={fieldClass}
            value={values.patientName}
            onChange={(e) => update("patientName", e.target.value)}
            required
          />
        </label>

        <label>
          <span className="mb-1 block text-sm font-medium">Телефон</span>
          <input
            className={fieldClass}
            type="tel"
            value={values.patientPhone}
            onChange={(e) => update("patientPhone", e.target.value)}
            required
          />
        </label>

        <label>
          <span className="mb-1 block text-sm font-medium">Email</span>
          <input
            className={fieldClass}
            type="email"
            value={values.patientEmail}
            onChange={(e) => update("patientEmail", e.target.value)}
          />
        </label>

        <label>
          <span className="mb-1 block text-sm font-medium">Статус</span>
          <select
            className={fieldClass}
            value={values.status}
            onChange={(e) =>
              update("status", e.target.value as AppointmentFormValues["status"])
            }
          >
            {Object.entries(STATUS_LABELS).map(([k, label]) => (
              <option key={k} value={k}>
                {label}
              </option>
            ))}
          </select>
        </label>

        {!appointment && (
          <label>
            <span className="mb-1 block text-sm font-medium">Источник</span>
            <select
              className={fieldClass}
              value={values.source}
              onChange={(e) =>
                update("source", e.target.value as AppointmentFormValues["source"])
              }
            >
              <option value="PHONE">По телефону</option>
              <option value="ONLINE">С сайта</option>
            </select>
          </label>
        )}

        <label className="sm:col-span-2">
          <span className="mb-1 block text-sm font-medium">
            Заметки администратора
          </span>
          <textarea
            className={`${fieldClass} min-h-[80px]`}
            value={values.adminNotes}
            onChange={(e) => update("adminNotes", e.target.value)}
          />
        </label>
      </div>

      {error && <p className="mt-4 text-sm text-accent-warmth">{error}</p>}

      <div className="mt-6 flex flex-wrap gap-3">
        <Button type="submit" disabled={saving || !values.categoryId}>
          {saving && <Loader2 className="animate-spin" data-icon="inline-start" />}
          {appointment ? "Сохранить" : "Создать"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Отмена
        </Button>
        {appointment && onDelete && (
          <Button
            type="button"
            variant="destructive"
            className="ml-auto"
            onClick={() => void onDelete()}
          >
            Удалить
          </Button>
        )}
      </div>
    </form>
  );
}
