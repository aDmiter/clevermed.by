import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { assertBookableSlot } from "@/lib/appointments/booking-slots";
import { hasAppointmentConflict } from "@/lib/appointments/conflicts";
import { linkAppointmentToAvailabilitySlot } from "@/lib/appointments/slot-link";
import { getSiteSettings } from "@/lib/site-settings-server";
import {
  appointmentBodySchema,
  normalizePhone,
} from "@/lib/appointments/validation";

const publicBodySchema = appointmentBodySchema
  .omit({ slotId: true, durationMinutes: true })
  .extend({
    categoryId: z.string().min(1, "Выберите услугу"),
    startsAt: z.string().datetime({ message: "Некорректное время" }),
  });

export async function POST(request: Request) {
  const json = await request.json();
  const parsed = publicBodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Некорректные данные" },
      { status: 400 },
    );
  }

  const data = parsed.data;

  const siteSettings = await getSiteSettings();
  if (!siteSettings.onlineBookingEnabled) {
    return NextResponse.json(
      { error: "Онлайн-запись на сайте отключена" },
      { status: 403 },
    );
  }

  const category = await prisma.serviceCategory.findFirst({
    where: {
      id: data.categoryId,
      durationId: { not: null },
      doctors: { some: { doctorId: data.doctorId } },
    },
    include: { duration: true },
  });

  if (!category?.duration) {
    return NextResponse.json({ error: "Услуга недоступна" }, { status: 404 });
  }

  const startsAt = new Date(data.startsAt);
  const durationMinutes = category.duration.minutes;

  const bookable = await assertBookableSlot({
    doctorId: data.doctorId,
    startsAt,
    durationMinutes,
  });

  if (!bookable) {
    return NextResponse.json(
      { error: "Выбранное время недоступно" },
      { status: 409 },
    );
  }

  const { endsAt } = bookable;

  if (await hasAppointmentConflict(data.doctorId, startsAt, endsAt)) {
    return NextResponse.json(
      { error: "Это время только что заняли" },
      { status: 409 },
    );
  }

  const appointment = await prisma.appointment.create({
    data: {
      doctorId: data.doctorId,
      categoryId: category.id,
      slotId: null,
      startsAt,
      endsAt,
      durationMinutes,
      patientName: data.patientName.trim(),
      patientPhone: normalizePhone(data.patientPhone),
      patientEmail: data.patientEmail?.trim() || null,
      patientComment: data.patientComment?.trim() || null,
      status: "SCHEDULED",
      source: "ONLINE",
    },
    include: { doctor: { select: { name: true } }, category: true },
  });

  await linkAppointmentToAvailabilitySlot(
    appointment.id,
    data.doctorId,
    startsAt,
  );

  return NextResponse.json(
    {
      ok: true,
      message:
        "Заявка принята. Мы перезвоним вам для подтверждения записи.",
      appointmentId: appointment.id,
      doctorName: appointment.doctor.name,
      categoryName: appointment.category?.name,
      startsAt: appointment.startsAt.toISOString(),
    },
    { status: 201 },
  );
}
