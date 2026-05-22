import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminSession, unauthorizedResponse } from "@/lib/admin-api";
import { getSiteSettings } from "@/lib/site-settings-server";
import { prisma } from "@/lib/prisma";

const patchSchema = z.object({
  onlineBookingEnabled: z.boolean(),
});

export async function GET() {
  const session = await requireAdminSession();
  if (!session) return unauthorizedResponse();

  const settings = await getSiteSettings();
  return NextResponse.json(settings);
}

export async function PATCH(request: Request) {
  const session = await requireAdminSession();
  if (!session) return unauthorizedResponse();

  const json = await request.json();
  const parsed = patchSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Некорректные данные" },
      { status: 400 },
    );
  }

  const settings = await prisma.siteSettings.upsert({
    where: { id: "default" },
    create: {
      id: "default",
      onlineBookingEnabled: parsed.data.onlineBookingEnabled,
    },
    update: {
      onlineBookingEnabled: parsed.data.onlineBookingEnabled,
    },
    select: { onlineBookingEnabled: true },
  });

  return NextResponse.json({
    onlineBookingEnabled: settings.onlineBookingEnabled,
  });
}
