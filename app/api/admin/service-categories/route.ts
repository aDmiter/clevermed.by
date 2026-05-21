import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession, unauthorizedResponse } from "@/lib/admin-api";
import { slugifyServiceName } from "@/lib/services";
import { categoryCreateSchema } from "@/lib/service-validation";
import { serializeCategoryWithServices } from "@/lib/service-serializer";

async function uniqueCategorySlug(base: string) {
  let slug = base || "category";
  let counter = 1;
  while (true) {
    const existing = await prisma.serviceCategory.findFirst({ where: { slug } });
    if (!existing) return slug;
    counter += 1;
    slug = `${base}-${counter}`;
  }
}

export async function POST(request: Request) {
  const session = await requireAdminSession();
  if (!session) return unauthorizedResponse();

  const json = await request.json();
  const parsed = categoryCreateSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Некорректные данные" },
      { status: 400 },
    );
  }

  const maxOrder = await prisma.serviceCategory.aggregate({
    _max: { sortOrder: true },
  });

  const slug = await uniqueCategorySlug(
    slugifyServiceName(parsed.data.name) || "category",
  );

  const category = await prisma.serviceCategory.create({
    data: {
      name: parsed.data.name.trim(),
      slug,
      sortOrder: (maxOrder._max.sortOrder ?? 0) + 1,
    },
    include: { duration: true, services: true },
  });

  return NextResponse.json(
    { category: serializeCategoryWithServices(category) },
    { status: 201 },
  );
}
