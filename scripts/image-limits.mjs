/**
 * content/ の画像ルールの閾値と共有ヘルパー。ここが唯一の定義場所で、
 * optimize-images(自動修正)と generate-content(検証)の両方が参照する。
 * docs/content-guide.md の記述もこの値に合わせる。
 */
import { readdir } from "node:fs/promises";
import { join } from "node:path";

/** 長辺の上限(px)。超えていたら optimize-images が縮小する */
export const MAX_LONG_EDGE = 2000;

/** 1枚あたりのサイズ上限。超えていたら警告し、optimize-images が圧縮する */
export const MAX_IMAGE_BYTES = 500 * 1024;

/** カメラ元データとみなすサイズ。超えていたら生成をエラーで止める(履歴を守る最後の防波堤) */
export const ORIGINAL_IMAGE_BYTES = 5 * 1024 * 1024;

/** content/ 内で画像として扱う拡張子。サイトの画像は JPEG のみ */
export const JPEG_EXTENSIONS = [".jpg", ".jpeg"];

/** content/ に置いてよいテキストファイルの拡張子 */
export const DATA_EXTENSIONS = [".yaml", ".yml"];

/** optimize-images が置き換え途中に使う一時ファイルの拡張子 */
export const TEMP_EXTENSION = ".optimizing";

/**
 * content/ 配下の全ファイルのパスを返す。ドットファイル(.DS_Store 等)は
 * 検証の対象外として除く。optimize-images と generate-content の両方が使う。
 */
export const walkContentFiles = async (dir) => {
  const files = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (entry.name.startsWith(".")) continue;
    const path = join(dir, entry.name);
    if (entry.isDirectory()) files.push(...(await walkContentFiles(path)));
    else files.push(path);
  }
  return files;
};
