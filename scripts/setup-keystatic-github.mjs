/**
 * Keystatic GitHub モード用の GitHub App を対話式で作るセットアップスクリプト。
 * 実行: `node scripts/setup-keystatic-github.mjs`(自分のPCで。サーバー上ではない)
 *
 * GitHub の App Manifest フローを使う: ブラウザが1回開くので、ログインして
 * 確認ボタンを押すだけで、権限(Contents: Read & Write)や Callback URL が
 * 設定済みの App が作られ、必要な環境変数一式がターミナルに表示される。
 *
 * リポジトリは git remote から自動検出するので、プロジェクトを移譲された
 * 新しいオーナーもそのまま再実行できる(新しい App が自分のアカウントに作られる)。
 */
import { execFileSync, spawn } from "node:child_process";
import { randomBytes, randomUUID } from "node:crypto";
import { appendFileSync, existsSync } from "node:fs";
import { createServer } from "node:http";
import { createInterface } from "node:readline/promises";
import { fileURLToPath } from "node:url";

// keystatic.config.ts のフォールバックと同じ値。検出したリポジトリが
// これと違う場合は NEXT_PUBLIC_KEYSTATIC_GITHUB_REPO の設定を案内する
const DEFAULT_REPO = "hasesho05/mei-portfolio-next";

const rl = createInterface({ input: process.stdin, output: process.stdout });
// readline は生モードで Ctrl+C を握るため、明示しないと中断できなくなる
rl.on("SIGINT", () => process.exit(130));
const ask = async (question, fallback) => {
  const answer = (await rl.question(question)).trim();
  return answer === "" ? fallback : answer;
};

const detectRepo = () => {
  try {
    const url = execFileSync("git", ["remote", "get-url", "origin"], {
      encoding: "utf8",
    }).trim();
    const match = url.match(/github\.com[/:]([^/]+)\/([^/]+?)(?:\.git)?$/);
    if (match) return `${match[1]}/${match[2]}`;
  } catch {
    // git がない・remote がない場合は聞く
  }
  return null;
};

const openBrowser = (url) => {
  const command =
    process.platform === "darwin"
      ? ["open", url]
      : process.platform === "win32"
        ? ["cmd", "/c", "start", "", url]
        : ["xdg-open", url];
  try {
    const child = spawn(command[0], command.slice(1), {
      stdio: "ignore",
      detached: true,
    });
    // コマンドが無い環境(WSL 等)の ENOENT は error イベントで届く。
    // 開けなければ URL を手で開いてもらうだけなので握りつぶす
    child.on("error", () => {});
    child.unref();
  } catch {
    // 同期エラーも同様に無視
  }
};

console.log("Keystatic GitHub モードのセットアップを始めます。\n");

const repo =
  detectRepo() ??
  (await ask("リポジトリ(owner/name)を入力してください: ", null));
if (!repo?.includes("/")) {
  console.error("リポジトリを owner/name の形式で指定してください");
  process.exit(1);
}
console.log(`対象リポジトリ: ${repo}`);
const repoName = repo.split("/")[1];

const siteInput = await ask(
  "\n本番サイトのドメインを入力してください(例: mei-portfolio.vercel.app): ",
  null,
);
if (!siteInput) {
  console.error("ドメインは必須です(Callback URL に使います)");
  process.exit(1);
}
const siteUrl = /^https?:\/\//.test(siteInput)
  ? siteInput.replace(/\/$/, "")
  : `https://${siteInput.replace(/\/$/, "")}`;

const orgInput = await ask(
  "\nApp を Organization に作る場合はその名前を、個人アカウントに作る場合は空のまま Enter: ",
  "",
);
const appName = await ask(
  `\nApp の名前(Enter で「${repoName}-admin」): `,
  `${repoName}-admin`,
);

const state = randomUUID();
const manifest = (port) => ({
  name: appName,
  url: siteUrl,
  redirect_url: `http://127.0.0.1:${port}/callback`,
  callback_urls: [
    `${siteUrl}/api/keystatic/github/oauth/callback`,
    "http://127.0.0.1:3000/api/keystatic/github/oauth/callback",
  ],
  public: false,
  default_permissions: { contents: "write" },
});

const newAppUrl =
  orgInput === ""
    ? "https://github.com/settings/apps/new"
    : `https://github.com/organizations/${orgInput}/settings/apps/new`;

