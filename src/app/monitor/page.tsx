import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { PageReady } from "@/components/layout/page-ready";
import statementPortrait from "@/features/information/images/statement-portrait.jpg";
import {
  getMonitorGallery,
  getMonitorPhoto,
} from "@/features/monitor/api/get-monitor-photo";
import { getVoices } from "@/features/voice/api/get-voices";
import { VoiceSection } from "@/features/voice/components/voice-section";
import { DEFAULT_SITE_TITLE } from "@/lib/site-metadata";

// The copy on this page is edited here directly, like the About page.

const title = "Wedding Monitor";
const description =
  "前撮りモニター 毎月3組限定。通常50,000円のところ35,000円（税込）で、滋賀・京都・大阪の前撮りを撮影します。";

// Google Form for pre-wedding monitor sign-ups (the public answer link, not
// the editor link).
const MONITOR_FORM_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLSf2bZ-UkUQmZAbyBoyaYGl21lM_xYxKa3ZSOPkdZea_-dl-rw/viewform";

// Instagram DM for people who want to ask before applying. ig.me opens a
// direct message to the account in the Instagram app.
const MONITOR_DM_URL = "https://ig.me/m/meimei.creativestudio";

const planItems = [
  { label: "撮影時間", value: "2時間" },
  { label: "納品枚数", value: "100枚（データ納品）" },
  { label: "納品時期", value: "撮影後1週間以内" },
  { label: "ロケーション", value: "1か所" },
  {
    label: "衣装・ヘアメイク",
    value: "お持ち込み（ドレスでも私服でも撮影できます）",
  },
  { label: "対応エリア", value: "滋賀・京都・大阪" },
  { label: "出張費", value: "滋賀・京都は無料／その他の地域はお見積り" },
] as const;

const planNotes = [
  "ロケ地によっては、撮影料金（施設利用料）がかかる場合がございます",
  "撮影日はご相談のうえ決めます",
  "雨天時は日程変更が可能です",
  "その他のご希望はお気軽にご相談ください",
  "募集は予告なく終了する場合があります",
] as const;

const steps = [
  "応募フォーム、またはInstagramのDMからご連絡ください",
  "日程・場所・衣装のイメージをご相談して、撮影日を決めます",
  "当日は2時間、お話ししながらゆっくり撮影します",
  "撮影後1週間以内に、100枚のデータをお届けします",
] as const;

const faqs = [
  {
    question: "撮影に慣れていなくても大丈夫ですか？",
    answer:
      "大丈夫です。立ち位置やポーズはその都度お伝えするので、おふたりは会話を楽しむだけで構いません。",
  },
  {
    question: "ドレスやタキシードがなくても撮影できますか？",
    answer:
      "できます。普段の私服やカジュアルな服装での前撮りも歓迎です。衣装・ヘアメイクはお持ち込みでお願いしています。",
  },
  {
    question: "日程がまだ決まっていなくても応募できますか？",
    answer: "できます。応募後に、ご都合を伺いながら撮影日を決めます。",
  },
  {
    question: "雨の日はどうなりますか？",
    answer: "日程を変更できます。",
  },
  {
    question: "応募の前に質問だけしてもいいですか？",
    answer: "もちろんです。InstagramのDMから、お気軽にご連絡ください。",
  },
] as const;

const conditions = [
  "写真をHP・SNSに掲載させていただけること",
  "撮影後の簡単なアンケートへのご回答",
  "アンケート内容を「お客様の声」としてHPに掲載させていただけること",
] as const;

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

// The two ways in: the form to apply, and a DM for anyone not ready to.
// Shown under the price and again at the end, so nobody has to scroll back.
const MonitorActions = () => (
  <div className="monitor__actions">
    <a
      className="monitor__action"
      href={MONITOR_FORM_URL}
      rel="noreferrer"
      target="_blank"
    >
      応募フォームを開く
    </a>
    <a
      className="monitor__secondary-action"
      href={MONITOR_DM_URL}
      rel="noreferrer"
      target="_blank"
    >
      まずはInstagramのDMで相談する
    </a>
  </div>
);

