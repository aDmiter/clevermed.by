"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Check, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { BookingCategoryDto } from "@/lib/service-serializer";
import {
  formatBookingDateChip,
  formatDateInClinic,
} from "@/lib/appointments/clinic-time";
import {
  BY_PHONE_LOCAL_PLACEHOLDER,
  digitsFromBelarusPhone,
  formatBelarusPhone,
  formatBelarusPhoneDisplay,
  isBelarusPhoneComplete,
} from "@/lib/phone-by";

export type BookingDoctor = {
  id: string;
  name: string;
  title: string;
  image: string;
  specialty: string;
};

type Step = "doctor" | "service" | "datetime" | "details" | "done";

type BookableSlot = {
  id: string;
  label: string;
  startsAt: string;
  endsAt: string;
};

function DoctorBookingHeader({ doctor }: { doctor: BookingDoctor }) {
  return (
    <div className="mb-6 flex items-center gap-4 rounded-2xl border border-white/80 bg-white/60 p-4 shadow-sm backdrop-blur-[15px]">
      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-secondary-mint">
        <Image
          src={doctor.image}
          alt={doctor.name}
          fill
          className="object-cover object-top"
          sizes="80px"
        />
      </div>
      <div className="min-w-0">
        <p className="font-bold text-primary-dark">{doctor.name}</p>
        {doctor.title ? (
          <p className="mt-0.5 text-xs text-primary-dark/55">{doctor.title}</p>
        ) : null}
      </div>
    </div>
  );
}

async function parseError(res: Response) {
  const data = await res.json().catch(() => ({}));
  throw new Error(
    typeof data.error === "string" ? data.error : "Произошла ошибка",
  );
}

type AppointmentBookingProps = {
  doctors: BookingDoctor[];
  preselectedDoctorId?: string;
};

