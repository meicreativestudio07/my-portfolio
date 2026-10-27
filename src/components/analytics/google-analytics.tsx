import Script from "next/script";

import { GA_MEASUREMENT_ID } from "@/lib/analytics";

// Loads GA4 on deployed builds only, so local development never counts.
// Client-side route changes are counted by GA4's own history tracking.
export const GoogleAnalytics = () => {
  if (!GA_MEASUREMENT_ID || process.env.NODE_ENV !== "production") return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`window.dataLayer=window.dataLayer||[];window.gtag=function(){dataLayer.push(arguments)};gtag("js",new Date());gtag("config","${GA_MEASUREMENT_ID}");`}
      </Script>
    </>
  );
};
