import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminSession, unauthorizedResponse } from "@/lib/admin-api";
import { previewSlotLabels, generateSlotsFromWindows } from "@/lib/appointments/windows";
import { timeWindowSchema } from "@/lib/appointments/validation";

const bodySchema = z.object({
  dateKey: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  windows: z.array(timeWindowSchema).min(1),
  durationMinutes: z.number().int().min(5).max(240),
});

export async function POST(request: Request) {
  const session = await requireAdminSession();
  if (!session) return unauthorizedResponse();

  const json = await request.json();
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Некорректные данные" }, { status: 400 });
  }

  const dateKey = parsed.data.dateKey ?? "2099-01-01";
  const slots = generateSlotsFromWindows(
    dateKey,
    parsed.data.windows,
    parsed.data.durationMinutes,
  );

  return NextResponse.json({
    labels: previewSlotLabels(parsed.data.windows, parsed.data.durationMinutes),
    count: slots.length,
  });
}
