import { isKeystaticGithubConfigured } from "@/lib/keystatic-mode";

// Admin UI と同じ条件で本番を 404 にする(GitHub モード未構成の本番では
// ローカルモードの書き込みが永続しない)。Keystatic のハンドラーは import() で
// 遅延構築し、404 になるビルドが Admin の依存グラフを抱え込まないようにする。
let cachedHandler: Promise<{
  GET: (request: Request) => Promise<Response>;
  POST: (request: Request) => Promise<Response>;
}> | null = null;

const loadHandler = () => {
  cachedHandler ??= Promise.all([
    import("@keystatic/next/route-handler"),
    import("../../../../../keystatic.config"),
  ]).then(([{ makeRouteHandler }, { default: keystaticConfig }]) =>
    makeRouteHandler({ config: keystaticConfig }),
  );
  return cachedHandler;
};

const respond = async (request: Request) => {
  if (process.env.NODE_ENV === "production" && !isKeystaticGithubConfigured())
    return new Response(null, { status: 404 });
  const handler = await loadHandler();
  return (request.method === "POST" ? handler.POST : handler.GET)(request);
};

export const GET = respond;
export const POST = respond;
