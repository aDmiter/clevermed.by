import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminSession, unauthorizedResponse } from "@/lib/admin-api";
import { getBookableSlotsForService } from "@/lib/appointments/booking-slots";
import { resolveDoctorServiceCategory } from "@/lib/appointments/category-booking";

const querySchema = z.object({
  doctorId: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  categoryId: z.string().min(1),
});

export async function GET(request: Request) {
  const session = await requireAdminSession();
  if (!session) return unauthorizedResponse();

  const { searchParams } = new URL(request.url);
  const parsed = querySchema.safeParse({
    doctorId: searchParams.get("doctorId"),
    date: searchParams.get("date"),
    categoryId: searchParams.get("categoryId"),
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Укажите врача, услугу и дату" },
      { status: 400 },
    );
  }

  const category = await resolveDoctorServiceCategory(
    parsed.data.doctorId,
    parsed.data.categoryId,
  );
  if (!category?.duration) {
    return NextResponse.json({ error: "Услуга недоступна" }, { status: 404 });
  }

  const slots = await getBookableSlotsForService({
    doctorId: parsed.data.doctorId,
    dateKey: parsed.data.date,
    durationMinutes: category.duration.minutes,
  });

  return NextResponse.json({ slots });
}
