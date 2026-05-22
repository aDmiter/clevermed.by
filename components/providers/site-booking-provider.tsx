"use client";

import { createContext, useContext, useMemo } from "react";
import {
  BOOKING_FALLBACK_HREF,
  BOOKING_HREF,
  resolveBookHref,
  type SiteSettingsPublic,
} from "@/lib/site-settings";

type SiteBookingContextValue = {
  onlineBookingEnabled: boolean;
  bookHref: string;
  doctorBookHref: (doctorId: string) => string;
};

const SiteBookingContext = createContext<SiteBookingContextValue | null>(null);

type SiteBookingProviderProps = {
  children: React.ReactNode;
  settings: SiteSettingsPublic;
};

export function SiteBookingProvider({
  children,
  settings,
}: SiteBookingProviderProps) {
  const value = useMemo<SiteBookingContextValue>(
    () => ({
      onlineBookingEnabled: settings.onlineBookingEnabled,
      bookHref: settings.onlineBookingEnabled
        ? BOOKING_HREF
        : BOOKING_FALLBACK_HREF,
      doctorBookHref: (doctorId: string) =>
        resolveBookHref(settings.onlineBookingEnabled, { doctorId }),
    }),
    [settings.onlineBookingEnabled],
  );

  return (
    <SiteBookingContext.Provider value={value}>
      {children}
    </SiteBookingContext.Provider>
  );
}

export function useSiteBooking(): SiteBookingContextValue {
  const ctx = useContext(SiteBookingContext);
  if (!ctx) {
    return {
      onlineBookingEnabled: true,
      bookHref: BOOKING_HREF,
      doctorBookHref: (doctorId: string) =>
        resolveBookHref(true, { doctorId }),
    };
  }
  return ctx;
}
