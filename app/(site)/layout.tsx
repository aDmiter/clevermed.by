import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { SiteAnalytics } from "@/components/site/site-analytics";
import { SiteBookingProvider } from "@/components/providers/site-booking-provider";
import { getAnalyticsSettings } from "@/lib/analytics-settings-server";
import { getSiteSettings } from "@/lib/site-settings-server";

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [settings, analytics] = await Promise.all([
    getSiteSettings(),
    getAnalyticsSettings(),
  ]);

  return (
    <SiteBookingProvider settings={settings}>
      <SiteAnalytics settings={analytics} />
      <div className="flex min-h-screen flex-col">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </div>
    </SiteBookingProvider>
  );
}
