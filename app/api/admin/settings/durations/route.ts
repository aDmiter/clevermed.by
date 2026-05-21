import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession, unauthorizedResponse } from "@/lib/admin-api";
import { serializeDuration } from "@/lib/appointments/serializer";
import { durationBodySchema } from "@/lib/appointments/validation";

export async function GET() {
  const session = await requireAdminSession();
  if (!session) return unauthorizedResponse();

  const durations = await prisma.appointmentDuration.findMany({
    orderBy: [{ sortOrder: "asc" }, { minutes: "asc" }],
  });

  return NextResponse.json({
    durations: durations.map(serializeDuration),
  });
}

export async function POST(request: Request) {
  const session = await requireAdminSession();
  if (!session) return unauthorizedResponse();

  const json = await request.json();
  const parsed = durationBodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Некорректные данные" },
      { status: 400 },
    );
  }

  const maxOrder = await prisma.appointmentDuration.aggregate({
    _max: { sortOrder: true },
  });

  const duration = await prisma.appointmentDuration.create({
    data: {
      label: parsed.data.label.trim(),
      minutes: parsed.data.minutes,
      published: parsed.data.published ?? true,
      sortOrder: (maxOrder._max.sortOrder ?? 0) + 1,
    },
  });

  return NextResponse.json(
    { duration: serializeDuration(duration) },
    { status: 201 },
  );
}
