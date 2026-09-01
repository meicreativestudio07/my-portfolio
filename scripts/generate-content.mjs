/**
 * content/ ディレクトリを検証し、型付きのデータモジュール(*.generated.ts)を
 * 生成する。dev / build / check の前に自動で走る。手動実行は `pnpm generate`。
 *
 * content/ の構造(Keystatic 互換レイアウト):
 *   portfolio/order.yaml + <slug>/index.yaml + thumbnail.jpg (+ 連番画像)
 *   corporate/section.yaml + order.yaml + <slug>/index.yaml + 01..03.jpg (+ hover.jpg)
 *   wedding/   同上
 *
 * 非エンジニアが編集する前提なので、エラーは日本語で・全部まとめて報告する。
 */
import {
  access,
  mkdir,
  readdir,
  readFile,
  stat,
  writeFile,
} from "node:fs/promises";
import { dirname, extname, join, posix, relative, sep } from "node:path";
import { parse } from "yaml";
import {
  DATA_EXTENSIONS,
  JPEG_EXTENSIONS,
  MAX_IMAGE_BYTES,
  ORIGINAL_IMAGE_BYTES,
  walkContentFiles,
} from "./image-limits.mjs";

const root = process.cwd();
const contentDir = join(root, "content");
const errors = [];

const report = (message) => errors.push(message);

// エラーが1件でもあれば何も書き込まない。起動中の dev サーバーが
// 不完全な生成結果を拾って落ちるのを防ぐため、書き込みは最後にまとめて行う。
const pendingWrites = [];
const queueWrite = (path, content) => pendingWrites.push([path, content]);

const exists = async (path) => {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
};

const readYaml = async (path) => {
  const label = relative(root, path);
  if (!(await exists(path))) {
    report(`${label} がありません`);
    return null;
  }
  try {
    const data = parse(await readFile(path, "utf8"));
    if (data === null || data === undefined) {
      report(`${label} が空です(中身を書いてください)`);
      return null;
    }
    if (typeof data !== "object" || Array.isArray(data)) {
      report(
        `${label} の形式が正しくありません(YAMLの書き方を確認してください)`,
      );
      return null;
    }
    return data;
  } catch (cause) {
    report(
      `${label} が読み取れません(YAMLの書き方を確認してください): ${cause.message}`,
    );
    return null;
  }
};

const readOrder = async (sectionDir) => {
  const orderPath = join(sectionDir, "order.yaml");
  const label = relative(root, orderPath);
  if (!(await exists(orderPath))) {
    report(
      `${label} がありません(items: の下にフォルダ名を表示順で並べてください)`,
    );
    return [];
  }
  const data = await readYaml(orderPath);
  if (data === null) return [];
  if (!Array.isArray(data.items)) {
    report(`${label} に items(フォルダ名の一覧)が書かれていません`);
    return [];
  }
  const lines = [];
  for (const [index, item] of data.items.entries()) {
    if (typeof item !== "string" || item.trim() === "") {
      report(
        `${label} の items ${index + 1}番目がフォルダ名(文字列)ではありません(数字だけの名前は "2024" のように引用符で囲んでください)`,
      );
      continue;
    }
    lines.push(item.trim());
  }

  const folders = (await readdir(sectionDir, { withFileTypes: true }))
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);

  for (const slug of lines) {
    if (!folders.includes(slug))
      report(
        `${label} に「${slug}」とありますが、フォルダ ${relative(root, join(sectionDir, slug))} がありません`,
      );
  }
  for (const folder of folders) {
    if (!lines.includes(folder))
      report(
        `フォルダ ${relative(root, join(sectionDir, folder))} が ${label} に載っていません(載せないと表示されません)`,
      );
  }
  const seen = new Set();
  for (const slug of lines) {
    if (seen.has(slug)) report(`${label} に「${slug}」が2回書かれています`);
    seen.add(slug);
  }
  return lines.filter((slug) => folders.includes(slug));
};

const requireString = (value, label) => {
  if (typeof value === "number") return String(value);
  if (typeof value !== "string" || value.trim() === "") {
    report(`${label} が書かれていません`);
    return "";
  }
  return value;
};

const requireImage = async (workDir, file, label, missingMessage) => {
  if (typeof file !== "string" || file.trim() === "") {
    report(
      missingMessage ?? `${label} の file(画像ファイル名)が書かれていません`,
    );
    return null;
  }
  const path = join(workDir, file);
  if (!(await exists(path))) {
    report(
      `${label} に「${file}」とありますが、${relative(root, path)} がありません`,
    );
    return null;
  }
  return path;
};

/** 生成する import 文と、画像を参照する識別子を採番する。 */
const createImportRegistry = (dataDir) => {
  const imports = [];
  const add = (imagePath) => {
    const name = `image${imports.length}`;
    const importPath = relative(dataDir, imagePath).split(sep).join(posix.sep);
    imports.push(`import ${name} from "${importPath}";`);
    return name;
  };
  return { add, imports };
};

