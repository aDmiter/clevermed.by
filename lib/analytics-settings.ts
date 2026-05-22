import { z } from "zod";

export type AnalyticsSettings = {
  googleAnalyticsCounter: string;
  googleAnalyticsCode: string;
  yandexMetrikaCounter: string;
  yandexMetrikaCode: string;
};

export const DEFAULT_ANALYTICS_SETTINGS: AnalyticsSettings = {
  googleAnalyticsCounter: "",
  googleAnalyticsCode: "",
  yandexMetrikaCounter: "",
  yandexMetrikaCode: "",
};

const emptyToNull = (value: string | null | undefined) => {
  const trimmed = (value ?? "").trim();
  return trimmed.length > 0 ? trimmed : null;
};

export const analyticsPatchSchema = z.object({
  googleAnalyticsCounter: z
    .string()
    .max(32)
    .optional()
    .nullable()
    .transform((v) => emptyToNull(v))
    .refine(
      (v) =>
        v === null ||
        /^G-[A-Z0-9]+$/i.test(v) ||
        /^UA-\d+-\d+$/i.test(v),
      "Google Analytics: укажите идентификатор вида G-XXXXXXXX или UA-XXXXXX-X",
    ),
  googleAnalyticsCode: z
    .string()
    .max(8000)
    .optional()
    .nullable()
    .transform((v) => emptyToNull(v)),
  yandexMetrikaCounter: z
    .string()
    .max(16)
    .optional()
    .nullable()
    .transform((v) => emptyToNull(v))
    .refine(
      (v) => v === null || /^\d{4,12}$/.test(v),
      "Яндекс Метрика: номер счётчика — только цифры (4–12)",
    ),
  yandexMetrikaCode: z
    .string()
    .max(8000)
    .optional()
    .nullable()
    .transform((v) => emptyToNull(v)),
});

export function rowToAnalyticsSettings(row: {
  googleAnalyticsCounter: string | null;
  googleAnalyticsCode: string | null;
  yandexMetrikaCounter: string | null;
  yandexMetrikaCode: string | null;
}): AnalyticsSettings {
  return {
    googleAnalyticsCounter: row.googleAnalyticsCounter ?? "",
    googleAnalyticsCode: row.googleAnalyticsCode ?? "",
    yandexMetrikaCounter: row.yandexMetrikaCounter ?? "",
    yandexMetrikaCode: row.yandexMetrikaCode ?? "",
  };
}

/** Из вставки в админке оставляет только содержимое script (без тегов). */
export function normalizeAnalyticsSnippet(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return "";
  const match = trimmed.match(/<script[^>]*>([\s\S]*?)<\/script>/i);
  return (match?.[1] ?? trimmed).trim();
}
