import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminSession, unauthorizedResponse } from "@/lib/admin-api";
import { getAdminCalendarSlots } from "@/lib/appointments/calendar-slots";

const querySchema = z.object({
  doctorId: z.string().min(1),
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export async function GET(request: Request) {
  const session = await requireAdminSession();
  if (!session) return unauthorizedResponse();

  const { searchParams } = new URL(request.url);
  const parsed = querySchema.safeParse({
    doctorId: searchParams.get("doctorId"),
    from: searchParams.get("from"),
    to: searchParams.get("to"),
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Укажите врача и период" },
      { status: 400 },
    );
  }

  const slots = await getAdminCalendarSlots({
    doctorId: parsed.data.doctorId,
    fromDateKey: parsed.data.from,
    toDateKey: parsed.data.to,
  });
  return NextResponse.json({ slots });
}
