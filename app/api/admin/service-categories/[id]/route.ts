import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession, unauthorizedResponse } from "@/lib/admin-api";
import { serializeCategoryWithServices } from "@/lib/service-serializer";
import { categoryBodySchema } from "@/lib/service-validation";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const session = await requireAdminSession();
  if (!session) return unauthorizedResponse();

  const { id } = await context.params;
  const json = await request.json();
  const parsed = categoryBodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Некорректные данные" },
      { status: 400 },
    );
  }

  if (parsed.data.durationId) {
    const duration = await prisma.appointmentDuration.findUnique({
      where: { id: parsed.data.durationId },
    });
    if (!duration) {
      return NextResponse.json(
        { error: "Длительность не найдена" },
        { status: 400 },
      );
    }
  }

  const category = await prisma.serviceCategory.update({
    where: { id },
    data: {
      ...(parsed.data.name !== undefined
        ? { name: parsed.data.name.trim() }
        : {}),
      ...(parsed.data.durationId !== undefined
        ? { durationId: parsed.data.durationId }
        : {}),
    },
    include: {
      duration: true,
      services: { orderBy: { sortOrder: "asc" } },
    },
  });

  return NextResponse.json({
    category: serializeCategoryWithServices(category),
  });
}

export async function DELETE(_request: Request, context: RouteContext) {
  const session = await requireAdminSession();
  if (!session) return unauthorizedResponse();

  const { id } = await context.params;
  await prisma.serviceCategory.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
