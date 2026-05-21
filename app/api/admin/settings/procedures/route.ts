import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession, unauthorizedResponse } from "@/lib/admin-api";
import { serializeProcedure } from "@/lib/appointments/serializer";
import { procedureBodySchema } from "@/lib/appointments/validation";

export async function GET() {
  const session = await requireAdminSession();
  if (!session) return unauthorizedResponse();

  const procedures = await prisma.procedure.findMany({
    include: {
      duration: true,
      doctors: true,
    },
    orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
  });

  return NextResponse.json({
    procedures: procedures.map(serializeProcedure),
  });
}

export async function POST(request: Request) {
  const session = await requireAdminSession();
  if (!session) return unauthorizedResponse();

  const json = await request.json();
  const parsed = procedureBodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Некорректные данные" },
      { status: 400 },
    );
  }

  const maxOrder = await prisma.procedure.aggregate({ _max: { sortOrder: true } });

  const procedure = await prisma.procedure.create({
    data: {
      title: parsed.data.title.trim(),
      durationId: parsed.data.durationId,
      published: parsed.data.published ?? true,
      sortOrder: (maxOrder._max.sortOrder ?? 0) + 1,
      doctors: parsed.data.doctorIds?.length
        ? {
            create: parsed.data.doctorIds.map((doctorId) => ({ doctorId })),
          }
        : undefined,
    },
    include: { duration: true, doctors: true },
  });

  return NextResponse.json(
    { procedure: serializeProcedure(procedure) },
    { status: 201 },
  );
}
