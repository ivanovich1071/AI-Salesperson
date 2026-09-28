import { buildLlmsFullTxt } from "@/lib/seo/llms";
import { getLabSolutions } from "@/lib/lab/solutions";

/**
 * /llms-full.txt — весь публичный контент сайта одним Markdown-файлом.
 * Нужен, когда ассистенту мало навигации из /llms.txt и он хочет фактуру.
 */
// Кэш на час; правка карточки в админке сбрасывает его сразу (revalidateLabPages).
export const revalidate = 3600;

export async function GET() {
  return new Response(buildLlmsFullTxt(await getLabSolutions()), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
