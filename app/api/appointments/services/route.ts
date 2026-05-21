import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { serializeBookingCategory } from "@/lib/service-serializer";

const querySchema = z.object({
  doctorId: z.string().min(1),
});

/** Список категорий услуг врача для онлайн-записи */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const parsed = querySchema.safeParse({
    doctorId: searchParams.get("doctorId"),
  });

  if (!parsed.success) {
    return NextResponse.json({ error: "Укажите врача" }, { status: 400 });
  }

  const links = await prisma.doctorCategory.findMany({
    where: {
      doctorId: parsed.data.doctorId,
      category: {
        durationId: { not: null },
      },
    },
    include: {
      category: { include: { duration: true } },
    },
    orderBy: { category: { sortOrder: "asc" } },
  });

  const categories = links.map((l) => serializeBookingCategory(l.category));

  return NextResponse.json({ categories });
}
