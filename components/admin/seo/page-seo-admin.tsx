"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PageSeoAdminItem } from "@/lib/page-seo";

async function parseError(res: Response) {
  const data = await res.json().catch(() => ({}));
  throw new Error(
    typeof data.error === "string" ? data.error : "Произошла ошибка",
  );
}

const fieldClass =
  "w-full rounded-lg border border-neutral-border bg-white px-3 py-2 text-sm text-primary-dark outline-none focus:border-primary-green focus:ring-2 focus:ring-primary-green/20";

const TITLE_RECOMMENDED = 60;
const DESC_RECOMMENDED = 160;

function Counter({ value, recommended }: { value: string; recommended: number }) {
  const len = value.length;
  const over = len > recommended;
  return (
    <span
      className={`text-xs tabular-nums ${over ? "text-accent-warmth" : "text-primary-dark/45"}`}
    >
      {len} / {recommended}
    </span>
  );
}

export function PageSeoAdmin() {
  const [pages, setPages] = useState<PageSeoAdminItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/seo");
      if (!res.ok) await parseError(res);
      const data = await res.json();
      setPages(data.pages);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  function updatePage(
    path: string,
    field: "title" | "description",
    value: string,
  ) {
    setPages((prev) =>
      prev.map((p) => (p.path === path ? { ...p, [field]: value } : p)),
    );
  }

  async function save() {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/seo", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pages: pages.map((p) => ({
            path: p.path,
            title: p.title,
            description: p.description,
          })),
        }),
      });
      if (!res.ok) await parseError(res);
      const data = await res.json();
      setPages(data.pages);
      setMessage("SEO-настройки сохранены");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Ошибка сохранения");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-primary-dark/60">
        <Loader2 className="h-4 w-4 animate-spin" />
        Загрузка…
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary-dark">SEO / Meta</h1>
          <p className="mt-1 text-sm text-primary-dark/60">
            Заголовок и описание для поисковых систем и превью в соцсетях. На
            внутренних страницах к заголовку добавляется «| Clevermed», на
            главной — полный заголовок как указан.
          </p>
        </div>
        <Button
          type="button"
          onClick={() => void save()}
          disabled={saving}
          className="gap-2 bg-primary-green hover:bg-primary-green/90"
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          Сохранить всё
        </Button>
      </div>

      {message && (
        <p className="rounded-lg bg-secondary-mint px-3 py-2 text-sm text-primary-green">
          {message}
        </p>
      )}

      <div className="space-y-6">
        {pages.map((page) => (
          <section
            key={page.path}
            className="rounded-xl border border-neutral-border bg-white/70 p-6"
          >
            <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="text-lg font-semibold text-primary-dark">
                {page.label}
              </h2>
              <code className="rounded bg-neutral-bg px-2 py-0.5 text-xs text-primary-dark/70">
                {page.path}
              </code>
            </div>

            <div className="space-y-4">
              <div>
                <div className="mb-1 flex items-center justify-between gap-2">
                  <label
                    htmlFor={`title-${page.path}`}
                    className="text-sm font-medium text-primary-dark"
                  >
                    Title
                  </label>
                  <Counter value={page.title} recommended={TITLE_RECOMMENDED} />
                </div>
                <input
                  id={`title-${page.path}`}
                  type="text"
                  className={fieldClass}
                  value={page.title}
                  maxLength={120}
                  onChange={(e) =>
                    updatePage(page.path, "title", e.target.value)
                  }
                  placeholder="Заголовок страницы"
                />
              </div>

              <div>
                <div className="mb-1 flex items-center justify-between gap-2">
                  <label
                    htmlFor={`desc-${page.path}`}
                    className="text-sm font-medium text-primary-dark"
                  >
                    Description
                  </label>
                  <Counter
                    value={page.description}
                    recommended={DESC_RECOMMENDED}
                  />
                </div>
                <textarea
                  id={`desc-${page.path}`}
                  className={`${fieldClass} min-h-[88px] resize-y`}
                  value={page.description}
                  maxLength={320}
                  rows={3}
                  onChange={(e) =>
                    updatePage(page.path, "description", e.target.value)
                  }
                  placeholder="Краткое описание для meta description"
                />
              </div>
            </div>
          </section>
        ))}
      </div>

      <div className="flex justify-end pb-8">
        <Button
          type="button"
          onClick={() => void save()}
          disabled={saving}
          className="gap-2 bg-primary-green hover:bg-primary-green/90"
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          Сохранить всё
        </Button>
      </div>
    </div>
  );
}
