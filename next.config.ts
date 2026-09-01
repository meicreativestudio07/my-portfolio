import type { NextConfig } from "next";

// keystatic.config.ts は動的ルートからしか評価されないため、リポジトリ指定の
// 形式エラーはここ(ビルド・起動時に必ず通る)で検証して早く止める
const keystaticRepo = process.env.NEXT_PUBLIC_KEYSTATIC_GITHUB_REPO;
if (keystaticRepo !== undefined) {
  const parts = keystaticRepo.split("/");
  if (parts.length !== 2 || parts.some((part) => part === ""))
    throw new Error(
      `NEXT_PUBLIC_KEYSTATIC_GITHUB_REPO は owner/name の形式で指定してください(いまは「${keystaticRepo}」)`,
    );
}

const nextConfig: NextConfig = {
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
