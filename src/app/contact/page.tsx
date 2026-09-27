import type { Metadata } from "next";

import { PageReady } from "@/components/layout/page-ready";
import { ContactForm } from "@/features/contact/components/contact-form";
import { DEFAULT_SITE_TITLE } from "@/lib/site-metadata";

const title = "Contact";
const description =
  "撮影のご相談・お見積もりなど、お気軽にお問い合わせください。";

export const metadata: Metadata = {
  title,
  description,
  openGraph: {
    title,
    description,
    siteName: DEFAULT_SITE_TITLE,
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
};

const ContactPage = () => (
  <main className="contact site-shell">
    <PageReady />

    <div className="contact__head">
      <h1 className="contact__title">Contact</h1>
      <p className="contact__lede">
        撮影のご相談・お見積もりなど、お気軽にお問い合わせください。
        <br className="pc-only" />
        内容を確認のうえ、ご入力いただいたメールアドレス宛にご返信いたします。
      </p>
    </div>

    <ContactForm />
  </main>
);

export default ContactPage;
