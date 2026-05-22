"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Check,
  Loader2,
  Phone,
  RefreshCw,
  Globe,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { AppointmentDto } from "@/lib/appointments/serializer";
import { ONLINE_QUEUE_STATUS_LABEL } from "@/lib/appointments/labels";
import { notifyOnlineQueueChanged } from "@/lib/admin-online-queue-events";
import { formatDateInClinic, formatTimeInClinic } from "@/lib/appointments/clinic-time";

async function parseError(res: Response) {
  const data = await res.json().catch(() => ({}));
  throw new Error(
    typeof data.error === "string" ? data.error : "Произошла ошибка",
  );
}

const fieldClass =
  "w-full rounded-lg border border-neutral-border bg-white px-3 py-2 text-sm text-primary-dark outline-none focus:border-primary-green focus:ring-2 focus:ring-primary-green/20";

function serviceLabel(a: AppointmentDto): string {
  return a.categoryTitle ?? a.procedureTitle ?? "—";
}

export function OnlineBookingsAdmin() {
  const [appointments, setAppointments] = useState<AppointmentDto[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const selected = appointments.find((a) => a.id === selectedId) ?? null;

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/online-appointments");
      if (!res.ok) await parseError(res);
      const data = await res.json();
      setAppointments(data.appointments);
      setSelectedId((prev) => {
        if (prev && data.appointments.some((a: AppointmentDto) => a.id === prev)) {
          return prev;
        }
        return data.appointments[0]?.id ?? null;
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка");
      setAppointments([]);
      setSelectedId(null);
    } finally {
      setLoading(false);
      notifyOnlineQueueChanged();
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (selected) {
      setAdminNotes(selected.adminNotes ?? "");
    } else {
      setAdminNotes("");
    }
  }, [selected?.id, selected?.adminNotes]);

  async function deleteBooking() {
    if (!selected) return;
    if (
      !confirm(
        `Удалить заявку ${selected.patientName}? Время приёма снова станет доступным для записи.`,
      )
    ) {
      return;
    }
    setDeleting(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/admin/online-appointments/${selected.id}`,
        { method: "DELETE" },
      );
      if (!res.ok) await parseError(res);
      setMessage(`Заявка ${selected.patientName} удалена`);
      setAppointments((list) => list.filter((a) => a.id !== selected.id));
      setSelectedId(null);
      notifyOnlineQueueChanged();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка");
    } finally {
      setDeleting(false);
    }
  }

  async function confirmBooking() {
    if (!selected) return;
    setConfirming(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/admin/online-appointments/${selected.id}/confirm`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ adminNotes: adminNotes || null }),
        },
      );
      if (!res.ok) await parseError(res);
      setMessage(`Запись для ${selected.patientName} подтверждена`);
      setAppointments((list) => list.filter((a) => a.id !== selected.id));
      setSelectedId(null);
      notifyOnlineQueueChanged();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка");
    } finally {
      setConfirming(false);
    }
  }

  return (
    <div className="max-w-5xl">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary-dark">Запись онлайн</h1>
          <p className="mt-1 text-sm text-primary-dark/60">
            Новые заявки с сайта со статусом «{ONLINE_QUEUE_STATUS_LABEL}».
            Перезвоните пациенту и нажмите «Подтвердить» — запись перейдёт в
            общий календарь. Неподтверждённую заявку можно удалить.
          </p>
        </div>
        <Button type="button" variant="outline" onClick={() => void load()}>
          <RefreshCw size={16} data-icon="inline-start" />
          Обновить
        </Button>
      </div>

      {message && (
        <p className="mb-4 rounded-lg bg-secondary-mint px-3 py-2 text-sm text-primary-green">
          {message}
        </p>
      )}
      {error && (
        <p className="mb-4 rounded-lg bg-accent-warmth/10 px-3 py-2 text-sm text-accent-warmth">
          {error}
        </p>
      )}

      {loading ? (
        <p className="flex items-center gap-2 text-primary-dark/60">
          <Loader2 className="animate-spin" size={18} /> Загрузка…
        </p>
      ) : appointments.length === 0 ? (
        <div className="rounded-2xl border border-neutral-border bg-white/70 px-6 py-12 text-center">
          <Globe className="mx-auto mb-3 text-primary-green/40" size={40} />
          <p className="font-medium text-primary-dark">Новых онлайн-записей нет</p>
          <p className="mt-1 text-sm text-primary-dark/50">
            Подтверждённые заявки отображаются в разделе «Запись на приём».
          </p>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
          <ul className="space-y-2">
            {appointments.map((a) => (
              <li key={a.id}>
                <button
                  type="button"
                  onClick={() => setSelectedId(a.id)}
                  className={cn(
                    "w-full rounded-xl border px-4 py-3 text-left transition-all",
                    selectedId === a.id
                      ? "border-primary-green bg-secondary-mint shadow-sm"
                      : "border-neutral-border bg-white/70 hover:border-primary-green/30",
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-semibold text-primary-dark">
                      {a.patientName}
                    </span>
                    <span className="shrink-0 rounded-full bg-accent-warmth/15 px-2 py-0.5 text-xs font-medium text-accent-warmth">
                      {ONLINE_QUEUE_STATUS_LABEL}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-primary-dark/60">
                    {formatDateInClinic(new Date(a.startsAt))},{" "}
                    {formatTimeInClinic(new Date(a.startsAt))}
                  </p>
                  <p className="mt-0.5 text-xs text-primary-green">
                    {a.doctorName} · {serviceLabel(a)}
                  </p>
                </button>
              </li>
            ))}
          </ul>

          {selected && (
            <div className="rounded-2xl border border-neutral-border bg-white/80 p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between gap-2">
                <h2 className="text-lg font-bold text-primary-dark">
                  {selected.patientName}
                </h2>
                <span className="rounded-full bg-accent-warmth/15 px-3 py-1 text-xs font-medium text-accent-warmth">
                  {ONLINE_QUEUE_STATUS_LABEL}
                </span>
              </div>

              <dl className="space-y-3 text-sm">
                <div>
                  <dt className="text-primary-dark/50">Телефон</dt>
                  <dd className="mt-0.5">
                    <a
                      href={`tel:${selected.patientPhone.replace(/\s/g, "")}`}
                      className="inline-flex items-center gap-2 font-semibold text-primary-green hover:underline"
                    >
                      <Phone size={16} />
                      {selected.patientPhone}
                    </a>
                  </dd>
                </div>
                {selected.patientEmail && (
                  <div>
                    <dt className="text-primary-dark/50">Email</dt>
                    <dd>
                      <a
                        href={`mailto:${selected.patientEmail}`}
                        className="text-primary-green hover:underline"
                      >
                        {selected.patientEmail}
                      </a>
                    </dd>
                  </div>
                )}
                <div>
                  <dt className="text-primary-dark/50">Врач</dt>
                  <dd className="font-medium text-primary-dark">
                    {selected.doctorName}
                  </dd>
                </div>
                <div>
                  <dt className="text-primary-dark/50">Услуга</dt>
                  <dd className="font-medium text-primary-dark">
                    {serviceLabel(selected)}
                  </dd>
                </div>
                <div>
                  <dt className="text-primary-dark/50">Дата и время приёма</dt>
                  <dd className="font-medium text-primary-dark">
                    {formatDateInClinic(new Date(selected.startsAt))},{" "}
                    {formatTimeInClinic(new Date(selected.startsAt))}
                    <span className="text-primary-dark/50">
                      {" "}
                      ({selected.durationMinutes} мин)
                    </span>
                  </dd>
                </div>
                {selected.patientComment && (
                  <div>
                    <dt className="text-primary-dark/50">Комментарий пациента</dt>
                    <dd className="rounded-lg bg-neutral-bg px-3 py-2 text-primary-dark">
                      {selected.patientComment}
                    </dd>
                  </div>
                )}
                <div>
                  <dt className="text-primary-dark/50">Заявка создана</dt>
                  <dd className="text-primary-dark">
                    {formatDateInClinic(new Date(selected.createdAt))},{" "}
                    {formatTimeInClinic(new Date(selected.createdAt))}
                  </dd>
                </div>
              </dl>

              <label className="mt-6 block">
                <span className="mb-1 block text-sm font-medium text-primary-dark/70">
                  Заметки администратора
                </span>
                <textarea
                  className={`${fieldClass} min-h-[80px]`}
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Итог звонка, договорённости…"
                />
              </label>

              <div className="mt-6 flex flex-wrap gap-3">
                <Button
                  className="w-full sm:w-auto"
                  disabled={confirming || deleting}
                  onClick={() => void confirmBooking()}
                >
                  {confirming ? (
                    <Loader2 className="animate-spin" data-icon="inline-start" />
                  ) : (
                    <Check data-icon="inline-start" size={16} />
                  )}
                  Подтвердить запись
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  className="w-full sm:w-auto"
                  disabled={confirming || deleting}
                  onClick={() => void deleteBooking()}
                >
                  {deleting ? (
                    <Loader2 className="animate-spin" data-icon="inline-start" />
                  ) : (
                    <Trash2 data-icon="inline-start" size={16} />
                  )}
                  Удалить запись
                </Button>
              </div>
              <p className="mt-3 text-xs text-primary-dark/45">
                После подтверждения статус станет «Подтверждён», запись уйдёт
                из этого списка и останется в календаре приёма. Удаление
                освобождает слот для других пациентов.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
