import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession, unauthorizedResponse } from "@/lib/admin-api";
import { reorderSchema } from "@/lib/service-validation";

export async function PATCH(request: Request) {
  const session = await requireAdminSession();
  if (!session) return unauthorizedResponse();

  const json = await request.json();
  const parsed = reorderSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Некорректный порядок" }, { status: 400 });
  }

  await prisma.$transaction(
    parsed.data.orderedIds.map((id, index) =>
      prisma.serviceCategory.update({
        where: { id },
        data: { sortOrder: index + 1 },
      }),
    ),
  );

  return NextResponse.json({ ok: true });
}
