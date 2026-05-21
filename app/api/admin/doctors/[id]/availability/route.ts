import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession, unauthorizedResponse } from "@/lib/admin-api";
import { createDoctorAvailability } from "@/lib/appointments/availability-service";
import { createAvailabilitySchema } from "@/lib/appointments/validation";
import { toDateKey } from "@/lib/appointments/clinic-time";
import { previewSlotLabels } from "@/lib/appointments/windows";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const session = await requireAdminSession();
  if (!session) return unauthorizedResponse();

  const { id } = await context.params;
  const days = await prisma.doctorAvailabilityDay.findMany({
    where: { doctorId: id, dateKey: { gte: toDateKey(new Date()) } },
    orderBy: { dateKey: "asc" },
    include: {
      _count: { select: { slots: true } },
    },
  });

  return NextResponse.json({
    days: days.map((d) => ({
      id: d.id,
      dateKey: d.dateKey,
      durationMinutes: d.durationMinutes,
      windows: d.windows,
      slotsCount: d._count.slots,
    })),
  });
}

export async function POST(request: Request, context: RouteContext) {
  const session = await requireAdminSession();
  if (!session) return unauthorizedResponse();

  const { id } = await context.params;
  if (!id?.trim()) {
    return NextResponse.json({ error: "Не указан врач" }, { status: 400 });
  }
  const doctor = await prisma.doctor.findUnique({ where: { id } });
  if (!doctor) {
    return NextResponse.json({ error: "Врач не найден" }, { status: 404 });
  }

  const json = await request.json();
  const parsed = createAvailabilitySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Некорректные данные" },
      { status: 400 },
    );
  }

  const preview = previewSlotLabels(
    parsed.data.windows,
    parsed.data.durationMinutes,
  );

  const created = await createDoctorAvailability({
    doctorId: id,
    dateKeys: parsed.data.dateKeys,
    windows: parsed.data.windows,
    durationMinutes: parsed.data.durationMinutes,
  });

  const todayKey = toDateKey(new Date());
  const days = await prisma.doctorAvailabilityDay.findMany({
    where: { doctorId: id, dateKey: { gte: todayKey } },
    orderBy: { dateKey: "asc" },
    include: { _count: { select: { slots: true } } },
  });

  return NextResponse.json({
    created,
    previewLabels: preview,
    totalSlots: created.reduce((s, c) => s + c.slotsCount, 0),
    days: days.map((d) => ({
      dateKey: d.dateKey,
      durationMinutes: d.durationMinutes,
      slotsCount: d._count.slots,
    })),
  });
}
