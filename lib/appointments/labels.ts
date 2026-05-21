import type { AppointmentSource, AppointmentStatus } from "@/app/generated/prisma/client";

export const STATUS_LABELS: Record<AppointmentStatus, string> = {
  SCHEDULED: "Запланирован",
  CONFIRMED: "Подтверждён",
  COMPLETED: "Завершён",
  CANCELLED: "Отменён",
  NO_SHOW: "Не явился",
};

export const SOURCE_LABELS: Record<AppointmentSource, string> = {
  ONLINE: "С сайта",
  PHONE: "По телефону",
};

/** Статус в очереди «Запись онлайн» (source=ONLINE, status=SCHEDULED) */
export const ONLINE_QUEUE_STATUS_LABEL = "Запись онлайн";

export const STATUS_COLORS: Record<AppointmentStatus, string> = {
  SCHEDULED: "bg-blue-100 text-blue-800",
  CONFIRMED: "bg-primary-green/15 text-primary-green",
  COMPLETED: "bg-primary-dark/10 text-primary-dark/70",
  CANCELLED: "bg-neutral-border text-primary-dark/50",
  NO_SHOW: "bg-accent-warmth/15 text-accent-warmth",
};
