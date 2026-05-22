import { getSiteSettings } from "@/lib/site-settings-server";

export async function isOnlineBookingEnabled(): Promise<boolean> {
  const settings = await getSiteSettings();
  return settings.onlineBookingEnabled;
}