export function AppointmentBooking({
  doctors,
  preselectedDoctorId,
}: AppointmentBookingProps) {
  const skipDoctor = Boolean(preselectedDoctorId);
  const [step, setStep] = useState<Step>(
    preselectedDoctorId ? "service" : "doctor",
  );
  const [doctorId, setDoctorId] = useState(preselectedDoctorId ?? "");
  const [categoryId, setCategoryId] = useState("");
  const [categories, setCategories] = useState<BookingCategoryDto[]>([]);
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [dateKey, setDateKey] = useState("");
  const [slots, setSlots] = useState<BookableSlot[]>([]);
  const [selectedStartsAt, setSelectedStartsAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [doneMessage, setDoneMessage] = useState("");

  const [patientName, setPatientName] = useState("");
  const [patientPhoneDigits, setPatientPhoneDigits] = useState("");
  const [phoneFocused, setPhoneFocused] = useState(false);
  const phoneInputRef = useRef<HTMLInputElement>(null);
  const [patientEmail, setPatientEmail] = useState("");
  const [patientComment, setPatientComment] = useState("");

  const selectedDoctor = doctors.find((d) => d.id === doctorId);
  const selectedCategory = categories.find((c) => c.id === categoryId);
  const selectedSlot = slots.find((s) => s.startsAt === selectedStartsAt);
  const selectedDateChip = dateKey ? formatBookingDateChip(dateKey) : null;

  const loadCategories = useCallback(async () => {
    if (!doctorId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/appointments/services?doctorId=${doctorId}`,
      );
      if (!res.ok) await parseError(res);
      const data = await res.json();
      setCategories(data.categories);
      setCategoryId("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка");
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, [doctorId]);

  const loadDates = useCallback(async () => {
    if (!doctorId || !categoryId) return;
    setLoading(true);
    try {
      const res = await fetch(
        `/api/appointments/dates?doctorId=${doctorId}&categoryId=${categoryId}`,
      );
      if (!res.ok) await parseError(res);
      const data = await res.json();
      setAvailableDates(data.dates);
      setDateKey(data.dates[0] ?? "");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка");
      setAvailableDates([]);
    } finally {
      setLoading(false);
    }
  }, [doctorId, categoryId]);

  const loadSlots = useCallback(async () => {
    if (!doctorId || !categoryId || !dateKey) return;
    setLoading(true);
    try {
      const res = await fetch(
        `/api/appointments/slots?doctorId=${doctorId}&categoryId=${categoryId}&date=${dateKey}`,
      );
      if (!res.ok) await parseError(res);
      const data = await res.json();
      setSlots(data.slots);
      setSelectedStartsAt(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка");
      setSlots([]);
    } finally {
      setLoading(false);
    }
  }, [doctorId, categoryId, dateKey]);

  useEffect(() => {
    setCategoryId("");
    setAvailableDates([]);
    setDateKey("");
    setSlots([]);
    setSelectedStartsAt(null);
  }, [doctorId]);

  useEffect(() => {
    if (step === "service") void loadCategories();
  }, [step, loadCategories]);

  useEffect(() => {
    if (step === "datetime" && categoryId) void loadDates();
  }, [step, categoryId, loadDates]);

  useEffect(() => {
    if (step === "datetime" && dateKey) void loadSlots();
  }, [step, dateKey, loadSlots]);

  async function submitBooking() {
    if (!selectedStartsAt || !categoryId) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          doctorId,
          categoryId,
          startsAt: selectedStartsAt,
          patientName,
          patientPhone: formatBelarusPhone(patientPhoneDigits),
          patientEmail: patientEmail || null,
          patientComment: patientComment || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) await parseError(res);
      setDoneMessage(data.message ?? "Запись подтверждена");
      setStep("done");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка");
    } finally {
      setSubmitting(false);
    }
  }

  const stepLabels = skipDoctor
    ? ["Услуга", "Дата и время", "Контакты"]
    : ["Врач", "Услуга", "Дата и время", "Контакты"];

  const stepKeys: Step[] = skipDoctor
    ? ["service", "datetime", "details"]
    : ["doctor", "service", "datetime", "details"];

  const currentIdx = stepKeys.indexOf(
    step === "done" ? "details" : step,
  );

  return (
    <div className="mx-auto max-w-3xl">
      {step !== "done" && (
        <nav className="mb-10 flex flex-wrap justify-center gap-2">
          {stepLabels.map((label, i) => (
            <div
              key={label}
              className={cn(
                "flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors",
                i <= currentIdx
                  ? "bg-primary-green text-white"
                  : "bg-white/60 text-primary-dark/50",
              )}
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20 text-xs">
                {i < currentIdx ? <Check size={14} /> : i + 1}
              </span>
              {label}
            </div>
          ))}
        </nav>
      )}

      {error && (
        <p className="mb-6 rounded-xl bg-accent-warmth/10 px-4 py-3 text-sm text-accent-warmth">
          {error}
        </p>
      )}

      {step === "doctor" && (
        <div className="grid gap-4 sm:grid-cols-2">
          {doctors.map((d) => (
            <button
              key={d.id}
              type="button"
              onClick={() => {
                setDoctorId(d.id);
                setStep("service");
              }}
              className="flex gap-4 rounded-2xl border border-white/80 bg-white/60 p-4 text-left shadow-sm backdrop-blur-[15px] transition-all hover:-translate-y-0.5 hover:border-primary-green/30"
            >
              <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-secondary-mint">
                <Image
                  src={d.image}
                  alt={d.name}
                  fill
                  className="object-cover object-top"
                  sizes="80px"
                />
              </div>
              <div>
                <p className="font-bold text-primary-dark">{d.name}</p>
                <p className="text-sm text-primary-green">{d.title}</p>
              </div>
            </button>
          ))}
        </div>
      )}

      {step === "service" && (
        <div>
          {!skipDoctor && selectedDoctor && (
            <button
              type="button"
              className="mb-6 flex items-center gap-1 text-sm text-primary-green hover:underline"
              onClick={() => setStep("doctor")}
            >
              <ChevronLeft size={16} /> Выбрать другого врача
            </button>
          )}
          {selectedDoctor && <DoctorBookingHeader doctor={selectedDoctor} />}
          {loading ? (
            <p className="flex items-center gap-2 text-primary-dark/60">
              <Loader2 className="animate-spin" size={18} /> Загрузка…
            </p>
          ) : categories.length === 0 ? (
            <p className="text-primary-dark/60">
              Для этого врача пока нет доступных направлений для записи.
              Уточните в регистратуре.
            </p>
          ) : (
            <div className="grid gap-3">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    setCategoryId(cat.id);
                    setStep("datetime");
                  }}
                  className="rounded-2xl border border-white/80 bg-white/60 px-5 py-4 text-left transition-all hover:border-primary-green/40 hover:shadow-md"
                >
                  <p className="font-semibold text-primary-dark">{cat.name}</p>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {step === "datetime" && categoryId && (
        <div>
          <button
            type="button"
            className="mb-6 flex items-center gap-1 text-sm text-primary-green hover:underline"
            onClick={() => setStep("service")}
          >
            <ChevronLeft size={16} /> Изменить услугу
          </button>
          {selectedCategory ? (
            <p className="mb-6 font-semibold text-primary-dark">
              {selectedCategory.name}
            </p>
          ) : (
            <p className="mb-6 flex items-center gap-2 text-primary-dark/60">
              <Loader2 className="animate-spin" size={18} /> Загрузка…
            </p>
          )}

          {loading && availableDates.length === 0 ? (
            <p className="flex items-center gap-2 text-primary-dark/60">
              <Loader2 className="animate-spin" size={18} /> Загрузка дат…
            </p>
          ) : availableDates.length === 0 ? (
            <p className="text-primary-dark/60">
              Нет свободных дней приёма для этой услуги.
            </p>
          ) : (
            <>
              <div className="sticky top-4 z-10 mb-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/80 bg-neutral-bg/95 p-4 shadow-sm backdrop-blur-[15px]">
                <div className="min-w-0 text-sm">
                  {selectedStartsAt && selectedDateChip ? (
                    <p className="font-medium text-primary-dark">
                      {selectedDateChip.dayNum} {selectedDateChip.month},{" "}
                      {selectedSlot?.label}
                    </p>
                  ) : dateKey ? (
                    <p className="text-primary-dark/60">
                      Выберите время приёма
                    </p>
                  ) : (
                    <p className="text-primary-dark/60">Выберите дату</p>
                  )}
                </div>
                <Button
                  className="shrink-0"
                  disabled={!selectedStartsAt}
                  onClick={() => setStep("details")}
                >
                  Далее
                  <ChevronRight size={16} data-icon="inline-end" />
                </Button>
              </div>

              <section className="mb-8">
                <h3 className="text-base font-semibold text-primary-dark">
                  Выберите дату
                </h3>
                <p className="mt-1 text-sm text-primary-dark/55">
                  Нажмите на удобный день приёма
                </p>
                <div className="relative mt-4 -mx-1 px-1">
                  <div className="flex gap-3 overflow-x-auto pb-3 pt-1 scroll-smooth">
                    {availableDates.map((d) => {
                      const chip = formatBookingDateChip(d);
                      const selected = dateKey === d;
                      return (
                        <button
                          key={d}
                          type="button"
                          aria-pressed={selected}
                          onClick={() => setDateKey(d)}
                          className={cn(
                            "flex min-w-[5.25rem] shrink-0 flex-col items-center rounded-2xl border-2 px-4 py-3 shadow-sm transition-all",
                            selected
                              ? "scale-[1.02] border-primary-green bg-primary-green text-white shadow-md"
                              : "border-neutral-border bg-white/90 text-primary-dark hover:border-primary-green/45 hover:bg-secondary-mint hover:shadow-md",
                          )}
                        >
                          <span className="text-2xl font-bold leading-none tabular-nums">
                            {chip.dayNum}
                          </span>
                          <span
                            className={cn(
                              "mt-1.5 text-xs font-semibold capitalize",
                              selected
                                ? "text-white/90"
                                : "text-primary-green",
                            )}
                          >
                            {chip.weekday}
                          </span>
                          <span
                            className={cn(
                              "mt-0.5 text-[11px] capitalize",
                              selected
                                ? "text-white/75"
                                : "text-primary-dark/50",
                            )}
                          >
                            {chip.month}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </section>

              <section>
                <h3 className="text-base font-semibold text-primary-dark">
                  Выберите время
                </h3>
                <p className="mt-1 text-sm text-primary-dark/55">
                  {selectedDateChip
                    ? `Свободные слоты на ${selectedDateChip.dayNum} ${selectedDateChip.month}`
                    : "Сначала выберите дату"}
                </p>
                {loading ? (
                  <p className="mt-4 flex items-center gap-2 text-primary-dark/60">
                    <Loader2 className="animate-spin" size={18} /> Загрузка
                    времени…
                  </p>
                ) : slots.length === 0 ? (
                  <p className="mt-4 text-primary-dark/60">
                    Нет свободного времени на выбранный день.
                  </p>
                ) : (
                  <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
                    {slots.map((slot) => (
                      <button
                        key={slot.id}
                        type="button"
                        aria-pressed={selectedStartsAt === slot.startsAt}
                        onClick={() => setSelectedStartsAt(slot.startsAt)}
                        className={cn(
                          "rounded-xl border-2 py-3 text-sm font-semibold tabular-nums transition-all",
                          selectedStartsAt === slot.startsAt
                            ? "border-primary-green bg-primary-green text-white shadow-md"
                            : "border-neutral-border bg-white/90 text-primary-dark hover:border-primary-green/45 hover:bg-secondary-mint/80",
                        )}
                      >
                        {slot.label}
                      </button>
                    ))}
                  </div>
                )}
              </section>

              <Button
                className="mt-8 w-full sm:w-auto"
                disabled={!selectedStartsAt}
                onClick={() => setStep("details")}
              >
                Далее
                <ChevronRight size={16} data-icon="inline-end" />
              </Button>
            </>
          )}
        </div>
      )}

      {step === "details" &&
        selectedCategory &&
        selectedSlot &&
        selectedDoctor && (
        <div className="booking-form">
          <button
            type="button"
            className="booking-form__back"
            onClick={() => setStep("datetime")}
          >
            <ChevronLeft size={16} aria-hidden /> Изменить время
          </button>

          <div className="booking-form__summary">
            <p className="booking-form__summary-tag">Ваша запись</p>
            <p className="booking-form__summary-line booking-form__summary-line--service">
              {selectedCategory.name}
            </p>
            <p className="booking-form__summary-line booking-form__summary-line--doctor">
              {selectedDoctor.name}
            </p>
            <p className="booking-form__summary-line">
              {formatDateInClinic(new Date(selectedSlot.startsAt))},{" "}
              {selectedSlot.label}
            </p>
          </div>

          <header className="booking-form__header">
            <h2 className="booking-form__title">Контактные данные</h2>
            <p className="booking-form__hint">
              Оставьте телефон — администратор перезвонит для подтверждения записи.
            </p>
          </header>

          <div className="booking-form__fields">
            <div className="booking-form__field booking-form__field--full">
              <label className="booking-form__label" htmlFor="booking-name">
                <span className="booking-form__label-text">
                  ФИО <span className="booking-form__required">*</span>
                </span>
                <input
                  id="booking-name"
                  className="booking-form__input"
                  name="patientName"
                  autoComplete="name"
                  placeholder="Иванов Иван Иванович"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  required
                />
              </label>
            </div>

            <div className="booking-form__field">
              <label className="booking-form__label" htmlFor="booking-phone">
                <span className="booking-form__label-text">
                  Телефон <span className="booking-form__required">*</span>
                </span>
                <input
                  ref={phoneInputRef}
                  id="booking-phone"
                  className="booking-form__input"
                  name="patientPhone"
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel"
                  placeholder={BY_PHONE_LOCAL_PLACEHOLDER}
                  value={formatBelarusPhoneDisplay(
                    patientPhoneDigits,
                    phoneFocused,
                  )}
                  onFocus={() => {
                    setPhoneFocused(true);
                    requestAnimationFrame(() => {
                      const el = phoneInputRef.current;
                      if (el) {
                        const end = el.value.length;
                        el.setSelectionRange(end, end);
                      }
                    });
                  }}
                  onBlur={() => setPhoneFocused(false)}
                  onChange={(e) =>
                    setPatientPhoneDigits(
                      digitsFromBelarusPhone(e.target.value),
                    )
                  }
                  required
                />
              </label>
            </div>

            <div className="booking-form__field">
              <label className="booking-form__label" htmlFor="booking-email">
                <span className="booking-form__label-text">
                  Email{" "}
                  <span className="booking-form__optional">необязательно</span>
                </span>
                <input
                  id="booking-email"
                  className="booking-form__input"
                  name="patientEmail"
                  type="email"
                  autoComplete="email"
                  placeholder="ivanov@mail.ru"
                  value={patientEmail}
                  onChange={(e) => setPatientEmail(e.target.value)}
                />
              </label>
            </div>

            <div className="booking-form__field booking-form__field--full">
              <label className="booking-form__label" htmlFor="booking-comment">
                <span className="booking-form__label-text">
                  Комментарий{" "}
                  <span className="booking-form__optional">необязательно</span>
                </span>
                <textarea
                  id="booking-comment"
                  className="booking-form__textarea"
                  name="patientComment"
                  placeholder="Например: первичный приём, нужна справка для работы"
                  value={patientComment}
                  onChange={(e) => setPatientComment(e.target.value)}
                />
              </label>
            </div>
          </div>

          <div className="booking-form__actions">
            <Button
              className="booking-form__submit"
              disabled={
                submitting ||
                !patientName ||
                !isBelarusPhoneComplete(patientPhoneDigits)
              }
              onClick={() => void submitBooking()}
            >
              {submitting && (
                <Loader2 className="animate-spin" data-icon="inline-start" />
              )}
              Подтвердить запись
            </Button>
          </div>
        </div>
      )}

      {step === "done" && (
        <div className="rounded-2xl border border-white/80 bg-white/60 p-8 text-center backdrop-blur-[15px]">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary-green text-white">
            <Check size={32} />
          </div>
          <h2 className="mb-2 text-2xl font-bold text-primary-dark">
            Запись оформлена
          </h2>
          <p className="text-primary-dark/70">{doneMessage}</p>
        </div>
      )}
    </div>
  );
}
