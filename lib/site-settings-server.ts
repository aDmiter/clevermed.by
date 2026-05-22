import { prisma } from "@/lib/prisma";
import {
  DEFAULT_SITE_SETTINGS,
  type SiteSettingsPublic,
} from "@/lib/site-settings";

export async function getSiteSettings(): Promise<SiteSettingsPublic> {
  try {
    const row = await prisma.siteSettings.findUnique({
      where: { id: "default" },
      select: { onlineBookingEnabled: true },
    });
    if (!row) return DEFAULT_SITE_SETTINGS;
    return { onlineBookingEnabled: row.onlineBookingEnabled };
  } catch {
    return DEFAULT_SITE_SETTINGS;
  }
}
