import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession, unauthorizedResponse } from "@/lib/admin-api";
import { hasAppointmentConflict } from "@/lib/appointments/conflicts";
import { serializeAppointment } from "@/lib/appointments/serializer";
import {
  appointmentUpdateSchema,
  normalizePhone,
} from "@/lib/appointments/validation";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const session = await requireAdminSession();
  if (!session) return unauthorizedResponse();

  const { id } = await context.params;
  const json = await request.json();
  const parsed = appointmentUpdateSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Некорректные данные" },
      { status: 400 },
    );
  }

  const existing = await prisma.appointment.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Запись не найдена" }, { status: 404 });
  }

  const data = parsed.data;
  const doctorId = data.doctorId ?? existing.doctorId;

  let startsAt = existing.startsAt;
  let endsAt = existing.endsAt;
  let durationMinutes = existing.durationMinutes;
  let slotId = data.slotId !== undefined ? data.slotId : existing.slotId;
  let procedureId =
    data.procedureId !== undefined ? data.procedureId : existing.procedureId;

  if (data.slotId) {
    const slot = await prisma.availabilitySlot.findUnique({
      where: { id: data.slotId },
      include: { day: true, appointment: true },
    });
    if (
      !slot ||
      (slot.appointment && slot.appointment.id !== id) ||
      slot.day.doctorId !== doctorId
    ) {
      return NextResponse.json({ error: "Слот недоступен" }, { status: 409 });
    }
    startsAt = slot.startsAt;
    endsAt = slot.endsAt;
    durationMinutes = slot.day.durationMinutes;
  } else if (data.startsAt) {
    startsAt = new Date(data.startsAt);
    durationMinutes = data.durationMinutes ?? existing.durationMinutes;
    endsAt = new Date(startsAt.getTime() + durationMinutes * 60 * 1000);
  }

  if (
    await hasAppointmentConflict(doctorId, startsAt, endsAt, id)
  ) {
    return NextResponse.json(
      { error: "Это время уже занято" },
      { status: 409 },
    );
  }

  const appointment = await prisma.appointment.update({
    where: { id },
    data: {
      ...(data.doctorId ? { doctorId: data.doctorId } : {}),
      startsAt,
      endsAt,
      durationMinutes,
      ...(data.patientName !== undefined
        ? { patientName: data.patientName.trim() }
        : {}),
      ...(data.patientPhone !== undefined
        ? { patientPhone: normalizePhone(data.patientPhone) }
        : {}),
      ...(data.patientEmail !== undefined
        ? { patientEmail: data.patientEmail?.trim() || null }
        : {}),
      ...(data.patientComment !== undefined
        ? { patientComment: data.patientComment?.trim() || null }
        : {}),
      ...(data.adminNotes !== undefined
        ? { adminNotes: data.adminNotes?.trim() || null }
        : {}),
      ...(data.procedureId !== undefined ? { procedureId: data.procedureId } : {}),
      slotId,
      ...(data.status ? { status: data.status } : {}),
      ...(data.source ? { source: data.source } : {}),
    },
    include: {
      doctor: { select: { name: true } },
      category: { select: { name: true } },
      procedure: { select: { title: true } },
    },
  });

  return NextResponse.json({ appointment: serializeAppointment(appointment) });
}

export async function DELETE(_request: Request, context: RouteContext) {
  const session = await requireAdminSession();
  if (!session) return unauthorizedResponse();

  const { id } = await context.params;
  const existing = await prisma.appointment.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Запись не найдена" }, { status: 404 });
  }

  await prisma.appointment.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
