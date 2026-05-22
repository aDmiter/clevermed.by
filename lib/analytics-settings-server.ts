import { prisma } from "@/lib/prisma";
import {
  DEFAULT_ANALYTICS_SETTINGS,
  rowToAnalyticsSettings,
  type AnalyticsSettings,
} from "@/lib/analytics-settings";

const analyticsSelect = {
  googleAnalyticsCounter: true,
  googleAnalyticsCode: true,
  yandexMetrikaCounter: true,
  yandexMetrikaCode: true,
} as const;

export async function getAnalyticsSettings(): Promise<AnalyticsSettings> {
  try {
    const row = await prisma.siteSettings.findUnique({
      where: { id: "default" },
      select: analyticsSelect,
    });
    if (!row) return DEFAULT_ANALYTICS_SETTINGS;
    return rowToAnalyticsSettings(row);
  } catch {
    return DEFAULT_ANALYTICS_SETTINGS;
  }
}
