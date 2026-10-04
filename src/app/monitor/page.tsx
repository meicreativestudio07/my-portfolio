import type { Metadata } from "next";
import Image from "next/image";

import { PageReady } from "@/components/layout/page-ready";
import statementPortrait from "@/features/information/images/statement-portrait.jpg";
import { getMonitorPhoto } from "@/features/monitor/api/get-monitor-photo";
import { DEFAULT_SITE_TITLE } from "@/lib/site-metadata";

// The copy on this page is edited here directly, like the Statement page.

const title = "Wedding Monitor";
const description =
  "前撮りモニター 3組限定。通常50,000円のところ35,000円（税込）で、滋賀・京都・大阪の前撮りを撮影します。";

// Google Form for pre-wedding monitor sign-ups (the public answer link, not
// the editor link).
const MONITOR_FORM_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLSf2bZ-UkUQmZAbyBoyaYGl21lM_xYxKa3ZSOPkdZea_-dl-rw/viewform";

// Same account as the Instagram link in components/layout/site-header.tsx.
const INSTAGRAM_URL = "https://www.instagram.com/meimei.creativestudio/";

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

const MonitorPage = async () => {
  const photo = await getMonitorPhoto();

  return (
    <main className="monitor site-shell">
      <PageReady />

      <div className="monitor__head">
        <h1 className="monitor__title" data-reveal="text">
          {title}
        </h1>
        <p className="monitor__kicker" data-reveal="text">
          前撮りモニター 3組限定
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
          </section>

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
            <p>
              {"応募フォーム、またはInstagramのDMから"}
              <span className="u-nowrap">「モニター希望」</span>
              {"とご連絡ください。"}
            </p>
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
                className="monitor__action monitor__action--quiet"
                href={INSTAGRAM_URL}
                rel="noreferrer"
                target="_blank"
              >
                InstagramでDMする
              </a>
            </div>
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
                {"撮影に慣れていなくても大丈夫。"}
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
