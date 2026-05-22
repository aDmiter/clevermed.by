import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession, unauthorizedResponse } from "@/lib/admin-api";

type RouteContext = { params: Promise<{ id: string }> };

export async function DELETE(_request: Request, context: RouteContext) {
  const session = await requireAdminSession();
  if (!session) return unauthorizedResponse();

  const { id } = await context.params;
  const existing = await prisma.appointment.findUnique({ where: { id } });

  if (!existing) {
    return NextResponse.json({ error: "Запись не найдена" }, { status: 404 });
  }

  if (existing.source !== "ONLINE" || existing.status !== "SCHEDULED") {
    return NextResponse.json(
      { error: "Можно удалить только неподтверждённую онлайн-заявку" },
      { status: 409 },
    );
  }

  await prisma.appointment.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
