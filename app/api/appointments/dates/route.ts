import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getDoctorAvailabilityDatesForService } from "@/lib/appointments/booking-slots";
import { isOnlineBookingEnabled } from "@/lib/require-online-booking";

const querySchema = z.object({
  doctorId: z.string().min(1),
  categoryId: z.string().min(1),
});

export async function GET(request: Request) {
  if (!(await isOnlineBookingEnabled())) {
    return NextResponse.json({ dates: [] });
  }

  const { searchParams } = new URL(request.url);
  const parsed = querySchema.safeParse({
    doctorId: searchParams.get("doctorId"),
    categoryId: searchParams.get("categoryId"),
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Укажите врача и категорию" },
      { status: 400 },
    );
  }

  const category = await prisma.serviceCategory.findFirst({
    where: {
      id: parsed.data.categoryId,
      durationId: { not: null },
      doctors: { some: { doctorId: parsed.data.doctorId } },
    },
    include: { duration: true },
  });

  if (!category?.duration) {
    return NextResponse.json({ error: "Категория недоступна" }, { status: 404 });
  }

  const dates = await getDoctorAvailabilityDatesForService(
    parsed.data.doctorId,
    category.duration.minutes,
  );

  return NextResponse.json({ dates });
}