const s = (value) => JSON.stringify(value);

// --- portfolio ------------------------------------------------------------

const generatePortfolio = async () => {
  const sectionDir = join(contentDir, "portfolio");
  const dataDir = join(root, "src/features/work/data");
  const registry = createImportRegistry(dataDir);
  const entries = [];

  for (const slug of await readOrder(sectionDir)) {
    const workDir = join(sectionDir, slug);
    const label = `content/portfolio/${slug}/index.yaml`;
    const data = await readYaml(join(workDir, "index.yaml"));
    if (data === null) continue;

    const thumbnailPath = await requireImage(
      workDir,
      data.thumbnail,
      `${label} の thumbnail`,
      `${label} に thumbnail(サムネイル画像のファイル名)が書かれていません`,
    );
    if (thumbnailPath === null) continue;

    const images = [];
    for (const [index, item] of (data.images ?? []).entries()) {
      const path = await requireImage(
        workDir,
        item?.file,
        `${label} の images ${index + 1}枚目`,
      );
      if (path === null) continue;
      images.push(
        `{ image: ${registry.add(path)}, alt: ${s(requireString(item?.alt, `${label} の images「${item?.file}」の alt`))} }`,
      );
    }

    entries.push(`  {
    slug: ${s(slug)},
    category: ${s(requireString(data.category, `${label} の category`))},
    title: ${s(requireString(data.title, `${label} の title`))},
    client: ${s(requireString(data.client, `${label} の client`))},
    publishedAt: ${s(requireString(data.year, `${label} の year`))},
    thumbnail: {
      image: ${registry.add(thumbnailPath)},
      alt: ${s(requireString(data.thumbnailAlt, `${label} の thumbnailAlt`))},
    },
    images: [${images.join(", ")}],
  },`);
  }

  queueWrite(
    join(dataDir, "works.generated.ts"),
    `// scripts/generate-content.mjs が content/portfolio から自動生成するファイル。
// 直接編集しない。作品の追加・変更は content/ 側で行う。
import type { Work } from "@/features/work/types/work";

${registry.imports.join("\n")}

export const works = [
${entries.join("\n")}
] satisfies readonly Work[];
`,
  );
  return entries.length;
};

// --- corporate / wedding --------------------------------------------------

const generateCommissionCut = async (registry, workDir, item, label) => {
  const path = await requireImage(workDir, item?.file, label);
  if (path === null) return null;
  // Admin(Keystatic)は空の動画URLを null で書くことがあるので undefined と同じ扱い
  const video =
    item?.video === undefined || item?.video === null
      ? null
      : requireString(item.video, `${label} の video`);
  return `{ image: ${registry.add(path)}, alt: ${s(requireString(item?.alt, `${label}(${item?.file})の alt`))}, videoUrl: ${s(video)} }`;
};

const generateCommissions = async (service, exportName) => {
  const sectionDir = join(contentDir, service);
  const dataDir = join(root, "src/features/commission/data");
  const registry = createImportRegistry(dataDir);
  const entries = [];

  for (const slug of await readOrder(sectionDir)) {
    const workDir = join(sectionDir, slug);
    const label = `content/${service}/${slug}/index.yaml`;
    const data = await readYaml(join(workDir, "index.yaml"));
    if (data === null) continue;

    const cutsInput = Array.isArray(data.cuts) ? data.cuts : [];
    if (cutsInput.length !== 3) {
      report(
        `${label} の cuts は必ず3枚です(いまは${cutsInput.length}枚)。レイアウトが3カット前提のため`,
      );
      continue;
    }
    const cuts = [];
    for (const [index, item] of cutsInput.entries()) {
      const cut = await generateCommissionCut(
        registry,
        workDir,
        item,
        `${label} の cuts ${index + 1}枚目`,
      );
      if (cut !== null) cuts.push(cut);
    }
    if (cuts.length !== 3) continue;

    if (
      data.meta !== undefined &&
      data.meta !== null &&
      !Array.isArray(data.meta)
    ) {
      report(
        `${label} の meta の書き方が変わりました。「- label: クライアント」「  value: ◯◯」の一覧にしてください`,
      );
      continue;
    }
    const metaInput = data.meta ?? [];
    const metaItems = metaInput.map((item, index) => {
      const metaLabel = requireString(
        item?.label,
        `${label} の meta ${index + 1}件目の label`,
      );
      return `{ label: ${s(metaLabel)}, value: ${s(requireString(item?.value, `${label} の meta「${metaLabel || index + 1}」の value`))} }`;
    });
    if (metaItems.length === 0)
      report(`${label} に meta(label と value の一覧)が書かれていません`);

    // hover なしの作品を Admin(Keystatic)で保存すると hover: {} が書かれる。
    // file も alt も空のマップだけをホバー写真なしとして扱い、
    // それ以外の書き間違い(文字列など)は従来どおりエラーにする。
    const isBlank = (value) =>
      value === undefined ||
      value === null ||
      (typeof value === "string" && value.trim() === "");
    let hover = null;
    if (data.hover !== undefined && data.hover !== null) {
      if (typeof data.hover !== "object" || Array.isArray(data.hover)) {
        report(
          `${label} の hover の書き方が正しくありません(file と alt を書いてください)`,
        );
      } else if (!(isBlank(data.hover.file) && isBlank(data.hover.alt))) {
        hover = await generateCommissionCut(
          registry,
          workDir,
          data.hover,
          `${label} の hover`,
        );
      }
    }

    entries.push(`  {
    slug: ${s(slug)},
    title: ${s(requireString(data.title, `${label} の title`))},
    metaItems: [${metaItems.join(", ")}],
    cuts: [
      ${cuts.join(",\n      ")},
    ],
    motionFrame: ${hover ?? "null"},
  },`);
  }

  queueWrite(
    join(dataDir, `${service}.generated.ts`),
    `// scripts/generate-content.mjs が content/${service} から自動生成するファイル。
// 直接編集しない。作品の追加・変更は content/ 側で行う。
import type { Commission } from "@/features/commission/types/commission";

${registry.imports.join("\n")}

export const ${exportName} = [
${entries.join("\n")}
] satisfies readonly Commission[];
`,
  );
  return entries.length;
};

