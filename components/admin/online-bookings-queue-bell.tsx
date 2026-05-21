"use client";

import Link from "next/link";
import { Bell } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { ONLINE_QUEUE_CHANGED } from "@/lib/admin-online-queue-events";
import { cn } from "@/lib/utils";

const POLL_MS = 20_000;

type OnlineBookingsQueueBellProps = {
  initialCount?: number;
};

export function OnlineBookingsQueueBell({
  initialCount = 0,
}: OnlineBookingsQueueBellProps) {
  const [count, setCount] = useState(initialCount);

  const fetchCount = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/online-appointments/count");
      if (!res.ok) return;
      const data = (await res.json()) as { count?: number };
      if (typeof data.count === "number") setCount(data.count);
    } catch {
      /* polling — ignore */
    }
  }, []);

  useEffect(() => {
    setCount(initialCount);
  }, [initialCount]);

  useEffect(() => {
    void fetchCount();
    const intervalId = window.setInterval(() => void fetchCount(), POLL_MS);
    const onVisible = () => {
      if (document.visibilityState === "visible") void fetchCount();
    };
    document.addEventListener("visibilitychange", onVisible);
    document.addEventListener(ONLINE_QUEUE_CHANGED, fetchCount);
    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener("visibilitychange", onVisible);
      document.removeEventListener(ONLINE_QUEUE_CHANGED, fetchCount);
    };
  }, [fetchCount]);

  const hasNew = count > 0;
  const badge = count > 99 ? "99+" : String(count);

  return (
    <Link
      href="/admin/online-bookings"
      className={cn(
        "admin-bell fixed top-4 right-4 z-50 flex h-11 w-11 items-center justify-center rounded-full border shadow-md backdrop-blur-[15px] transition-colors",
        hasNew
          ? "admin-bell--active border-accent-warmth/50 bg-accent-warmth/20 text-accent-warmth"
          : "border-neutral-border bg-white/90 text-primary-dark/35 hover:border-primary-green/30 hover:text-primary-dark/55",
      )}
      aria-label={
        hasNew
          ? `Новых заявок с сайта: ${count}. Перейти к обработке`
          : "Нет новых заявок с сайта"
      }
      title={hasNew ? `Новых заявок: ${count}` : "Запись онлайн"}
    >
      <Bell className={cn("admin-bell__icon size-5", !hasNew && "opacity-80")} />
      {hasNew ? (
        <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent-warmth px-1 text-[10px] font-bold leading-none text-white shadow-sm">
          {badge}
        </span>
      ) : null}
    </Link>
  );
}
