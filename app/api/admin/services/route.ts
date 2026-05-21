import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession, unauthorizedResponse } from "@/lib/admin-api";
import { serializeService } from "@/lib/service-serializer";
import { slugifyServiceName } from "@/lib/services";
import { serviceBodySchema } from "@/lib/service-validation";

async function uniqueServiceSlug(base: string) {
  let slug = base || "service";
  let counter = 1;
  while (true) {
    const existing = await prisma.service.findFirst({ where: { slug } });
    if (!existing) return slug;
    counter += 1;
    slug = `${base}-${counter}`;
  }
}

export async function POST(request: Request) {
  const session = await requireAdminSession();
  if (!session) return unauthorizedResponse();

  const json = await request.json();
  const parsed = serviceBodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Некорректные данные" },
      { status: 400 },
    );
  }

  const category = await prisma.serviceCategory.findUnique({
    where: { id: parsed.data.categoryId },
  });
  if (!category) {
    return NextResponse.json({ error: "Категория не найдена" }, { status: 404 });
  }

  const maxOrder = await prisma.service.aggregate({
    where: { categoryId: parsed.data.categoryId },
    _max: { sortOrder: true },
  });

  const slug = await uniqueServiceSlug(
    slugifyServiceName(parsed.data.title) || "service",
  );

  const service = await prisma.service.create({
    data: {
      categoryId: parsed.data.categoryId,
      slug,
      title: parsed.data.title.trim(),
      amount: parsed.data.amount,
      published: parsed.data.published ?? true,
      sortOrder: (maxOrder._max.sortOrder ?? 0) + 1,
    },
  });

  return NextResponse.json(
    { service: serializeService(service) },
    { status: 201 },
  );
}
