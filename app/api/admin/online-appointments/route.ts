import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession, unauthorizedResponse } from "@/lib/admin-api";
import { serializeAppointment } from "@/lib/appointments/serializer";

export async function GET() {
  const session = await requireAdminSession();
  if (!session) return unauthorizedResponse();

  const appointments = await prisma.appointment.findMany({
    where: {
      source: "ONLINE",
      status: "SCHEDULED",
    },
    include: {
      doctor: { select: { name: true } },
      category: { select: { name: true } },
      procedure: { select: { title: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({
    appointments: appointments.map(serializeAppointment),
  });
}
