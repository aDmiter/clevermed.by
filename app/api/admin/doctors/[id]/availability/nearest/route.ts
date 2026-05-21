import { NextResponse } from "next/server";
import { requireAdminSession, unauthorizedResponse } from "@/lib/admin-api";
import { getSuggestedWeekStartForDoctor } from "@/lib/appointments/calendar-slots";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const session = await requireAdminSession();
  if (!session) return unauthorizedResponse();

  const { id } = await context.params;
  const weekStart = await getSuggestedWeekStartForDoctor(id);

  return NextResponse.json({ weekStart });
}
