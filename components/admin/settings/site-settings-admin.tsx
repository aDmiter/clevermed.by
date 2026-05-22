"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { DurationDto } from "@/lib/appointments/serializer";

async function parseError(res: Response) {
  const data = await res.json().catch(() => ({}));
  throw new Error(
    typeof data.error === "string" ? data.error : "Произошла ошибка",
  );
}

const fieldClass =
  "w-full rounded-lg border border-neutral-border bg-white px-3 py-2 text-sm text-primary-dark outline-none focus:border-primary-green focus:ring-2 focus:ring-primary-green/20";

export function SiteSettingsAdmin() {
  const [onlineBookingEnabled, setOnlineBookingEnabled] = useState(true);
  const [savingSite, setSavingSite] = useState(false);
  const [durations, setDurations] = useState<DurationDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [newDuration, setNewDuration] = useState({ label: "", minutes: 25 });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [siteRes, dRes] = await Promise.all([
        fetch("/api/admin/settings/site"),
        fetch("/api/admin/settings/durations"),
      ]);
      if (!siteRes.ok) await parseError(siteRes);
      if (!dRes.ok) await parseError(dRes);
      const siteData = await siteRes.json();
      const dData = await dRes.json();
      setOnlineBookingEnabled(Boolean(siteData.onlineBookingEnabled));
      setDurations(dData.durations);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function saveSiteSettings(enabled: boolean) {
    setSavingSite(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/settings/site", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ onlineBookingEnabled: enabled }),
      });
      if (!res.ok) await parseError(res);
      const data = await res.json();
      setOnlineBookingEnabled(Boolean(data.onlineBookingEnabled));
      setMessage(
        data.onlineBookingEnabled
          ? "Онлайн-запись на сайте включена"
          : "Онлайн-запись отключена — кнопки «Записаться» ведут на страницу контактов",
      );
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Ошибка");
      void load();
    } finally {
      setSavingSite(false);
    }
  }

  async function addDuration() {
    const res = await fetch("/api/admin/settings/durations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newDuration),
    });
    if (!res.ok) await parseError(res);
    setNewDuration({ label: "", minutes: 25 });
    setMessage("Длительность добавлена");
    await load();
  }

  async function deleteDuration(id: string) {
    if (!confirm("Удалить длительность?")) return;
    const res = await fetch(`/api/admin/settings/durations/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) await parseError(res);
    setMessage("Удалено");
    await load();
  }

  if (loading) {
    return <p className="text-primary-dark/60">Загрузка…</p>;
  }

  return (
    <div className="max-w-3xl space-y-10">
      <div>
        <h1 className="text-2xl font-bold text-primary-dark">Настройки сайта</h1>
        <p className="mt-1 text-sm text-primary-dark/60">
          Публичный сайт, онлайн-запись и длительности приёма для услуг
        </p>
      </div>

      {message && (
        <p className="rounded-lg bg-secondary-mint px-3 py-2 text-sm text-primary-green">
          {message}
        </p>
      )}

      <section className="rounded-xl border border-neutral-border bg-white/70 p-6">
        <h2 className="mb-2 text-lg font-semibold text-primary-dark">
          Запись на сайте
        </h2>
        <p className="mb-4 text-sm text-primary-dark/60">
          Если опция выключена, все кнопки «Записаться» на сайте ведут на страницу
          контактов. Разделы записи в админке остаются доступны.
        </p>
        <label className="flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            className="mt-1 h-4 w-4 rounded border-neutral-border text-primary-green focus:ring-primary-green/30"
            checked={onlineBookingEnabled}
            disabled={savingSite}
            onChange={(e) => void saveSiteSettings(e.target.checked)}
          />
          <span className="text-sm text-primary-dark">
            <span className="font-medium">Использовать запись на сайте</span>
            <span className="mt-1 block text-primary-dark/55">
              Включить форму онлайн-записи для пациентов на странице /booking
            </span>
          </span>
        </label>
        {savingSite && (
          <p className="mt-3 flex items-center gap-2 text-sm text-primary-dark/50">
            <Loader2 className="animate-spin" size={16} /> Сохранение…
          </p>
        )}
      </section>

      <section className="rounded-xl border border-neutral-border bg-white/70 p-6">
        <h2 className="mb-2 text-lg font-semibold text-primary-dark">
          Длительности приёма
        </h2>
        <p className="mb-4 text-sm text-primary-dark/60">
          Используются в разделе «Услуги» при привязке категории к врачу. Запись на
          приём и онлайн-запись идут по услугам из каталога, не по отдельному
          справочнику процедур.
        </p>
        <ul className="mb-6 space-y-2">
          {durations.map((d) => (
            <li
              key={d.id}
              className="flex items-center justify-between rounded-lg border border-neutral-border px-4 py-3"
            >
              <span>
                <strong>{d.label}</strong> — {d.minutes} мин.
              </span>
              <Button
                type="button"
                variant="destructive"
                size="icon-sm"
                onClick={() => void deleteDuration(d.id)}
              >
                <Trash2 size={14} />
              </Button>
            </li>
          ))}
        </ul>
        <div className="flex flex-wrap gap-3">
          <input
            className={`${fieldClass} max-w-[200px]`}
            placeholder="Название"
            value={newDuration.label}
            onChange={(e) =>
              setNewDuration((d) => ({ ...d, label: e.target.value }))
            }
          />
          <input
            type="number"
            className={`${fieldClass} w-24`}
            min={5}
            step={5}
            value={newDuration.minutes}
            onChange={(e) =>
              setNewDuration((d) => ({
                ...d,
                minutes: Number(e.target.value),
              }))
            }
          />
          <Button type="button" onClick={() => void addDuration()}>
            <Plus size={16} data-icon="inline-start" />
            Добавить
          </Button>
        </div>
      </section>
    </div>
  );
}
