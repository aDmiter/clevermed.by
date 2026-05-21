import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdminSession, unauthorizedResponse } from "@/lib/admin-api";
import { serializeCategoryWithServices } from "@/lib/service-serializer";

type RouteContext = { params: Promise<{ id: string }> };

const putSchema = z.object({
  categoryIds: z.array(z.string()),
});

export async function GET(_request: Request, context: RouteContext) {
  const session = await requireAdminSession();
  if (!session) return unauthorizedResponse();

  const { id } = await context.params;
  const doctor = await prisma.doctor.findUnique({
    where: { id },
    include: { categories: { select: { categoryId: true } } },
  });
  if (!doctor) {
    return NextResponse.json({ error: "Врач не найден" }, { status: 404 });
  }

  const categories = await prisma.serviceCategory.findMany({
    orderBy: { sortOrder: "asc" },
    include: {
      duration: true,
      services: { orderBy: { sortOrder: "asc" } },
    },
  });

  return NextResponse.json({
    categoryIds: doctor.categories.map((c) => c.categoryId),
    categories: categories.map(serializeCategoryWithServices),
  });
}

export async function PUT(request: Request, context: RouteContext) {
  const session = await requireAdminSession();
  if (!session) return unauthorizedResponse();

  const { id } = await context.params;
  const doctor = await prisma.doctor.findUnique({ where: { id } });
  if (!doctor) {
    return NextResponse.json({ error: "Врач не найден" }, { status: 404 });
  }

  const json = await request.json();
  const parsed = putSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Некорректные данные" }, { status: 400 });
  }

  const uniqueIds = [...new Set(parsed.data.categoryIds)];
  if (uniqueIds.length > 0) {
    const found = await prisma.serviceCategory.count({
      where: { id: { in: uniqueIds } },
    });
    if (found !== uniqueIds.length) {
      return NextResponse.json(
        { error: "Некорректный список категорий" },
        { status: 400 },
      );
    }
  }

  await prisma.$transaction([
    prisma.doctorCategory.deleteMany({ where: { doctorId: id } }),
    ...(uniqueIds.length > 0
      ? [
          prisma.doctorCategory.createMany({
            data: uniqueIds.map((categoryId) => ({ doctorId: id, categoryId })),
          }),
        ]
      : []),
  ]);

  return NextResponse.json({ categoryIds: uniqueIds });
}
