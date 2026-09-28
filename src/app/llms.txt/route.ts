import { buildLlmsTxt } from "@/lib/seo/llms";
import { getLabSolutions } from "@/lib/lab/solutions";

/**
 * /llms.txt — краткий «паспорт» сайта для языковых моделей (llmstxt.org).
 * Карточки «Лаборатории решений» берутся из базы.
 */
// Кэш на час; правка карточки в админке сбрасывает его сразу (revalidateLabPages).
export const revalidate = 3600;

export async function GET() {
  return new Response(buildLlmsTxt(await getLabSolutions()), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
