import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession, unauthorizedResponse } from "@/lib/admin-api";
import { hasAppointmentConflict } from "@/lib/appointments/conflicts";
import { serializeAppointment } from "@/lib/appointments/serializer";
import { assertBookableSlot } from "@/lib/appointments/booking-slots";
import { resolveDoctorServiceCategory } from "@/lib/appointments/category-booking";
import { isPastSlotStart } from "@/lib/appointments/clinic-time";
import {
  linkAppointmentToAvailabilitySlot,
  unlinkAppointmentFromSlot,
} from "@/lib/appointments/slot-link";
import { ACTIVE_APPOINTMENT_STATUSES } from "@/lib/appointments/conflicts";
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
  let categoryId =
    data.categoryId !== undefined ? data.categoryId : existing.categoryId;

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
    if (isPastSlotStart(slot.startsAt)) {
      return NextResponse.json(
        { error: "Нельзя записать на прошедшее время" },
        { status: 409 },
      );
    }
    startsAt = slot.startsAt;
    endsAt = slot.endsAt;
    durationMinutes = slot.day.durationMinutes;
  } else if (data.startsAt) {
    startsAt = new Date(data.startsAt);

    if (data.categoryId) {
      const category = await resolveDoctorServiceCategory(
        doctorId,
        data.categoryId,
      );
      if (!category?.duration) {
        return NextResponse.json({ error: "Услуга недоступна" }, { status: 404 });
      }
      durationMinutes = category.duration.minutes;
      categoryId = category.id;

      const bookable = await assertBookableSlot({
        doctorId,
        startsAt,
        durationMinutes,
      });
      if (!bookable) {
        return NextResponse.json(
          { error: "Выбранное время недоступно" },
          { status: 409 },
        );
      }
      endsAt = bookable.endsAt;
    } else {
      durationMinutes = data.durationMinutes ?? existing.durationMinutes;
      endsAt = new Date(startsAt.getTime() + durationMinutes * 60 * 1000);
    }
  }

  if (
    await hasAppointmentConflict(doctorId, startsAt, endsAt, id)
  ) {
    return NextResponse.json(
      { error: "Это время уже занято" },
      { status: 409 },
    );
  }

  const timeChanged =
    startsAt.getTime() !== existing.startsAt.getTime() ||
    endsAt.getTime() !== existing.endsAt.getTime();
  if (timeChanged && !data.slotId) {
    await unlinkAppointmentFromSlot(id);
    slotId = null;
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
      ...(data.categoryId !== undefined ? { categoryId: data.categoryId } : {}),
      slotId,
      ...(data.status ? { status: data.status } : {}),
      ...(data.source ? { source: data.source } : {}),
    },
    include: {
      doctor: { select: { name: true } },
      category: { select: { name: true } },
    },
  });

  const status = data.status ?? appointment.status;
  if (
    !slotId &&
    timeChanged &&
    (ACTIVE_APPOINTMENT_STATUSES as readonly string[]).includes(status)
  ) {
    await linkAppointmentToAvailabilitySlot(id, doctorId, startsAt);
  }

  const saved = await prisma.appointment.findUnique({
    where: { id },
    include: {
      doctor: { select: { name: true } },
      category: { select: { name: true } },
    },
  });

  return NextResponse.json({
    appointment: serializeAppointment(saved ?? appointment),
  });
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