// --- section copy ---------------------------------------------------------

const generateSections = async () => {
  const sections = [];
  for (const service of ["corporate", "wedding"]) {
    const label = `content/${service}/section.yaml`;
    const data = await readYaml(join(contentDir, service, "section.yaml"));
    sections.push(
      `  ${service}: {
    title: ${s(requireString(data?.title, `${label} の title`))},
    description: ${s(requireString(data?.description, `${label} の description`))},
    lede: ${s(requireString(data?.lede, `${label} の lede`))},
  },`,
    );
  }
  queueWrite(
    join(root, "src/features/commission/data/sections.generated.ts"),
    `// scripts/generate-content.mjs が content/*/section.yaml から自動生成するファイル。
// 直接編集しない。文言の変更は content/ 側で行う。
import type {
  CommissionSection,
  CommissionService,
} from "@/features/commission/types/commission";

export const commissionSections = {
${sections.join("\n")}
} satisfies Record<CommissionService, CommissionSection>;
`,
  );
};

// --- 画像ファイルの検証 -----------------------------------------------------

// content/ に置けるのは YAML と JPEG だけ。JPEG 以外の画像や想定外のファイルは
// エラーにし(HEIC や RAW の元データが履歴に残るのを防ぐ)、500KB 超の JPEG は
// 警告して pnpm optimize-images を案内、5MB 超はエラーで生成を止める。
const warnings = [];
const validateImageFiles = async () => {
  for (const path of await walkContentFiles(contentDir)) {
    const ext = extname(path).toLowerCase();
    if (DATA_EXTENSIONS.includes(ext)) continue;
    const label = relative(root, path);
    if (!JPEG_EXTENSIONS.includes(ext)) {
      report(
        `${label} は置けないファイルです。写真は JPEG(.jpg)で書き出して入れてください(それ以外のファイルは削除してください)`,
      );
      continue;
    }
    const { size } = await stat(path);
    if (size > ORIGINAL_IMAGE_BYTES) {
      report(
        `${label} が ${Math.round(size / 1024 / 1024)}MB あります。カメラの元データはコミットできません。pnpm optimize-images で自動調整してください`,
      );
    } else if (size > MAX_IMAGE_BYTES) {
      warnings.push(
        `${label} が ${Math.round(size / 1024)}KB あります(目安 ${Math.round(MAX_IMAGE_BYTES / 1024)}KB 以下)。pnpm optimize-images で自動調整できます`,
      );
    }
  }
};

const counts = {
  portfolio: await generatePortfolio(),
  corporate: await generateCommissions("corporate", "corporateCommissions"),
  wedding: await generateCommissions("wedding", "weddingCommissions"),
};
await generateSections();
await validateImageFiles();

if (warnings.length > 0) {
  console.warn("画像サイズの注意:\n");
  for (const message of warnings) console.warn(`  ! ${message}`);
  console.warn();
}

if (errors.length > 0) {
  console.error(
    "コンテンツにエラーがあります。修正してからもう一度実行してください:\n",
  );
  for (const message of errors) console.error(`  ✗ ${message}`);
  console.error();
  process.exit(1);
}

for (const [path, content] of pendingWrites) {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, content);
}

console.log(
  `✓ コンテンツを生成しました — portfolio ${counts.portfolio}件 / corporate ${counts.corporate}件 / wedding ${counts.wedding}件`,
);
