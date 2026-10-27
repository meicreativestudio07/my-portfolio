import type { Metadata } from "next";

import { PageReady } from "@/components/layout/page-ready";
import { TransitionLink } from "@/components/navigation/transition-link";
import { DEFAULT_SITE_TITLE } from "@/lib/site-metadata";

// The copy on this page is edited here directly, like the About page.

const title = "プライバシーについて";
const description =
  "Êtreのサイトでのアクセス解析（Googleアナリティクス）と、いただいた個人情報の扱いについて。";

const GOOGLE_PARTNER_SITES_URL =
  "https://policies.google.com/technologies/partner-sites?hl=ja";
const GA_OPT_OUT_URL = "https://tools.google.com/dlpage/gaoptout?hl=ja";

export const metadata: Metadata = {
  title,
  description,
  openGraph: {
    title,
    description,
    siteName: DEFAULT_SITE_TITLE,
  },
};

const PrivacyPage = () => (
  <main className="privacy site-shell">
    <PageReady />

    <h1 className="privacy__title" data-reveal="text">
      {title}
    </h1>

    <div className="privacy__copy">
      <section aria-labelledby="privacy-analytics" data-reveal="text">
        <h2 id="privacy-analytics">アクセス解析について</h2>
        <p>
          {"このサイトでは、どのページがどのくらい見られているかを知るために、"}
          {"Google社の「Googleアナリティクス」を使っています。"}
        </p>
        <p>
          {
            "Googleアナリティクスは、Cookie（クッキー）という仕組みを使って、このサイトへのアクセスの情報を集めます。"
          }
          {
            "この情報に、お名前やメールアドレスなど、個人を特定できるものは含まれません。"
          }
        </p>
        <p>
          {
            "集めた情報は、Google社のプライバシーポリシーにもとづいて管理されます。"
          }
          {"くわしくは、Google社の"}
          <a href={GOOGLE_PARTNER_SITES_URL} rel="noreferrer" target="_blank">
            「Google のサービスを使用するサイトやアプリから収集した情報の Google
            による使用」
          </a>
          {"をご覧ください。"}
        </p>
        <p>
          {
            "情報を集められたくない場合は、ブラウザの設定でCookieを無効にするか、"
          }
          <a href={GA_OPT_OUT_URL} rel="noreferrer" target="_blank">
            「Google アナリティクス オプトアウト アドオン」
          </a>
          {"をご利用ください。"}
        </p>
      </section>

      <section aria-labelledby="privacy-personal" data-reveal="text">
        <h2 id="privacy-personal">いただいた個人情報について</h2>
        <p>応募フォームには、Googleフォームを使っています。</p>
        <p>
          {
            "応募フォーム、お問い合わせ、DMでいただいたお名前やご連絡先は、ご連絡と撮影のご案内のためだけに使います。"
          }
          {"ご本人の同意なく、ほかの人や会社に渡すことはありません。"}
        </p>
      </section>

      <section aria-labelledby="privacy-contact" data-reveal="text">
        <h2 id="privacy-contact">お問い合わせ</h2>
        <p>
          {"このページについてのお問い合わせは、"}
          <TransitionLink href="/contact">Contactページ</TransitionLink>
          {"からご連絡ください。"}
        </p>
      </section>

      <p className="privacy__signature" data-reveal="text">
        2026年10月　Être　髙橋 萌衣
      </p>
    </div>
  </main>
);

export default PrivacyPage;
