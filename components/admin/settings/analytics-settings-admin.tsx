"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AnalyticsSettings } from "@/lib/analytics-settings";

async function parseError(res: Response) {
  const data = await res.json().catch(() => ({}));
  throw new Error(
    typeof data.error === "string" ? data.error : "Произошла ошибка",
  );
}

const fieldClass =
  "w-full rounded-lg border border-neutral-border bg-white px-3 py-2 text-sm text-primary-dark outline-none focus:border-primary-green focus:ring-2 focus:ring-primary-green/20";

const emptyForm: AnalyticsSettings = {
  googleAnalyticsCounter: "",
  googleAnalyticsCode: "",
  yandexMetrikaCounter: "",
  yandexMetrikaCode: "",
};

export function AnalyticsSettingsAdmin() {
  const [form, setForm] = useState<AnalyticsSettings>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/settings/analytics");
      if (!res.ok) await parseError(res);
      const data = (await res.json()) as AnalyticsSettings;
      setForm(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  function update<K extends keyof AnalyticsSettings>(
    key: K,
    value: AnalyticsSettings[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/settings/analytics", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) await parseError(res);
      const data = (await res.json()) as AnalyticsSettings;
      setForm(data);
      setMessage("Настройки аналитики сохранены");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Ошибка");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p className="text-primary-dark/60">Загрузка…</p>;
  }

  return (
    <form onSubmit={(e) => void handleSave(e)} className="max-w-3xl space-y-10">
      <div>
        <h1 className="text-2xl font-bold text-primary-dark">Аналитика</h1>
        <p className="mt-1 text-sm text-primary-dark/60">
          Счётчики подключаются только на публичном сайте. Укажите номер счётчика
          и при необходимости дополнительный код из кабинета Google или Яндекса.
        </p>
      </div>

      {message && (
        <p className="rounded-lg bg-secondary-mint px-3 py-2 text-sm text-primary-green">
          {message}
        </p>
      )}

      <section className="rounded-xl border border-neutral-border bg-white/70 p-6">
        <h2 className="mb-2 text-lg font-semibold text-primary-dark">
          Google Analytics
        </h2>
        <p className="mb-4 text-sm text-primary-dark/60">
          Номер счётчика — идентификатор измерения из кабинета (например{" "}
          <code className="text-primary-green">G-XXXXXXXXXX</code>). Код — фрагмент
          из раздела «Установка вручную», если нужен помимо стандартного тега.
        </p>
        <div className="space-y-4">
          <label className="block">
            <span className="mb-1 block text-sm font-medium">Номер счётчика</span>
            <input
              className={fieldClass}
              placeholder="G-XXXXXXXXXX"
              value={form.googleAnalyticsCounter}
              onChange={(e) =>
                update("googleAnalyticsCounter", e.target.value)
              }
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium">Код</span>
            <textarea
              className={`${fieldClass} min-h-[120px] font-mono text-xs`}
              placeholder="Дополнительный JavaScript (необязательно)"
              value={form.googleAnalyticsCode}
              onChange={(e) => update("googleAnalyticsCode", e.target.value)}
            />
          </label>
        </div>
      </section>

      <section className="rounded-xl border border-neutral-border bg-white/70 p-6">
        <h2 className="mb-2 text-lg font-semibold text-primary-dark">
          Яндекс Метрика
        </h2>
        <p className="mb-4 text-sm text-primary-dark/60">
          Номер счётчика — числовой ID из кабинета Метрики. Код — дополнительный
          фрагмент из блока установки, если требуется.
        </p>
        <div className="space-y-4">
          <label className="block">
            <span className="mb-1 block text-sm font-medium">Номер счётчика</span>
            <input
              className={fieldClass}
              placeholder="12345678"
              inputMode="numeric"
              value={form.yandexMetrikaCounter}
              onChange={(e) => update("yandexMetrikaCounter", e.target.value)}
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium">Код</span>
            <textarea
              className={`${fieldClass} min-h-[120px] font-mono text-xs`}
              placeholder="Дополнительный JavaScript (необязательно)"
              value={form.yandexMetrikaCode}
              onChange={(e) => update("yandexMetrikaCode", e.target.value)}
            />
          </label>
        </div>
      </section>

      <Button type="submit" disabled={saving}>
        {saving && <Loader2 className="animate-spin" data-icon="inline-start" />}
        Сохранить
      </Button>
    </form>
  );
}
