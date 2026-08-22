import { buildLlmsTxt } from "@/lib/seo/llms";

/**
 * /llms.txt — краткий «паспорт» сайта для языковых моделей (llmstxt.org).
 * Отдаётся статикой: содержимое меняется только вместе со сборкой.
 */
export const dynamic = "force-static";
export const revalidate = 86400;

export function GET() {
  return new Response(buildLlmsTxt(), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
