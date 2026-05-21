"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AppointmentDto, ProcedureDto } from "@/lib/appointments/serializer";
import { STATUS_LABELS } from "@/lib/appointments/labels";
import { formatTimeInClinic, toDateKey } from "@/lib/appointments/clinic-time";

export type AppointmentFormValues = {
  doctorId: string;
  procedureId: string;
  slotId: string;
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

type AppointmentFormProps = {
  doctors: { id: string; name: string }[];
  appointment?: AppointmentDto | null;
  defaultDoctorId?: string;
  defaultDate?: string;
  defaultSlotId?: string;
  defaultProcedureId?: string;
  onSubmit: (values: AppointmentFormValues) => Promise<void>;
  onCancel: () => void;
  onDelete?: () => Promise<void>;
};

function appointmentToValues(a: AppointmentDto): AppointmentFormValues {
  return {
    doctorId: a.doctorId,
    procedureId: a.procedureId ?? "",
    slotId: a.slotId ?? "",
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

export function AppointmentForm({
  doctors,
  appointment,
  defaultDoctorId,
  defaultDate,
  defaultSlotId,
  defaultProcedureId,
  onSubmit,
  onCancel,
  onDelete,
}: AppointmentFormProps) {
  const [values, setValues] = useState<AppointmentFormValues>(() => {
    if (appointment) return appointmentToValues(appointment);
    return {
      doctorId: defaultDoctorId ?? doctors[0]?.id ?? "",
      procedureId: defaultProcedureId ?? "",
      slotId: defaultSlotId ?? "",
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
  const [procedures, setProcedures] = useState<ProcedureDto[]>([]);
  const [slots, setSlots] = useState<
    { id: string; label: string; startsAt: string }[]
  >([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!values.doctorId) return;
    void fetch(`/api/admin/settings/procedures`)
      .then((r) => r.json())
      .then((data) => {
        const all = data.procedures as ProcedureDto[];
        setProcedures(
          all.filter((p) => p.doctorIds.includes(values.doctorId)),
        );
      });
  }, [values.doctorId]);

  useEffect(() => {
    if (!values.doctorId || !values.procedureId || !values.date) return;
    let cancelled = false;
    setLoadingSlots(true);
    void fetch(
      `/api/admin/appointments/slots?doctorId=${values.doctorId}&procedureId=${values.procedureId}&date=${values.date}`,
    )
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Ошибка");
        if (!cancelled) {
          setSlots(data.slots);
          if (appointment?.slotId) {
            const current = data.slots.find(
              (s: { id: string }) => s.id === appointment.slotId,
            );
            if (!current && appointment.startsAt) {
              setSlots((prev) => [
                {
                  id: appointment.slotId!,
                  label: formatTimeInClinic(new Date(appointment.startsAt)),
                  startsAt: appointment.startsAt,
                },
                ...prev,
              ]);
            }
          }
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
  }, [values.doctorId, values.procedureId, values.date, appointment]);

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
              update("procedureId", "");
              update("slotId", "");
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
          <span className="mb-1 block text-sm font-medium">Процедура</span>
          <select
            className={fieldClass}
            value={values.procedureId}
            onChange={(e) => {
              update("procedureId", e.target.value);
              update("slotId", "");
            }}
            required
          >
            <option value="">—</option>
            {procedures.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title} ({p.durationMinutes} мин.)
              </option>
            ))}
          </select>
        </label>

        <label>
          <span className="mb-1 block text-sm font-medium">Дата</span>
          <input
            type="date"
            className={fieldClass}
            value={values.date}
            onChange={(e) => {
              update("date", e.target.value);
              update("slotId", "");
            }}
            required
          />
        </label>

        <label>
          <span className="mb-1 block text-sm font-medium">Время</span>
          <select
            className={fieldClass}
            value={values.slotId}
            onChange={(e) => update("slotId", e.target.value)}
            required
            disabled={loadingSlots}
          >
            <option value="">—</option>
            {slots.map((s) => (
              <option key={s.id} value={s.id}>
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
      </div>

      {error && <p className="mt-4 text-sm text-accent-warmth">{error}</p>}

      <div className="mt-6 flex flex-wrap gap-3">
        <Button type="submit" disabled={saving}>
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
