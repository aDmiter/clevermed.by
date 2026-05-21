import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminSession, unauthorizedResponse } from "@/lib/admin-api";
import { getAvailableSlotsForBooking } from "@/lib/appointments/availability-service";
import { prisma } from "@/lib/prisma";

const querySchema = z.object({
  doctorId: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  procedureId: z.string().optional(),
  durationMinutes: z.coerce.number().optional(),
});

export async function GET(request: Request) {
  const session = await requireAdminSession();
  if (!session) return unauthorizedResponse();

  const { searchParams } = new URL(request.url);
  const parsed = querySchema.safeParse({
    doctorId: searchParams.get("doctorId"),
    date: searchParams.get("date"),
    procedureId: searchParams.get("procedureId") ?? undefined,
    durationMinutes: searchParams.get("durationMinutes") ?? undefined,
  });

  if (!parsed.success) {
    return NextResponse.json({ error: "Укажите врача и дату" }, { status: 400 });
  }

  let minutes = parsed.data.durationMinutes;
  if (parsed.data.procedureId) {
    const procedure = await prisma.procedure.findUnique({
      where: { id: parsed.data.procedureId },
      include: { duration: true },
    });
    minutes = procedure?.duration.minutes;
  }

  if (!minutes) {
    return NextResponse.json({ error: "Укажите процедуру или длительность" }, { status: 400 });
  }

  const slots = await getAvailableSlotsForBooking({
    doctorId: parsed.data.doctorId,
    dateKey: parsed.data.date,
    procedureMinutes: minutes,
  });

  return NextResponse.json({ slots });
}
