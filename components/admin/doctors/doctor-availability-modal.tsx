"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Check, Clock, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { DurationDto } from "@/lib/appointments/serializer";
import type { TimeWindow } from "@/lib/appointments/windows";
import {
  DoctorAvailabilityDays,
  type DoctorAvailabilityDaySummary,
} from "./doctor-availability-days";
import { DateRangeCalendar } from "./date-range-calendar";

type Step = 1 | 2 | 3 | 4;

const fieldClass =
  "rounded-lg border border-neutral-border bg-white px-3 py-2 text-sm text-primary-dark outline-none focus:border-primary-green focus:ring-2 focus:ring-primary-green/20";

async function parseError(res: Response) {
  const data = await res.json().catch(() => ({}));
  throw new Error(
    typeof data.error === "string" ? data.error : "Произошла ошибка",
  );
}

type DoctorAvailabilityModalProps = {
  doctorId: string;
  doctorName: string;
  existingDays?: DoctorAvailabilityDaySummary[];
  onClose: () => void;
  onSaved: (
    doctorId: string,
    availabilityDays: DoctorAvailabilityDaySummary[],
  ) => void | Promise<void>;
};

export function DoctorAvailabilityModal({
  doctorId,
  doctorName,
  existingDays: initialExistingDays = [],
  onClose,
  onSaved,
}: DoctorAvailabilityModalProps) {
  const doctorIdRef = useRef(doctorId);
  doctorIdRef.current = doctorId;

  const [step, setStep] = useState<Step>(1);
  const [configuredDays, setConfiguredDays] =
    useState<DoctorAvailabilityDaySummary[]>(initialExistingDays);
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [windows, setWindows] = useState<TimeWindow[]>([
    { startTime: "08:00", endTime: "13:00" },
    { startTime: "14:00", endTime: "18:00" },
  ]);
  const [durations, setDurations] = useState<DurationDto[]>([]);
  const [durationMinutes, setDurationMinutes] = useState<number | null>(null);
  const [previewLabels, setPreviewLabels] = useState<string[]>([]);
  const [previewCount, setPreviewCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadDurations = useCallback(async () => {
    const res = await fetch("/api/admin/settings/durations");
    if (!res.ok) await parseError(res);
    const data = await res.json();
    setDurations(data.durations.filter((d: DurationDto) => d.published));
    if (data.durations[0] && durationMinutes === null) {
      setDurationMinutes(data.durations[0].minutes);
    }
  }, [durationMinutes]);

  const mapDaysFromApi = useCallback(
    (
      days: {
        dateKey: string;
        durationMinutes: number;
        slotsCount: number;
      }[],
    ): DoctorAvailabilityDaySummary[] =>
      days.map((d) => ({
        dateKey: d.dateKey,
        durationMinutes: d.durationMinutes,
        slotsCount: d.slotsCount,
      })),
    [],
  );

  const loadConfiguredDays = useCallback(async () => {
    const id = doctorIdRef.current;
    const res = await fetch(`/api/admin/doctors/${id}/availability`);
    if (!res.ok) return;
    const data = await res.json();
    setConfiguredDays(mapDaysFromApi(data.days));
  }, [mapDaysFromApi]);

  useEffect(() => {
    void loadDurations();
    void loadConfiguredDays();
  }, [loadDurations, loadConfiguredDays, doctorId]);

  useEffect(() => {
    setStep(1);
    setSelectedDates([]);
    setPreviewLabels([]);
    setPreviewCount(0);
    setError(null);
    setConfiguredDays(
      initialExistingDays.map((d) => ({
        dateKey: d.dateKey,
        durationMinutes: d.durationMinutes,
        slotsCount: d.slotsCount,
      })),
    );
  }, [doctorId, initialExistingDays]);

  async function loadPreview() {
    if (!durationMinutes) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/appointments/preview-slots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ windows, durationMinutes }),
      });
      if (!res.ok) await parseError(res);
      const data = await res.json();
      setPreviewLabels(data.labels);
      setPreviewCount(data.count);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (step === 4) void loadPreview();
  }, [step, windows, durationMinutes]);

  async function handleSave() {
    if (!durationMinutes || selectedDates.length === 0) return;
    setSaving(true);
    setError(null);
    try {
      const id = doctorIdRef.current;
      const res = await fetch(`/api/admin/doctors/${id}/availability`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dateKeys: selectedDates,
          windows,
          durationMinutes,
        }),
      });
      if (!res.ok) await parseError(res);
      const saved = await res.json();
      setConfiguredDays(mapDaysFromApi(saved.days ?? []));
      await onSaved(id, mapDaysFromApi(saved.days ?? []));
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка");
    } finally {
      setSaving(false);
    }
  }

  const steps = [
    { n: 1, label: "Даты" },
    { n: 2, label: "Режим работы" },
    { n: 3, label: "Длительность" },
    { n: 4, label: "Слоты" },
  ] as const;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="availability-modal-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-primary-dark/40 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Закрыть"
      />
      <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-white/80 bg-white/95 p-6 shadow-2xl backdrop-blur-[20px]">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1 text-primary-dark/40 hover:bg-secondary-mint hover:text-primary-dark"
          aria-label="Закрыть"
        >
          <X size={20} />
        </button>

        <h2
          id="availability-modal-title"
          className="pr-8 text-xl font-bold text-primary-dark"
        >
          Дни приёма
        </h2>
        <p className="mt-1 text-sm text-primary-green">{doctorName}</p>

        <div className="mt-6 flex gap-2">
          {steps.map((s) => (
            <div
              key={s.n}
              className={cn(
                "flex-1 rounded-lg py-2 text-center text-xs font-medium transition-colors",
                step >= s.n
                  ? "bg-primary-green/15 text-primary-green"
                  : "bg-neutral-bg text-primary-dark/40",
              )}
            >
              {s.label}
            </div>
          ))}
        </div>

        <div className="mt-6 min-h-[280px]">
          {step === 1 && (
            <div>
              <DoctorAvailabilityDays days={configuredDays} maxVisible={8} />
              <p className="mb-4 mt-4 text-sm text-primary-dark/70">
                Выберите дни в календаре: клик по дню или протяните мышью по
                диапазону будущих дат. Дни с обводкой уже имеют слоты — при
                сохранении расписание этих дней обновится.
              </p>
              <DateRangeCalendar
                selected={selectedDates}
                onChange={setSelectedDates}
                existingDays={configuredDays}
              />
            </div>
          )}

          {step === 2 && (
            <div>
              <p className="mb-4 text-sm text-primary-dark/70">
                Укажите интервалы работы (можно несколько, например утро и вечер).
              </p>
              <div className="space-y-3">
                {windows.map((w, i) => (
                  <div
                    key={i}
                    className="flex flex-wrap items-center gap-2 rounded-xl border border-neutral-border bg-neutral-bg/50 p-3"
                  >
                    <Clock size={16} className="text-primary-green" />
                    <input
                      type="time"
                      className={fieldClass}
                      value={w.startTime}
                      onChange={(e) => {
                        const next = [...windows];
                        next[i] = { ...w, startTime: e.target.value };
                        setWindows(next);
                      }}
                    />
                    <span className="text-primary-dark/50">—</span>
                    <input
                      type="time"
                      className={fieldClass}
                      value={w.endTime}
                      onChange={(e) => {
                        const next = [...windows];
                        next[i] = { ...w, endTime: e.target.value };
                        setWindows(next);
                      }}
                    />
                    {windows.length > 1 && (
                      <button
                        type="button"
                        className="ml-auto text-xs text-accent-warmth hover:underline"
                        onClick={() =>
                          setWindows(windows.filter((_, j) => j !== i))
                        }
                      >
                        Удалить
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={() =>
                  setWindows([...windows, { startTime: "09:00", endTime: "12:00" }])
                }
              >
                + Добавить интервал
              </Button>
            </div>
          )}

          {step === 3 && (
            <div>
              <p className="mb-4 text-sm text-primary-dark/70">
                Длительность одного приёма (настраивается в разделе «Настройки
                сайта»).
              </p>
              {durations.length === 0 ? (
                <p className="text-sm text-accent-warmth">
                  Сначала добавьте длительности в{" "}
                  <a href="/admin/settings" className="underline">
                    настройках
                  </a>
                  .
                </p>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {durations.map((d) => (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => setDurationMinutes(d.minutes)}
                      className={cn(
                        "rounded-xl border-2 px-4 py-6 text-center transition-all",
                        durationMinutes === d.minutes
                          ? "border-primary-green bg-secondary-mint shadow-sm"
                          : "border-neutral-border hover:border-primary-green/40",
                      )}
                    >
                      <span className="block text-2xl font-bold text-primary-dark">
                        {d.minutes}
                      </span>
                      <span className="text-sm text-primary-dark/60">
                        {d.label}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {step === 4 && (
            <div>
              <p className="mb-2 text-sm text-primary-dark/70">
                На каждый из {selectedDates.length} дней будет создано по{" "}
                <strong>{previewCount}</strong> слотов:
              </p>
              {loading ? (
                <p className="flex items-center gap-2 text-sm text-primary-dark/50">
                  <Loader2 className="animate-spin" size={16} /> Расчёт…
                </p>
              ) : (
                <div className="max-h-40 overflow-y-auto rounded-xl bg-secondary-mint/50 p-3">
                  <p className="flex flex-wrap gap-2 text-sm font-medium text-primary-dark">
                    {previewLabels.map((label) => (
                      <span
                        key={label}
                        className="rounded-lg bg-white px-2 py-1 shadow-sm"
                      >
                        {label}
                      </span>
                    ))}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {error && (
          <p className="mt-4 text-sm text-accent-warmth">{error}</p>
        )}

        <div className="mt-6 flex justify-between gap-3">
          <Button
            type="button"
            variant="outline"
            disabled={step === 1}
            onClick={() => setStep((s) => (s > 1 ? ((s - 1) as Step) : s))}
          >
            Назад
          </Button>
          {step < 4 ? (
            <Button
              type="button"
              disabled={
                (step === 1 && selectedDates.length === 0) ||
                (step === 2 && windows.length === 0) ||
                (step === 3 && !durationMinutes)
              }
              onClick={() => setStep((s) => (s < 4 ? ((s + 1) as Step) : s))}
            >
              Далее
            </Button>
          ) : (
            <Button
              type="button"
              disabled={saving || previewCount === 0}
              onClick={() => void handleSave()}
            >
              {saving ? (
                <Loader2 className="animate-spin" data-icon="inline-start" />
              ) : (
                <Check data-icon="inline-start" size={16} />
              )}
              Сохранить {selectedDates.length * previewCount} слотов
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