const MonitorPage = async () => {
  const [photo, gallery, voices] = await Promise.all([
    getMonitorPhoto(),
    getMonitorGallery(),
    getVoices("wedding"),
  ]);

  return (
    <main className="monitor site-shell">
      <PageReady />

      <div className="monitor__head">
        <h1 className="monitor__title" data-reveal="text">
          {title}
        </h1>
        <p className="monitor__kicker" data-reveal="text">
          前撮りモニター 毎月3組限定
        </p>
      </div>

      <div className="monitor__body">
        {photo ? (
          <div className="monitor__media">
            <Image
              className="monitor__image"
              data-reveal="rise"
              src={photo.image}
              alt={photo.alt}
              priority
              sizes="(min-width: 48rem) 40vw, 100vw"
            />
          </div>
        ) : null}

        <div className="monitor__copy">
          <div className="monitor__lede" data-reveal="text">
            <p className="monitor__catch">
              <span>ありのままのおふたりで在る、</span>
              <span>その日を残す。</span>
            </p>
            <p>
              {"Êtreは「存在する」という意味のフランス語です。"}
              {"着飾りすぎなくていい。"}
              {"おふたりらしい自然な表情を、写真に残すお手伝いをします。"}
            </p>
          </div>

          <section
            className="monitor__section"
            aria-labelledby="monitor-price"
            data-reveal="text"
          >
            <h2 id="monitor-price">モニター価格</h2>
            <p className="monitor__price">
              <span className="monitor__price-regular">
                通常 <s>50,000円</s>
              </span>
              <span className="monitor__price-offer">
                35,000円<small>（税込）</small>
              </span>
            </p>
            <p>
              {"ひとりで撮影から編集まで行うため、"}
              {"余分な費用をかけずにお届けしています。"}
            </p>
            <MonitorActions />
          </section>

          {gallery.length > 0 ? (
            <section
              className="monitor__section"
              aria-labelledby="monitor-gallery"
            >
              <h2 id="monitor-gallery" data-reveal="text">
                撮影例
              </h2>
              <ul className="monitor__gallery">
                {gallery.map((cut) => (
                  <li key={cut.image.src}>
                    <Image
                      className="monitor__gallery-image"
                      data-reveal="rise"
                      src={cut.image}
                      alt={cut.alt}
                      sizes="(min-width: 48rem) 20vw, 50vw"
                    />
                  </li>
                ))}
              </ul>
              <Link className="monitor__more" href="/wedding">
                ほかの作品を見る
              </Link>
            </section>
          ) : null}

          <section
            className="monitor__section"
            aria-labelledby="monitor-plan"
            data-reveal="text"
          >
            <h2 id="monitor-plan">プラン内容</h2>
            <dl className="monitor__plan">
              {planItems.map((item) => (
                <div className="monitor__plan-row" key={item.label}>
                  <dt>{item.label}</dt>
                  <dd>{item.value}</dd>
                </div>
              ))}
            </dl>
            <ul className="monitor__notes">
              {planNotes.map((note) => (
                <li key={note}>{note}</li>
              ))}
            </ul>
          </section>

          <section
            className="monitor__section"
            aria-labelledby="monitor-steps"
            data-reveal="text"
          >
            <h2 id="monitor-steps">撮影までの流れ</h2>
            <ol className="monitor__steps">
              {steps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </section>

          <section
            className="monitor__section"
            aria-labelledby="monitor-conditions"
            data-reveal="text"
          >
            <h2 id="monitor-conditions">モニターの条件</h2>
            <ul className="monitor__list">
              {conditions.map((condition) => (
                <li key={condition}>{condition}</li>
              ))}
            </ul>
          </section>

          <VoiceSection
            voices={voices}
            id="monitor-voice"
            title="お客様の声"
            variant="inline"
          />

          <section
            className="monitor__section"
            aria-labelledby="monitor-faq"
            data-reveal="text"
          >
            <h2 id="monitor-faq">よくあるご質問</h2>
            <dl className="monitor__faq">
              {faqs.map((faq) => (
                <div className="monitor__faq-item" key={faq.question}>
                  <dt>{faq.question}</dt>
                  <dd>{faq.answer}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section
            className="monitor__section"
            aria-labelledby="monitor-apply"
            data-reveal="text"
          >
            <h2 id="monitor-apply">応募・ご相談</h2>
            <p>
              {"応募フォームからお申し込みください。"}
              {"日程が決まっていなくても大丈夫です。"}
              {"応募の前に聞きたいことがあれば、DMでお気軽にどうぞ。"}
            </p>
            <MonitorActions />
          </section>

          <section
            className="monitor__photographer"
            aria-labelledby="monitor-photographer"
          >
            <Image
              className="monitor__portrait"
              data-reveal="rise"
              src={statementPortrait}
              alt="髙橋 萌衣のポートレート"
              placeholder="blur"
              sizes="(min-width: 48rem) 8rem, 6rem"
            />
            <div data-reveal="text">
              <h2 id="monitor-photographer">撮影するのはわたしです</h2>
              <p className="monitor__name">髙橋 萌衣 / Takahashi Mei</p>
              <p>
                {"滋賀を拠点に、写真と映像を撮っています。"}
                {"撮影に慣れていなくても、しっかりサポートします。"}
                {"おふたりのペースで、楽しくお話ししながら撮影します。"}
              </p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
};

export default MonitorPage;
