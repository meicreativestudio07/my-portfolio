export const SITE_NAME = "Takahashi Mei";
export const DEFAULT_SITE_TITLE = "Être";
export const DEFAULT_SITE_DESCRIPTION =
  "滋賀・京都・大阪の前撮り・ビジネスポートレート撮影｜Être";

// 公開サイトのURL。独自ドメインに移ったら、ここ1か所を書き換える
// (canonical・OGP・sitemap.xml・robots.txt がすべてこの値から作られる)。
// 環境変数 NEXT_PUBLIC_SITE_URL を設定すれば、コードを変えずに上書きできる。
export const PRODUCTION_SITE_URL = "https://etre-studio.vercel.app";

export const getSiteUrl = (): string => {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL;
  }
  return PRODUCTION_SITE_URL;
};

export const getAbsoluteUrl = (path = ""): string => {
  const baseUrl = getSiteUrl().replace(/\/+$/, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${baseUrl}${normalizedPath}`;
};
