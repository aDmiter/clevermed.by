import Script from "next/script";
import {
  normalizeAnalyticsSnippet,
  type AnalyticsSettings,
} from "@/lib/analytics-settings";

type SiteAnalyticsProps = {
  settings: AnalyticsSettings;
};

export function SiteAnalytics({ settings }: SiteAnalyticsProps) {
  const gaId = settings.googleAnalyticsCounter.trim();
  const ymId = settings.yandexMetrikaCounter.trim();
  const gaExtra = normalizeAnalyticsSnippet(settings.googleAnalyticsCode);
  const ymExtra = normalizeAnalyticsSnippet(settings.yandexMetrikaCode);

  if (!gaId && !ymId && !gaExtra && !ymExtra) {
    return null;
  }

  return (
    <>
      {gaId ? (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(gaId)}`}
            strategy="afterInteractive"
          />
          <Script id="clevermed-ga" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${gaId.replace(/'/g, "\\'")}');
            `}
          </Script>
        </>
      ) : null}
      {gaExtra ? (
        <Script
          id="clevermed-ga-extra"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{ __html: gaExtra }}
        />
      ) : null}
      {ymId ? (
        <>
          <Script id="clevermed-ym" strategy="afterInteractive">
            {`
              (function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
              m[i].l=1*new Date();
              for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
              k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
              (window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");
              ym(${ymId}, "init", {
                clickmap: true,
                trackLinks: true,
                accurateTrackBounce: true,
                webvisor: true
              });
            `}
          </Script>
          <noscript>
            <div>
              <img
                src={`https://mc.yandex.ru/watch/${ymId}`}
                style={{ position: "absolute", left: "-9999px" }}
                alt=""
              />
            </div>
          </noscript>
        </>
      ) : null}
      {ymExtra ? (
        <Script
          id="clevermed-ym-extra"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{ __html: ymExtra }}
        />
      ) : null}
    </>
  );
}
