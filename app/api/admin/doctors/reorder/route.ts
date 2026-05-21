import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdminSession, unauthorizedResponse } from "@/lib/admin-api";

const reorderSchema = z.object({
  orderedIds: z.array(z.string().min(1)).min(1),
});

export async function PATCH(request: Request) {
  const session = await requireAdminSession();
  if (!session) return unauthorizedResponse();

  const json = await request.json();
  const parsed = reorderSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Некорректный порядок" }, { status: 400 });
  }

  const { orderedIds } = parsed.data;

  await prisma.$transaction(
    orderedIds.map((id, index) =>
      prisma.doctor.update({
        where: { id },
        data: { sortOrder: index + 1 },
      }),
    ),
  );

  return NextResponse.json({ ok: true });
}
