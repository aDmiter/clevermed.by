import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession, unauthorizedResponse } from "@/lib/admin-api";
import { serializeProcedure } from "@/lib/appointments/serializer";
import { procedureBodySchema } from "@/lib/appointments/validation";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const session = await requireAdminSession();
  if (!session) return unauthorizedResponse();

  const { id } = await context.params;
  const json = await request.json();
  const parsed = procedureBodySchema.partial().safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Некорректные данные" },
      { status: 400 },
    );
  }

  if (parsed.data.doctorIds) {
    await prisma.doctorProcedure.deleteMany({ where: { procedureId: id } });
    if (parsed.data.doctorIds.length > 0) {
      await prisma.doctorProcedure.createMany({
        data: parsed.data.doctorIds.map((doctorId) => ({
          doctorId,
          procedureId: id,
        })),
      });
    }
  }

  const procedure = await prisma.procedure.update({
    where: { id },
    data: {
      ...(parsed.data.title !== undefined
        ? { title: parsed.data.title.trim() }
        : {}),
      ...(parsed.data.durationId !== undefined
        ? { durationId: parsed.data.durationId }
        : {}),
      ...(parsed.data.published !== undefined
        ? { published: parsed.data.published }
        : {}),
    },
    include: { duration: true, doctors: true },
  });

  return NextResponse.json({ procedure: serializeProcedure(procedure) });
}

export async function DELETE(_request: Request, context: RouteContext) {
  const session = await requireAdminSession();
  if (!session) return unauthorizedResponse();

  const { id } = await context.params;
  const used = await prisma.appointment.count({ where: { procedureId: id } });
  if (used > 0) {
    return NextResponse.json(
      { error: "Процедура используется в записях" },
      { status: 409 },
    );
  }

  await prisma.procedure.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
