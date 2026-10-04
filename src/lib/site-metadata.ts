export const SITE_NAME = "Takahashi Mei";
export const DEFAULT_SITE_TITLE = "Être";
export const DEFAULT_SITE_DESCRIPTION =
  "滋賀・京都・大阪の前撮り・ビジネスポートレート撮影｜Être";

export const getSiteUrl = (): string => {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL;
  }
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return "https://takahashimei.com";
};

export const getAbsoluteUrl = (path = ""): string => {
  const baseUrl = getSiteUrl().replace(/\/+$/, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${baseUrl}${normalizedPath}`;
};
