import { readdir, readFile } from "node:fs/promises";
import { extname, join, relative } from "node:path";

const sourceRoot = join(process.cwd(), "src");
const sourceExtensions = new Set([".ts", ".tsx", ".js", ".jsx"]);
const functionDeclarationPattern =
  /(^|\n)\s*(?:export\s+)?(?:default\s+)?(?:async\s+)?function\s+[A-Za-z_$]/;

const collectSourceFiles = async (directory) => {
  const entries = await readdir(directory, { withFileTypes: true });
  const nestedFiles = await Promise.all(
    entries.map(async (entry) => {
      const path = join(directory, entry.name);
      return entry.isDirectory() ? collectSourceFiles(path) : [path];
    }),
  );

  return nestedFiles
    .flat()
    .filter((path) => sourceExtensions.has(extname(path)));
};

const files = await collectSourceFiles(sourceRoot);
const violations = [];

for (const file of files) {
  const source = await readFile(file, "utf8");
  if (functionDeclarationPattern.test(source))
    violations.push(relative(process.cwd(), file));
}

if (violations.length > 0) {
  console.error(
    `Function declarations are forbidden:\n${violations.join("\n")}`,
  );
  process.exitCode = 1;
}
