/**
 * content/ 配下の JPEG を「長辺 2000px 以下・1枚 500KB 以下」に正規化する。
 * 既に条件を満たす画像には触れない(冪等)。手動実行: `pnpm optimize-images`。
 *
 * 処理するときは EXIF の向き(Orientation)を反映してから縮小するので、
 * 写真が横倒しになることはない。JPEG 以外の画像(PNG 等)は自動変換せず、
 * JPEG で書き出し直すようエラーで案内する(サイトは JPEG のみ)。
 */
import { rename, stat, unlink, writeFile } from "node:fs/promises";
import { extname, join, relative } from "node:path";
import sharp from "sharp";
import {
  DATA_EXTENSIONS,
  JPEG_EXTENSIONS,
  MAX_IMAGE_BYTES,
  MAX_LONG_EDGE,
  TEMP_EXTENSION,
  walkContentFiles,
} from "./image-limits.mjs";

const root = process.cwd();
const contentDir = join(root, "content");
const kb = (bytes) => `${Math.round(bytes / 1024)}KB`;

const qualitySteps = [82, 74, 66, 58, 50, 42];

/** 向きを反映して長辺を上限内に収めたピクセルから、サイズ上限内の JPEG を作る */
const reencode = async (path) => {
  // デコードと縮小は一度だけ行い、品質の探索は再エンコードのみ繰り返す
  const { data, info } = await sharp(path)
    .rotate() // EXIF の向きを反映してから縮小する(向き情報だけ落ちる事故の防止)
    .resize({
      width: MAX_LONG_EDGE,
      height: MAX_LONG_EDGE,
      fit: "inside",
      withoutEnlargement: true,
    })
    .raw()
    .toBuffer({ resolveWithObject: true });
  const pixels = {
    raw: { width: info.width, height: info.height, channels: info.channels },
  };
  for (const quality of qualitySteps) {
    const buffer = await sharp(data, pixels)
      .jpeg({ quality, mozjpeg: true })
      .toBuffer();
    if (buffer.length <= MAX_IMAGE_BYTES) return buffer;
  }
  return null;
};

const files = await walkContentFiles(contentDir);
const errors = [];
const converted = [];
let skipped = 0;

for (const path of files) {
  const label = relative(root, path);
  const ext = extname(path).toLowerCase();

  // 中断で残った一時ファイルは元画像が無事なので捨てる
  if (ext === TEMP_EXTENSION) {
    await unlink(path);
    console.log(`  ${label} (処理途中の一時ファイル)を削除しました`);
    continue;
  }
  if (DATA_EXTENSIONS.includes(ext)) continue;
  if (!JPEG_EXTENSIONS.includes(ext)) {
    errors.push(
      `${label} は JPEG ではありません。JPEG(.jpg)で書き出し直して置き換えてください`,
    );
    continue;
  }

  try {
    const before = (await stat(path)).size;
    const metadata = await sharp(path).metadata();
    const longEdge = Math.max(metadata.width ?? 0, metadata.height ?? 0);
    if (before <= MAX_IMAGE_BYTES && longEdge <= MAX_LONG_EDGE) {
      skipped += 1;
      continue;
    }

    const buffer = await reencode(path);
    if (buffer === null) {
      errors.push(
        `${label} を ${kb(MAX_IMAGE_BYTES)} 以下にできませんでした(元画像を確認してください)`,
      );
      continue;
    }
    // 書き込み途中で落ちても元画像が壊れないよう、一時ファイル経由で置き換える
    const tempPath = `${path}${TEMP_EXTENSION}`;
    await writeFile(tempPath, buffer);
    await rename(tempPath, path);
    converted.push(`  ${label}: ${kb(before)} → ${kb(buffer.length)}`);
  } catch (cause) {
    errors.push(
      `${label} が画像として読み取れません(壊れている可能性があります): ${cause.message}`,
    );
  }
}

if (converted.length > 0) {
  console.log(`✓ ${converted.length}枚を変換しました:`);
  for (const line of converted) console.log(line);
}
console.log(
  `✓ ${skipped}枚は基準内のためそのまま(長辺${MAX_LONG_EDGE}px以下・${kb(MAX_IMAGE_BYTES)}以下)`,
);

if (errors.length > 0) {
  console.error("\n次の画像は自動で直せませんでした:\n");
  for (const message of errors) console.error(`  ✗ ${message}`);
  process.exit(1);
}
