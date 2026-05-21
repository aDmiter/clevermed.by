"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { GripVertical, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { DurationDto } from "@/lib/appointments/serializer";
import type { ServiceCategoryDto, ServiceDto } from "@/lib/service-serializer";

async function parseError(res: Response) {
  const data = await res.json().catch(() => ({}));
  throw new Error(
    typeof data.error === "string" ? data.error : "Произошла ошибка",
  );
}

const inputClass =
  "w-full rounded-lg border border-neutral-border bg-white px-3 py-2 text-sm text-primary-dark outline-none focus:border-primary-green focus:ring-2 focus:ring-primary-green/20";

const compactClass =
  "shrink-0 rounded-lg border border-neutral-border bg-white px-2 py-1.5 text-sm text-primary-dark outline-none focus:border-primary-green focus:ring-2 focus:ring-primary-green/20";

const priceClass = `${compactClass} w-[88px]`;
const durationClass = `${compactClass} w-[4.25rem] max-w-[4.25rem]`;

type DraftRow = {
  key: string;
  title: string;
  amount: string;
};

function formatPrice(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(2);
}

export function ServicesAdmin() {
  const [categories, setCategories] = useState<ServiceCategoryDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [dragCategoryId, setDragCategoryId] = useState<string | null>(null);
  const [dragService, setDragService] = useState<{
    categoryId: string;
    id: string;
  } | null>(null);
  const [drafts, setDrafts] = useState<Record<string, DraftRow>>({});
  const [durations, setDurations] = useState<DurationDto[]>([]);
  const categoriesRef = useRef(categories);

  useEffect(() => {
    categoriesRef.current = categories;
  }, [categories]);

  const loadCatalog = useCallback(async () => {
    setLoading(true);
    try {
      const [catalogRes, durationsRes] = await Promise.all([
        fetch("/api/admin/services/catalog"),
        fetch("/api/admin/settings/durations"),
      ]);
      if (!catalogRes.ok) await parseError(catalogRes);
      if (!durationsRes.ok) await parseError(durationsRes);
      const catalogData = await catalogRes.json();
      const durationsData = await durationsRes.json();
      setCategories(catalogData.categories);
      setDurations(
        durationsData.durations.filter((d: DurationDto) => d.published),
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadCatalog();
  }, [loadCatalog]);

  function setDraft(service: ServiceDto, patch: Partial<DraftRow>) {
    setDrafts((prev) => ({
      ...prev,
      [service.id]: {
        key: service.id,
        title: prev[service.id]?.title ?? service.title,
        amount: prev[service.id]?.amount ?? formatPrice(service.amount),
        ...patch,
      },
    }));
  }

  function getDraft(service: ServiceDto): DraftRow {
    return (
      drafts[service.id] ?? {
        key: service.id,
        title: service.title,
        amount: formatPrice(service.amount),
      }
    );
  }

  async function saveService(service: ServiceDto, patch?: Partial<DraftRow>) {
    const draft = { ...getDraft(service), ...patch };
    const amount = Number.parseFloat(draft.amount.replace(",", "."));
    if (!draft.title.trim()) return;
    if (Number.isNaN(amount) || amount < 0) {
      setMessage("Укажите корректную цену");
      return;
    }

    const res = await fetch(`/api/admin/services/${service.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: draft.title.trim(),
        amount,
      }),
    });
    if (!res.ok) await parseError(res);
    const data = await res.json();
    setCategories((cats) =>
      cats.map((cat) => ({
        ...cat,
        services: cat.services.map((s) =>
          s.id === service.id ? data.service : s,
        ),
      })),
    );
    setDrafts((prev) => {
      const next = { ...prev };
      delete next[service.id];
      return next;
    });
  }

  async function saveCategoryDuration(
    category: ServiceCategoryDto,
    durationId: string,
  ) {
    const res = await fetch(`/api/admin/service-categories/${category.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ durationId: durationId || null }),
    });
    if (!res.ok) await parseError(res);
    const data = await res.json();
    setCategories((cats) =>
      cats.map((c) => (c.id === category.id ? data.category : c)),
    );
    setMessage("Время приёма для категории сохранено");
  }

  async function deleteService(serviceId: string, categoryId: string) {
    if (!confirm("Удалить услугу?")) return;
    const res = await fetch(`/api/admin/services/${serviceId}`, {
      method: "DELETE",
    });
    if (!res.ok) await parseError(res);
    setCategories((cats) =>
      cats.map((cat) =>
        cat.id === categoryId
          ? {
              ...cat,
              services: cat.services.filter((s) => s.id !== serviceId),
            }
          : cat,
      ),
    );
    setMessage("Услуга удалена");
  }

  async function addService(categoryId: string) {
    const res = await fetch("/api/admin/services", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        categoryId,
        title: "Новая услуга",
        amount: 0,
      }),
    });
    if (!res.ok) await parseError(res);
    const data = await res.json();
    setCategories((cats) =>
      cats.map((cat) =>
        cat.id === categoryId
          ? { ...cat, services: [...cat.services, data.service] }
          : cat,
      ),
    );
    setMessage("Услуга добавлена");
  }

  async function saveCategoryName(category: ServiceCategoryDto, name: string) {
    if (!name.trim() || name === category.name) return;
    const res = await fetch(`/api/admin/service-categories/${category.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim() }),
    });
    if (!res.ok) await parseError(res);
    setCategories((cats) =>
      cats.map((c) => (c.id === category.id ? { ...c, name: name.trim() } : c)),
    );
  }

  async function deleteCategory(categoryId: string) {
    if (!confirm("Удалить категорию и все услуги в ней?")) return;
    const res = await fetch(`/api/admin/service-categories/${categoryId}`, {
      method: "DELETE",
    });
    if (!res.ok) await parseError(res);
    setCategories((cats) => cats.filter((c) => c.id !== categoryId));
    setMessage("Категория удалена");
  }

  async function addCategory() {
    if (!newCategoryName.trim()) return;
    const res = await fetch("/api/admin/service-categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newCategoryName.trim() }),
    });
    if (!res.ok) await parseError(res);
    const data = await res.json();
    setCategories((cats) => [...cats, data.category]);
    setNewCategoryName("");
    setMessage("Категория добавлена");
  }

  async function persistCategoryOrder(next: ServiceCategoryDto[]) {
    setCategories(next);
    const res = await fetch("/api/admin/service-categories/reorder", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderedIds: next.map((c) => c.id) }),
    });
    if (!res.ok) await parseError(res);
  }

  async function persistServiceOrder(
    categoryId: string,
    nextServices: ServiceDto[],
  ) {
    setCategories((cats) =>
      cats.map((cat) =>
        cat.id === categoryId ? { ...cat, services: nextServices } : cat,
      ),
    );
    const res = await fetch("/api/admin/services/reorder", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderedIds: nextServices.map((s) => s.id) }),
    });
    if (!res.ok) await parseError(res);
  }

  function handleCategoryDragOver(e: React.DragEvent, overId: string) {
    e.preventDefault();
    if (!dragCategoryId || dragCategoryId === overId) return;
    setCategories((items) => {
      const from = items.findIndex((c) => c.id === dragCategoryId);
      const to = items.findIndex((c) => c.id === overId);
      if (from < 0 || to < 0) return items;
      const next = [...items];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      categoriesRef.current = next;
      return next;
    });
  }

  function handleServiceDragOver(
    e: React.DragEvent,
    categoryId: string,
    overId: string,
  ) {
    e.preventDefault();
    if (!dragService || dragService.categoryId !== categoryId) return;
    if (dragService.id === overId) return;

    setCategories((cats) =>
      cats.map((cat) => {
        if (cat.id !== categoryId) return cat;
        const from = cat.services.findIndex((s) => s.id === dragService.id);
        const to = cat.services.findIndex((s) => s.id === overId);
        if (from < 0 || to < 0) return cat;
        const next = [...cat.services];
        const [moved] = next.splice(from, 1);
        next.splice(to, 0, moved);
        return { ...cat, services: next };
      }),
    );
  }

  if (loading) {
    return <p className="text-primary-dark/60">Загрузка каталога…</p>;
  }

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-primary-dark">Каталог услуг</h1>
        <p className="mt-1 text-sm text-primary-dark/60">
          Время приёма задаётся для категории — все услуги в ней используют
          эту длительность при записи. Перетаскивайте строки и категории.
        </p>
      </div>

      {message && (
        <p className="mb-4 rounded-lg bg-secondary-mint px-3 py-2 text-sm text-primary-green">
          {message}
        </p>
      )}

      <div className="space-y-6">
        {categories.map((category) => (
          <section
            key={category.id}
            draggable
            onDragStart={() => setDragCategoryId(category.id)}
            onDragOver={(e) => handleCategoryDragOver(e, category.id)}
            onDragEnd={() => {
              if (dragCategoryId) {
                void persistCategoryOrder(categoriesRef.current);
              }
              setDragCategoryId(null);
            }}
            className={`rounded-xl border bg-white/70 transition-shadow ${
              dragCategoryId === category.id
                ? "border-primary-green shadow-md"
                : "border-neutral-border"
            }`}
          >
            <div className="flex flex-wrap items-center gap-3 border-b border-neutral-border px-4 py-3">
              <button
                type="button"
                className="cursor-grab text-primary-dark/40 hover:text-primary-green active:cursor-grabbing"
                aria-label="Перетащить категорию"
              >
                <GripVertical size={18} />
              </button>
              <input
                className={`${inputClass} min-w-0 flex-1 font-semibold`}
                defaultValue={category.name}
                onBlur={(e) => void saveCategoryName(category, e.target.value)}
              />
              <label className="flex shrink-0 items-center gap-2 text-sm text-primary-dark/60">
                <span className="whitespace-nowrap">Приём, мин</span>
                <select
                  className={durationClass}
                  value={category.durationId ?? ""}
                  title="Длительность приёма для всей категории"
                  onChange={(e) =>
                    void saveCategoryDuration(category, e.target.value)
                  }
                >
                  <option value="">—</option>
                  {durations.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.minutes}
                    </option>
                  ))}
                </select>
              </label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => void addService(category.id)}
              >
                <Plus size={14} data-icon="inline-start" />
                Услуга
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="icon-sm"
                onClick={() => void deleteCategory(category.id)}
                aria-label="Удалить категорию"
              >
                <Trash2 size={14} />
              </Button>
            </div>

            {category.services.length === 0 ? (
              <p className="px-4 py-6 text-sm text-primary-dark/50">
                Нет услуг в этой категории
              </p>
            ) : (
              <ul>
                <li className="hidden border-b border-neutral-border bg-neutral-bg/80 px-4 py-2 text-xs font-medium text-primary-dark/45 sm:flex sm:items-center sm:gap-3">
                  <span className="w-6 shrink-0" />
                  <span className="w-8 shrink-0 text-center">№</span>
                  <span className="min-w-0 flex-1">Наименование</span>
                  <span className="w-[88px] shrink-0 text-center">Цена</span>
                  <span className="w-8 shrink-0" />
                </li>
                {category.services.map((service, index) => {
                  const draft = getDraft(service);
                  return (
                    <li
                      key={service.id}
                      draggable
                      onDragStart={() =>
                        setDragService({
                          categoryId: category.id,
                          id: service.id,
                        })
                      }
                      onDragOver={(e) =>
                        handleServiceDragOver(e, category.id, service.id)
                      }
                      onDragEnd={() => {
                        if (dragService?.categoryId === category.id) {
                          const cat = categoriesRef.current.find(
                            (c) => c.id === category.id,
                          );
                          if (cat) void persistServiceOrder(category.id, cat.services);
                        }
                        setDragService(null);
                      }}
                      className={`flex flex-wrap items-center gap-3 border-b border-neutral-border/60 px-4 py-3 last:border-b-0 sm:flex-nowrap ${
                        dragService?.id === service.id ? "bg-secondary-mint/50" : ""
                      }`}
                    >
                      <button
                        type="button"
                        className="cursor-grab text-primary-dark/40 hover:text-primary-green active:cursor-grabbing"
                        aria-label="Перетащить"
                      >
                        <GripVertical size={16} />
                      </button>
                      <span className="w-8 shrink-0 text-center text-sm font-medium text-primary-dark/40">
                        {index + 1}
                      </span>
                      <input
                        className={`${inputClass} min-w-0 flex-1`}
                        value={draft.title}
                        onChange={(e) =>
                          setDraft(service, { title: e.target.value })
                        }
                        onBlur={() => void saveService(service)}
                      />
                      <div className="flex shrink-0 items-center gap-2">
                        <input
                          type="number"
                          min={0}
                          step={0.01}
                          className={priceClass}
                          value={draft.amount}
                          onChange={(e) =>
                            setDraft(service, { amount: e.target.value })
                          }
                          onBlur={() => void saveService(service)}
                        />
                        <span className="text-sm text-primary-dark/50">BYN</span>
                      </div>
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon-sm"
                        onClick={() =>
                          void deleteService(service.id, category.id)
                        }
                        aria-label="Удалить"
                      >
                        <Trash2 size={14} />
                      </Button>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        ))}
      </div>

      <div className="mt-8 flex flex-wrap gap-3 rounded-xl border border-dashed border-neutral-border bg-white/50 p-4">
        <input
          className={`${inputClass} min-w-[240px] flex-1`}
          placeholder="Название новой категории"
          value={newCategoryName}
          onChange={(e) => setNewCategoryName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") void addCategory();
          }}
        />
        <Button type="button" onClick={() => void addCategory()}>
          <Plus size={16} data-icon="inline-start" />
          Добавить категорию
        </Button>
      </div>
    </div>
  );
}
