export type SiteSettingsPublic = {
  onlineBookingEnabled: boolean;
};

export const DEFAULT_SITE_SETTINGS: SiteSettingsPublic = {
  onlineBookingEnabled: true,
};

export const BOOKING_HREF = "/booking";
export const BOOKING_FALLBACK_HREF = "/contacts";

export function resolveBookHref(
  onlineBookingEnabled: boolean,
  options?: { doctorId?: string },
): string {
  if (!onlineBookingEnabled) return BOOKING_FALLBACK_HREF;
  if (options?.doctorId) {
    return `${BOOKING_HREF}?doctor=${encodeURIComponent(options.doctorId)}`;
  }
  return BOOKING_HREF;
}
