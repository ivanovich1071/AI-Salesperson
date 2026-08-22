import { graph, organizationLd, personLd, websiteLd } from "@/lib/seo/jsonLd";
import { COURSE, ORG, SITE_URL } from "@/lib/seo/profile";

/**
 * /identity.json — каноничная карточка организации в машиночитаемом виде.
 *
 * Зачем отдельным файлом, если та же разметка есть на страницах: краулеру
 * ИИ-поисковика не нужно рендерить React, чтобы понять, кто мы. Файл лежит по
 * предсказуемому адресу, указан в /llms.txt и совместим со Schema.org —
 * поэтому его одинаково поймут и агент, и валидатор разметки.
 */
export const dynamic = "force-static";
export const revalidate = 86400;

export function GET() {
  const body = {
    ...graph(organizationLd(), websiteLd(), personLd()),
    // Дубли ключевых полей на верхнем уровне: простые парсеры не ходят в @graph
    identity: {
      name: ORG.name,
      alternateNames: ORG.alternateNames,
      url: SITE_URL,
      description: ORG.description,
      country: ORG.foundingCountry,
      languages: ORG.languages,
      contact: {
        phone: ORG.phone,
        telegram: ORG.telegram,
      },
      flagshipProduct: {
        name: COURSE.name,
        url: `${SITE_URL}${COURSE.url}`,
      },
      canonicalSources: [
        `${SITE_URL}/llms.txt`,
        `${SITE_URL}/llms-full.txt`,
        `${SITE_URL}/faq`,
        `${SITE_URL}/sitemap.xml`,
      ],
      updated: new Date().toISOString().slice(0, 10),
    },
  };

  return Response.json(body, {
    headers: { "Cache-Control": "public, max-age=3600, s-maxage=86400" },
  });
}
