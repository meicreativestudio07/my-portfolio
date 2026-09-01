/**
 * Keystatic Admin UI のスキーマ定義。
 *
 * ストレージは環境変数で切り替わる:
 *   - NEXT_PUBLIC_KEYSTATIC_GITHUB_APP_SLUG があれば GitHub モード
 *     (保存 = このリポジトリへのコミット → 自動ビルドで公開反映)。
 *     このファイルはクライアントにもバンドルされるため、ビルド時に
 *     インライン化される NEXT_PUBLIC 変数で判定する。サーバー側の残りの
 *     必須変数は src/lib/keystatic-mode.ts が確認する
 *   - なければローカルモード(`pnpm dev` 中に保存 = content/ への書き込み)
 * セットアップ手順: docs/keystatic-github-setup.md
 *
 * ここは編集 UI の入力制約のみを担う。ビルド時の最終検証と型付きデータの
 * 生成は従来どおり scripts/generate-content.mjs が行い、reader API は使わない。
 */
import { collection, config, fields, singleton } from "@keystatic/core";

// 移譲などでリポジトリのオーナー名が変わったら、コードを書き換えずに
// NEXT_PUBLIC_KEYSTATIC_GITHUB_REPO(owner/name)で上書きできる。
// 形式が壊れていたら実行時の分かりにくい404ではなくビルドで止める
const repoInput =
  process.env.NEXT_PUBLIC_KEYSTATIC_GITHUB_REPO ??
  "hasesho05/mei-portfolio-next";
const repoParts = repoInput.split("/");
if (repoParts.length !== 2 || repoParts.some((part) => part === ""))
  throw new Error(
    `NEXT_PUBLIC_KEYSTATIC_GITHUB_REPO は owner/name の形式で指定してください(いまは「${repoInput}」)`,
  );
const [repoOwner, repoName] = repoParts;

const storage = process.env.NEXT_PUBLIC_KEYSTATIC_GITHUB_APP_SLUG
  ? ({ kind: "github", repo: `${repoOwner}/${repoName}` } as const)
  : ({ kind: "local" } as const);

const slugPattern = {
  pattern: {
    regex: /^[a-z0-9-]+$/,
    message: "半角英小文字・数字・ハイフンのみ使えます",
  },
};

const altField = (description: string) =>
  fields.text({
    label: "写真の説明(alt)",
    description,
    validation: { isRequired: true },
  });

const commissionSchema = {
  title: fields.slug({
    name: { label: "タイトル", validation: { isRequired: true } },
    slug: {
      label: "フォルダ名(URL)",
      description:
        "半角英小文字とハイフンのみ。一度公開したら変えない(URLが壊れます)",
      validation: slugPattern,
    },
  }),
  meta: fields.array(
    fields.object({
      label: fields.text({
        label: "ラベル",
        validation: { isRequired: true },
      }),
      value: fields.text({
        label: "内容",
        validation: { isRequired: true },
      }),
    }),
    {
      label: "メタ情報",
      description:
        "作品の下に出る情報。Corporate は クライアント/媒体/年、Wedding は 会場/エリア/年 が目安",
      itemLabel: (props) =>
        `${props.fields.label.value}: ${props.fields.value.value}`,
      validation: { length: { min: 1 } },
    },
  ),
  cuts: fields.array(
    fields.object({
      file: fields.image({
        label: "写真",
        validation: { isRequired: true },
      }),
      alt: altField("写真の内容の短い説明。読み上げに使われます"),
      video: fields.url({
        label: "動画URL(任意)",
        description:
          "YouTube / Vimeo のURL。書くと詳細ページにプレイヤーが出ます",
      }),
    }),
    {
      label: "カット(必ず3枚)",
      description: "1枚目がいちばん大きく表示されます",
      itemLabel: (props) => props.fields.alt.value || "写真",
      validation: { length: { min: 3, max: 3 } },
    },
  ),
  hover: fields.object(
    {
      file: fields.image({ label: "写真" }),
      alt: fields.text({ label: "写真の説明(alt)" }),
    },
    {
      label: "ホバー写真(任意)",
      description:
        "一覧でカーソルを重ねたとき切り替わる写真。ムービー作品の合図に使う。使わないときは両方空のまま",
    },
  ),
};

