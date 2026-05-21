"use client";

import { useCallback, useEffect, useState } from "react";
import { Check, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ServiceCategoryDto } from "@/lib/service-serializer";

async function parseError(res: Response) {
  const data = await res.json().catch(() => ({}));
  throw new Error(
    typeof data.error === "string" ? data.error : "Произошла ошибка",
  );
}

type DoctorCategoriesModalProps = {
  doctorId: string;
  doctorName: string;
  initialCategoryIds?: string[];
  onClose: () => void;
  onSaved: (categoryIds: string[]) => void | Promise<void>;
};

export function DoctorCategoriesModal({
  doctorId,
  doctorName,
  initialCategoryIds = [],
  onClose,
  onSaved,
}: DoctorCategoriesModalProps) {
  const [categories, setCategories] = useState<ServiceCategoryDto[]>([]);
  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(initialCategoryIds),
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/doctors/${doctorId}/categories`);
      if (!res.ok) await parseError(res);
      const data = await res.json();
      setCategories(data.categories);
      setSelected(new Set(data.categoryIds as string[]));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка");
    } finally {
      setLoading(false);
    }
  }, [doctorId]);

  useEffect(() => {
    void load();
  }, [load]);

  function toggle(categoryId: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(categoryId)) next.delete(categoryId);
      else next.add(categoryId);
      return next;
    });
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      const categoryIds = [...selected];
      const res = await fetch(`/api/admin/doctors/${doctorId}/categories`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categoryIds }),
      });
      if (!res.ok) await parseError(res);
      await onSaved(categoryIds);
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка");
    } finally {
      setSaving(false);
    }
  }

  const bookableCount = categories.filter((c) => c.durationMinutes != null).length;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="doctor-categories-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-primary-dark/40 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Закрыть"
      />
      <div className="relative flex max-h-[85vh] w-full max-w-lg flex-col rounded-2xl border border-white/80 bg-white/95 shadow-2xl backdrop-blur-[20px]">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 z-10 rounded-lg p-1 text-primary-dark/40 hover:bg-secondary-mint hover:text-primary-dark"
          aria-label="Закрыть"
        >
          <X size={20} />
        </button>

        <div className="border-b border-neutral-border px-6 pb-4 pt-6">
          <h2
            id="doctor-categories-title"
            className="pr-8 text-xl font-bold text-primary-dark"
          >
            Категории услуг
          </h2>
          <p className="mt-1 text-sm text-primary-green">{doctorName}</p>
          <p className="mt-2 text-xs text-primary-dark/55">
            Для онлайн-записи доступны категории с заданным временем приёма.
            Выбрано: {selected.size}
          </p>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {loading ? (
            <p className="flex items-center gap-2 text-sm text-primary-dark/60">
              <Loader2 className="animate-spin" size={18} />
              Загрузка…
            </p>
          ) : categories.length === 0 ? (
            <p className="text-sm text-primary-dark/60">
              Сначала добавьте категории в{" "}
              <a href="/admin/services" className="text-primary-green underline">
                каталоге услуг
              </a>
              .
            </p>
          ) : (
            <ul className="space-y-2">
              {categories.map((category) => {
                const hasDuration = category.durationMinutes != null;
                return (
                  <li key={category.id}>
                    <label
                      className={`flex cursor-pointer items-center gap-3 rounded-xl px-4 py-3 transition-colors ${
                        hasDuration
                          ? "hover:bg-secondary-mint/60"
                          : "cursor-not-allowed opacity-50"
                      }`}
                    >
                      <input
                        type="checkbox"
                        className="size-4 shrink-0 accent-primary-green"
                        disabled={!hasDuration}
                        checked={selected.has(category.id)}
                        onChange={() => toggle(category.id)}
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-semibold text-primary-dark">
                          {category.name}
                        </span>
                        <span className="text-xs text-primary-dark/50">
                          {hasDuration
                            ? `${category.durationMinutes} мин · ${category.services.length} поз. в каталоге`
                            : "Укажите время приёма в каталоге услуг"}
                        </span>
                      </span>
                    </label>
                  </li>
                );
              })}
            </ul>
          )}
          {!loading && bookableCount < categories.length && (
            <p className="mt-4 text-xs text-accent-warmth">
              Категории без времени приёма нельзя выбрать для записи.
            </p>
          )}
        </div>

        {error && (
          <p className="px-6 text-sm text-accent-warmth">{error}</p>
        )}

        <div className="flex justify-end gap-3 border-t border-neutral-border px-6 py-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Отмена
          </Button>
          <Button
            type="button"
            disabled={saving || loading}
            onClick={() => void handleSave()}
          >
            {saving ? (
              <Loader2 className="animate-spin" data-icon="inline-start" />
            ) : (
              <Check data-icon="inline-start" size={16} />
            )}
            Сохранить
          </Button>
        </div>
      </div>
    </div>
  );
}
