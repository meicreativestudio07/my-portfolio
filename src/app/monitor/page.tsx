import type { Metadata } from "next";
import Image from "next/image";

import { PageReady } from "@/components/layout/page-ready";
import statementPortrait from "@/features/information/images/statement-portrait.jpg";
import {
  getMonitorGallery,
  getMonitorPhoto,
} from "@/features/monitor/api/get-monitor-photo";
import { getVoices } from "@/features/voice/api/get-voices";
import { VoiceSection } from "@/features/voice/components/voice-section";
import { APPLY_CLICK_EVENT, DM_CLICK_EVENT } from "@/lib/analytics";
import { DEFAULT_SITE_TITLE } from "@/lib/site-metadata";

// The copy on this page is edited here directly, like the About page.

const title = "Wedding Monitor";
const description =
  "前撮りモニター 毎月3組限定。通常50,000円のところ35,000円（税込）で、滋賀・京都・大阪の前撮りを撮影します。";

// Google Form for pre-wedding monitor sign-ups (the public answer link, not
// the editor link).
const MONITOR_FORM_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLSf2bZ-UkUQmZAbyBoyaYGl21lM_xYxKa3ZSOPkdZea_-dl-rw/viewform";

const planItems = [
  { label: "撮影時間", value: "2時間" },
  { label: "納品枚数", value: "100枚（データ納品）" },
  { label: "ロケーション", value: "1か所" },
  { label: "衣装・ヘアメイク", value: "お持ち込み" },
  { label: "対応エリア", value: "滋賀・京都・大阪" },
] as const;

const planNotes = [
  "撮影場所により、別途出張費が必要です",
  "ロケ地によっては、撮影料金（施設利用料）がかかる場合がございます",
  "撮影日はご相談のうえ決めます",
  "雨天時は日程変更が可能です",
  "その他のご希望はお気軽にご相談ください",
  "募集は予告なく終了する場合があります",
] as const;

const conditions = [
  "写真をHP・SNSに掲載させていただけること",
  "撮影後の簡単なアンケートへのご回答",
  "アンケート内容を「お客様の声」としてHPに掲載させていただけること",
] as const;

// Instagram DM for people who want to ask before applying. ig.me opens a
// direct message to the account in the Instagram app.
const MONITOR_DM_URL = "https://ig.me/m/meimei.creativestudio";

// The two ways in: the form to apply, and a DM for anyone not ready to.
// Shown under the price and again at the end, so nobody has to scroll to the
// bottom to apply. `position` tells the two places apart in GA4.
const MonitorActions = ({ position }: Readonly<{ position: string }>) => (
  <div className="monitor__actions">
    <a
      className="monitor__action"
      data-track={APPLY_CLICK_EVENT}
      data-track-position={position}
      href={MONITOR_FORM_URL}
      rel="noreferrer"
      target="_blank"
    >
      応募フォームを開く
    </a>
    <a
      className="monitor__secondary-action"
      data-track={DM_CLICK_EVENT}
      data-track-position={position}
      href={MONITOR_DM_URL}
      rel="noreferrer"
      target="_blank"
    >
      まずはInstagramのDMで相談する
    </a>
  </div>
);

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

const MonitorPage = async () => {
  // Voices are still few, so Business ones join the Wedding ones here.
  const [photo, gallery, weddingVoices, businessVoices] = await Promise.all([
    getMonitorPhoto(),
    getMonitorGallery(),
    getVoices("wedding"),
    getVoices("business"),
  ]);
  const voices = [...weddingVoices, ...businessVoices];

  return (
    <main className="monitor site-shell">
      <PageReady />

      <div className="monitor__head">
        <h1 className="monitor__title" data-reveal="text">
          {title}
        </h1>
        <p className="monitor__kicker" data-reveal="text">
          前撮りモニター 毎月3組限定・
          <span className="monitor__kicker-price">35,000円（税込）</span>
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
            <MonitorActions position="top" />
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
                      sizes="(min-width: 48rem) 15vw, 50vw"
                    />
                  </li>
                ))}
              </ul>
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
            {/* Folded so the costs read as details, not as the last thing
                before applying; the summary names what is inside. */}
            <details className="monitor__details">
              <summary>注意事項（出張費・撮影日・雨天時など）</summary>
              <ul className="monitor__notes">
                {planNotes.map((note) => (
                  <li key={note}>{note}</li>
                ))}
              </ul>
            </details>
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

          <section
            className="monitor__section"
            aria-labelledby="monitor-apply"
            data-reveal="text"
          >
            <h2 id="monitor-apply">応募方法</h2>
            <p>下の応募フォームからお申し込みください。</p>
            <MonitorActions position="bottom" />
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

          {/* Last and in smaller type, so the voices never read as part of
              the plan details above. */}
          <VoiceSection
            voices={voices}
            id="monitor-voice"
            title="お客様の声"
            variant="inline"
          />
        </div>
      </div>
    </main>
  );
};

export default MonitorPage;
