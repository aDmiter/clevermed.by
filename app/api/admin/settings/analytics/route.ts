import { NextResponse } from "next/server";
import { requireAdminSession, unauthorizedResponse } from "@/lib/admin-api";
import {
  analyticsPatchSchema,
  rowToAnalyticsSettings,
} from "@/lib/analytics-settings";
import { getAnalyticsSettings } from "@/lib/analytics-settings-server";
import { prisma } from "@/lib/prisma";

const analyticsSelect = {
  googleAnalyticsCounter: true,
  googleAnalyticsCode: true,
  yandexMetrikaCounter: true,
  yandexMetrikaCode: true,
} as const;

export async function GET() {
  const session = await requireAdminSession();
  if (!session) return unauthorizedResponse();

  const settings = await getAnalyticsSettings();
  return NextResponse.json(settings);
}

export async function PATCH(request: Request) {
  const session = await requireAdminSession();
  if (!session) return unauthorizedResponse();

  const json = await request.json();
  const parsed = analyticsPatchSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Некорректные данные" },
      { status: 400 },
    );
  }

  const data = parsed.data;

  const row = await prisma.siteSettings.upsert({
    where: { id: "default" },
    create: {
      id: "default",
      googleAnalyticsCounter: data.googleAnalyticsCounter,
      googleAnalyticsCode: data.googleAnalyticsCode,
      yandexMetrikaCounter: data.yandexMetrikaCounter,
      yandexMetrikaCode: data.yandexMetrikaCode,
    },
    update: {
      googleAnalyticsCounter: data.googleAnalyticsCounter,
      googleAnalyticsCode: data.googleAnalyticsCode,
      yandexMetrikaCounter: data.yandexMetrikaCounter,
      yandexMetrikaCode: data.yandexMetrikaCode,
    },
    select: analyticsSelect,
  });

  return NextResponse.json(rowToAnalyticsSettings(row));
}