const sectionSchema = {
  title: fields.text({
    label: "ページの見出し",
    validation: { isRequired: true },
  }),
  description: fields.text({
    label: "説明文",
    description: "検索結果などに出る文章",
    multiline: true,
    validation: { isRequired: true },
  }),
  lede: fields.text({
    label: "リード文",
    description: "見出しの下に出る文章",
    multiline: true,
    validation: { isRequired: true },
  }),
};

const orderSchema = (collectionKey: "portfolio" | "corporate" | "wedding") => ({
  items: fields.array(
    fields.relationship({
      label: "作品",
      collection: collectionKey,
      validation: { isRequired: true },
    }),
    {
      label: "表示順",
      description: "上にある作品ほど先に表示されます。ドラッグで並び替え",
      itemLabel: (props) => props.value ?? "(未選択)",
    },
  ),
});

export default config({
  storage,
  ui: {
    brand: { name: "Mei Portfolio" },
  },
  collections: {
    portfolio: collection({
      label: "Portfolio(個人制作)",
      slugField: "title",
      path: "content/portfolio/*/",
      format: { data: "yaml" },
      schema: {
        title: fields.slug({
          name: { label: "タイトル", validation: { isRequired: true } },
          slug: {
            label: "フォルダ名(URL)",
            description:
              "半角英小文字とハイフンのみ。一度公開したら変えない(URLが壊れます)",
            validation: slugPattern,
          },
        }),
        category: fields.text({
          label: "カテゴリー",
          description:
            "Editorial / Campaign / Portrait / Photo Book / Look Book",
          validation: { isRequired: true },
        }),
        client: fields.text({
          label: "クライアント",
          validation: { isRequired: true },
        }),
        year: fields.text({
          label: "年",
          validation: { isRequired: true },
        }),
        thumbnail: fields.image({
          label: "サムネイル",
          description: "一覧に出る写真",
          validation: { isRequired: true },
        }),
        thumbnailAlt: altField("サムネイルの内容の短い説明"),
        images: fields.array(
          fields.object({
            file: fields.image({
              label: "写真",
              validation: { isRequired: true },
            }),
            alt: altField("写真の内容の短い説明"),
          }),
          {
            label: "詳細ページの写真(任意)",
            itemLabel: (props) => props.fields.alt.value || "写真",
          },
        ),
      },
    }),
    corporate: collection({
      label: "Corporate(企業案件)",
      slugField: "title",
      path: "content/corporate/*/",
      format: { data: "yaml" },
      schema: commissionSchema,
    }),
    wedding: collection({
      label: "Wedding(結婚写真)",
      slugField: "title",
      path: "content/wedding/*/",
      format: { data: "yaml" },
      schema: commissionSchema,
    }),
  },
  singletons: {
    corporateSection: singleton({
      label: "Corporate ページ文言",
      path: "content/corporate/section",
      format: { data: "yaml" },
      schema: sectionSchema,
    }),
    weddingSection: singleton({
      label: "Wedding ページ文言",
      path: "content/wedding/section",
      format: { data: "yaml" },
      schema: sectionSchema,
    }),
    portfolioOrder: singleton({
      label: "Portfolio 表示順",
      path: "content/portfolio/order",
      format: { data: "yaml" },
      schema: orderSchema("portfolio"),
    }),
    corporateOrder: singleton({
      label: "Corporate 表示順",
      path: "content/corporate/order",
      format: { data: "yaml" },
      schema: orderSchema("corporate"),
    }),
    weddingOrder: singleton({
      label: "Wedding 表示順",
      path: "content/wedding/order",
      format: { data: "yaml" },
      schema: orderSchema("wedding"),
    }),
  },
});
