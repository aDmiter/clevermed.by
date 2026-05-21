import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getBookableSlotsForService } from "@/lib/appointments/booking-slots";
import { isDateInBookingRange } from "@/lib/appointments/slots";

const querySchema = z.object({
  doctorId: z.string().min(1),
  categoryId: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const parsed = querySchema.safeParse({
    doctorId: searchParams.get("doctorId"),
    categoryId: searchParams.get("categoryId"),
    date: searchParams.get("date"),
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Укажите врача, категорию и дату" },
      { status: 400 },
    );
  }

  const { doctorId, categoryId, date } = parsed.data;

  if (!isDateInBookingRange(date)) {
    return NextResponse.json({ slots: [] });
  }

  const category = await prisma.serviceCategory.findFirst({
    where: {
      id: categoryId,
      durationId: { not: null },
      doctors: { some: { doctorId } },
    },
    include: { duration: true },
  });

  if (!category?.duration) {
    return NextResponse.json({ error: "Категория недоступна" }, { status: 404 });
  }

  const slots = await getBookableSlotsForService({
    doctorId,
    dateKey: date,
    durationMinutes: category.duration.minutes,
  });

  return NextResponse.json({ slots });
}
