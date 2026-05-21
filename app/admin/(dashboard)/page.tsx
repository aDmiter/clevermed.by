import { prisma } from "@/lib/prisma";

async function getStats() {
  try {
    const [services, doctors, pendingReviews, todayAppointments, onlineQueue] =
      await Promise.all([
        prisma.service.count(),
        prisma.doctor.count(),
        prisma.review.count({ where: { status: "PENDING" } }),
        prisma.appointment.count({
          where: {
            startsAt: {
              gte: new Date(new Date().setHours(0, 0, 0, 0)),
              lt: new Date(new Date().setHours(23, 59, 59, 999)),
            },
            status: { in: ["SCHEDULED", "CONFIRMED"] },
          },
        }),
        prisma.appointment.count({
          where: { source: "ONLINE", status: "SCHEDULED" },
        }),
      ]);
    return {
      services,
      doctors,
      pendingReviews,
      todayAppointments,
      onlineQueue,
      dbConnected: true,
    };
  } catch {
    return {
      services: 0,
      doctors: 0,
      pendingReviews: 0,
      todayAppointments: 0,
      onlineQueue: 0,
      dbConnected: false,
    };
  }
}

export default async function AdminDashboardPage() {
  const stats = await getStats();

  return (
    <div>
      <h1 className="mb-2 text-3xl font-bold">Дашборд</h1>
      <p className="mb-8 text-primary-dark/60">
        Краткая сводка по контенту публичного сайта
      </p>

      {!stats.dbConnected && (
        <div className="mb-8 rounded-xl border border-accent-warmth/30 bg-accent-warmth/10 px-4 py-3 text-sm">
          База данных не подключена. Настройте{" "}
          <code className="rounded bg-white px-1">DATABASE_URL</code> в{" "}
          <code className="rounded bg-white px-1">.env</code> и выполните{" "}
          <code className="rounded bg-white px-1">npm run db:migrate</code>.
        </div>
      )}

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
        {[
          { label: "Услуги", value: stats.services },
          { label: "Врачи", value: stats.doctors },
          { label: "Запись онлайн (новые)", value: stats.onlineQueue },
          { label: "Записи на сегодня", value: stats.todayAppointments },
          { label: "Отзывы на модерации", value: stats.pendingReviews },
        ].map((card) => (
          <div
            key={card.label}
            className="rounded-2xl border border-white/80 bg-white/70 p-6 shadow-sm backdrop-blur-[15px]"
          >
            <p className="text-sm text-primary-dark/60">{card.label}</p>
            <p className="mt-2 text-4xl font-bold text-primary-green">
              {card.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
