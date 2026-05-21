import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdminSession, unauthorizedResponse } from "@/lib/admin-api";
import { hasAppointmentConflict } from "@/lib/appointments/conflicts";
import { serializeAppointment } from "@/lib/appointments/serializer";
import {
  appointmentBodySchema,
  normalizePhone,
} from "@/lib/appointments/validation";
import {
  dateKeyToUtcStart,
  addDaysToDateKey,
  toDateKey,
} from "@/lib/appointments/clinic-time";

const listQuerySchema = z.object({
  doctorId: z.string().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
});

export async function GET(request: Request) {
  const session = await requireAdminSession();
  if (!session) return unauthorizedResponse();

  const { searchParams } = new URL(request.url);
  const parsed = listQuerySchema.safeParse({
    doctorId: searchParams.get("doctorId") ?? undefined,
    from: searchParams.get("from") ?? undefined,
    to: searchParams.get("to") ?? undefined,
  });

  if (!parsed.success) {
    return NextResponse.json({ error: "Некорректные параметры" }, { status: 400 });
  }

  const { doctorId, from, to } = parsed.data;
  const fromDate = from
    ? new Date(from)
    : dateKeyToUtcStart(addDaysToDateKey(toDateKey(new Date()), -7));
  const toDate = to
    ? new Date(to)
    : new Date(fromDate.getTime() + 14 * 24 * 60 * 60 * 1000);

  const appointments = await prisma.appointment.findMany({
    where: {
      ...(doctorId ? { doctorId } : {}),
      startsAt: { gte: fromDate, lt: toDate },
    },
    include: {
      doctor: { select: { name: true } },
      category: { select: { name: true } },
      procedure: { select: { title: true } },
    },
    orderBy: { startsAt: "asc" },
  });

  return NextResponse.json({
    appointments: appointments.map(serializeAppointment),
  });
}

export async function POST(request: Request) {
  const session = await requireAdminSession();
  if (!session) return unauthorizedResponse();

  const json = await request.json();
  const parsed = appointmentBodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Некорректные данные" },
      { status: 400 },
    );
  }

  const data = parsed.data;

  let startsAt: Date;
  let endsAt: Date;
  let durationMinutes: number;
  let slotId: string | null = data.slotId ?? null;
  let procedureId: string | null = data.procedureId ?? null;

  if (data.slotId) {
    const slot = await prisma.availabilitySlot.findUnique({
      where: { id: data.slotId },
      include: { day: true, appointment: true },
    });
    if (!slot || slot.appointment || slot.day.doctorId !== data.doctorId) {
      return NextResponse.json({ error: "Слот недоступен" }, { status: 409 });
    }
    startsAt = slot.startsAt;
    endsAt = slot.endsAt;
    durationMinutes = slot.day.durationMinutes;
  } else {
    startsAt = new Date(data.startsAt);
    if (data.procedureId) {
      const procedure = await prisma.procedure.findUnique({
        where: { id: data.procedureId },
        include: { duration: true },
      });
      if (!procedure) {
        return NextResponse.json({ error: "Процедура не найдена" }, { status: 404 });
      }
      durationMinutes = procedure.duration.minutes;
      procedureId = procedure.id;
    } else {
      durationMinutes = data.durationMinutes ?? 25;
    }
    endsAt = new Date(startsAt.getTime() + durationMinutes * 60 * 1000);
  }

  if (await hasAppointmentConflict(data.doctorId, startsAt, endsAt)) {
    return NextResponse.json({ error: "Это время уже занято" }, { status: 409 });
  }

  const appointment = await prisma.appointment.create({
    data: {
      doctorId: data.doctorId,
      procedureId,
      slotId,
      startsAt,
      endsAt,
      durationMinutes,
      patientName: data.patientName.trim(),
      patientPhone: normalizePhone(data.patientPhone),
      patientEmail: data.patientEmail?.trim() || null,
      patientComment: data.patientComment?.trim() || null,
      adminNotes: data.adminNotes?.trim() || null,
      status: data.status ?? "CONFIRMED",
      source: data.source ?? "PHONE",
      createdById: session.user?.id ?? null,
    },
    include: {
      doctor: { select: { name: true } },
      category: { select: { name: true } },
      procedure: { select: { title: true } },
    },
  });

  return NextResponse.json(
    { appointment: serializeAppointment(appointment) },
    { status: 201 },
  );
}
