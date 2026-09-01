import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { isKeystaticGithubConfigured } from "@/lib/keystatic-mode";

// 管理画面は検索結果に出さない(GitHub モード有効時は本番でも 200 を返すため)
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

// GitHub モードが構成されていない本番では Admin を出さない(ローカルモードの
// 書き込みはサーバーレス環境で永続しないため)。構成されていれば、デプロイ済み
// サイトの /keystatic から GitHub ログインで編集できる。
// import() を 404 判定の後に置くことで、404 になる本番ビルドのページ読み込みに
// Admin のバンドルが含まれないようにしている。
const KeystaticPage = async () => {
  if (process.env.NODE_ENV === "production" && !isKeystaticGithubConfigured())
    notFound();
  const { default: Keystatic } = await import("../keystatic");
  return <Keystatic />;
};

export default KeystaticPage;
