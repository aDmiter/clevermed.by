import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession, unauthorizedResponse } from "@/lib/admin-api";
import { serializeCategoryWithServices } from "@/lib/service-serializer";

export async function GET() {
  const session = await requireAdminSession();
  if (!session) return unauthorizedResponse();

  const categories = await prisma.serviceCategory.findMany({
    orderBy: { sortOrder: "asc" },
    include: {
      duration: true,
      services: {
        orderBy: { sortOrder: "asc" },
      },
    },
  });

  return NextResponse.json({
    categories: categories.map(serializeCategoryWithServices),
  });
}
