import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { serializeProcedure } from "@/lib/appointments/serializer";

const querySchema = z.object({
  doctorId: z.string().min(1),
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const parsed = querySchema.safeParse({
    doctorId: searchParams.get("doctorId"),
  });

  if (!parsed.success) {
    return NextResponse.json({ error: "Укажите врача" }, { status: 400 });
  }

  const procedures = await prisma.procedure.findMany({
    where: {
      published: true,
      doctors: { some: { doctorId: parsed.data.doctorId } },
    },
    include: { duration: true, doctors: true },
    orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
  });

  return NextResponse.json({
    procedures: procedures.map(serializeProcedure),
  });
}
