import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession, unauthorizedResponse } from "@/lib/admin-api";

export async function GET() {
  const session = await requireAdminSession();
  if (!session) return unauthorizedResponse();

  const count = await prisma.appointment.count({
    where: { source: "ONLINE", status: "SCHEDULED" },
  });

  return NextResponse.json(
    { count },
    { headers: { "Cache-Control": "no-store" } },
  );
}
