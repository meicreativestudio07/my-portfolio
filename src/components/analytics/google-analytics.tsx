import { GA_MEASUREMENT_ID } from "@/lib/analytics";

// Loads GA4 on deployed builds only, so local development never counts.
// Plain <head> scripts, like the reveal boot script, so the server HTML and
// hydration always agree. Client-side route changes are counted by GA4's
// own history tracking.
export const GoogleAnalytics = () => {
  if (!GA_MEASUREMENT_ID || process.env.NODE_ENV !== "production") return null;

  return (
    <>
      <script
        async
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
      />
      <script
        // biome-ignore lint/security/noDangerouslySetInnerHtml: static GA4 bootstrap, no user input
        dangerouslySetInnerHTML={{
          __html: `window.dataLayer=window.dataLayer||[];window.gtag=function(){dataLayer.push(arguments)};gtag("js",new Date());gtag("config","${GA_MEASUREMENT_ID}");`,
        }}
      />
    </>
  );
};