// ブラウザに開かせるページ。GitHub へ manifest を POST するフォームを自動送信する
const formPage = (port) => `<!doctype html>
<meta charset="utf-8"><title>GitHub App セットアップ</title>
<body>
  <p>GitHub に移動します…(移動しない場合はボタンを押してください)</p>
  <form id="f" method="post" action="${newAppUrl}?state=${state}">
    <input type="hidden" name="manifest" value='${JSON.stringify(manifest(port)).replaceAll("'", "&#39;")}'>
    <button type="submit">GitHub で App を作成する</button>
  </form>
  <script>document.getElementById("f").submit();</script>
</body>`;

const exchangeCode = async (code) => {
  const response = await fetch(
    `https://api.github.com/app-manifests/${code}/conversions`,
    { method: "POST", headers: { accept: "application/vnd.github+json" } },
  );
  if (!response.ok)
    throw new Error(`GitHub API が ${response.status} を返しました`);
  return response.json();
};

const app = await new Promise((resolve, reject) => {
  const server = createServer(async (request, response) => {
    const url = new URL(request.url, "http://127.0.0.1");
    if (url.pathname === "/") {
      response.writeHead(200, { "content-type": "text/html; charset=utf-8" });
      response.end(formPage(server.address().port));
      return;
    }
    if (url.pathname === "/callback") {
      if (url.searchParams.get("state") !== state) {
        response.writeHead(400).end("state mismatch");
        return;
      }
      try {
        const created = await exchangeCode(url.searchParams.get("code"));
        response.writeHead(200, {
          "content-type": "text/html; charset=utf-8",
        });
        response.end(
          "<!doctype html><meta charset='utf-8'><p>App を作成しました。ターミナルに戻ってください。</p>",
        );
        server.close();
        resolve(created);
      } catch (cause) {
        response.writeHead(500).end("failed");
        server.close();
        reject(cause);
      }
      return;
    }
    response.writeHead(404).end();
  });
  server.listen(0, "127.0.0.1", () => {
    const startUrl = `http://127.0.0.1:${server.address().port}/`;
    console.log(
      `\nブラウザを開きます。GitHub にログインして確認ボタンを押してください:\n  ${startUrl}\n`,
    );
    openBrowser(startUrl);
  });
}).catch((cause) => {
  console.error(`\n✗ App の作成に失敗しました: ${cause.message}`);
  console.error(
    "  もう一度実行するか、docs/keystatic-github-setup.md の手動手順で作成してください",
  );
  process.exit(1);
});

const keystaticSecret = randomBytes(32).toString("hex");
const envVars = [
  ["KEYSTATIC_GITHUB_CLIENT_ID", app.client_id],
  ["KEYSTATIC_GITHUB_CLIENT_SECRET", app.client_secret],
  ["KEYSTATIC_SECRET", keystaticSecret],
  ["NEXT_PUBLIC_KEYSTATIC_GITHUB_APP_SLUG", app.slug],
  ...(repo === DEFAULT_REPO
    ? []
    : [["NEXT_PUBLIC_KEYSTATIC_GITHUB_REPO", repo]]),
];

console.log(`✓ GitHub App「${app.slug}」を作成しました: ${app.html_url}\n`);
console.log("必要な環境変数:\n");
for (const [name, value] of envVars) console.log(`${name}=${value}`);

const writeEnv = await ask(
  "\nこの内容をローカル確認用に .env へ追記しますか?(.env は gitignore 済み) [y/N]: ",
  "n",
);
if (writeEnv.toLowerCase().startsWith("y")) {
  // どこから実行されても、リポジトリルート(scripts/ の1つ上)の .env に書く
  const envPath = fileURLToPath(new URL("../.env", import.meta.url));
  const lines = envVars.map(([name, value]) => `${name}=${value}`).join("\n");
  appendFileSync(envPath, `${existsSync(envPath) ? "\n" : ""}${lines}\n`);
  console.log(`✓ ${envPath} に追記しました(コミットしないでください)`);
} else {
  console.log(
    "スキップしました(ローカルで GitHub モードを試すときは .env に上記4行を書いてください)",
  );
}

console.log(`\n残りの手順:

1. App をリポジトリにインストールする(ブラウザが開きます):
     ${app.html_url}/installations/new
   「Only select repositories」で ${repo} だけを選ぶ

2. Vercel に環境変数を設定して再デプロイする(コマンド実行後に上の値を
   貼り付ける。値を引数に書かないのはシェル履歴に残さないため):
${envVars.map(([name]) => `     vercel env add ${name} production`).join("\n")}
     vercel --prod

3. ${siteUrl}/keystatic を開き、GitHub ログイン → 編集 → 保存で
   コミットが積まれることを確認する
`);
openBrowser(`${app.html_url}/installations/new`);
rl.close();
