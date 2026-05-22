import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession, unauthorizedResponse } from "@/lib/admin-api";
import { serializeDuration } from "@/lib/appointments/serializer";
import { durationBodySchema } from "@/lib/appointments/validation";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const session = await requireAdminSession();
  if (!session) return unauthorizedResponse();

  const { id } = await context.params;
  const json = await request.json();
  const parsed = durationBodySchema.partial().safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Некорректные данные" },
      { status: 400 },
    );
  }

  const duration = await prisma.appointmentDuration.update({
    where: { id },
    data: {
      ...(parsed.data.label !== undefined
        ? { label: parsed.data.label.trim() }
        : {}),
      ...(parsed.data.minutes !== undefined
        ? { minutes: parsed.data.minutes }
        : {}),
      ...(parsed.data.published !== undefined
        ? { published: parsed.data.published }
        : {}),
    },
  });

  return NextResponse.json({ duration: serializeDuration(duration) });
}

export async function DELETE(_request: Request, context: RouteContext) {
  const session = await requireAdminSession();
  if (!session) return unauthorizedResponse();

  const { id } = await context.params;
  const used = await prisma.serviceCategory.count({ where: { durationId: id } });
  if (used > 0) {
    return NextResponse.json(
      { error: "Длительность используется в категориях услуг" },
      { status: 409 },
    );
  }

  await prisma.appointmentDuration.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
