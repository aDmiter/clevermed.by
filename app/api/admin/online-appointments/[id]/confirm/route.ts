import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdminSession, unauthorizedResponse } from "@/lib/admin-api";
import { serializeAppointment } from "@/lib/appointments/serializer";
import { linkAppointmentToAvailabilitySlot } from "@/lib/appointments/slot-link";

type RouteContext = { params: Promise<{ id: string }> };

const bodySchema = z.object({
  adminNotes: z.string().max(2000).optional().nullable(),
});

export async function POST(request: Request, context: RouteContext) {
  const session = await requireAdminSession();
  if (!session) return unauthorizedResponse();

  const { id } = await context.params;
  const json = await request.json().catch(() => ({}));
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Некорректные данные" }, { status: 400 });
  }

  const existing = await prisma.appointment.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Запись не найдена" }, { status: 404 });
  }

  if (existing.source !== "ONLINE" || existing.status !== "SCHEDULED") {
    return NextResponse.json(
      { error: "Запись уже обработана или недоступна в этой очереди" },
      { status: 409 },
    );
  }

  const appointment = await prisma.appointment.update({
    where: { id },
    data: {
      status: "CONFIRMED",
      ...(parsed.data.adminNotes !== undefined
        ? { adminNotes: parsed.data.adminNotes?.trim() || null }
        : {}),
    },
    include: {
      doctor: { select: { name: true } },
      category: { select: { name: true } },
    },
  });

  if (!appointment.slotId) {
    await linkAppointmentToAvailabilitySlot(
      appointment.id,
      appointment.doctorId,
      appointment.startsAt,
    );
  }

  return NextResponse.json({ appointment: serializeAppointment(appointment) });
}
