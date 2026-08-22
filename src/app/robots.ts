import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo/profile";

/**
 * /robots.txt
 *
 * Главное здесь — явное разрешение для краулеров ИИ-поисковиков. По умолчанию
 * robots.txt их не упоминает, и часть площадок (а также правила на CDN) трактует
 * молчание как запрет: сайт просто не попадает в ответы ChatGPT, Perplexity и
 * Gemini. Поэтому каждый агент перечислен поимённо.
 *
 * Закрыты только `/admin` и `/api`: админка и роуты, которые тратят деньги на
 * OpenRouter и пишут в базу.
 */

/**
 * Классические поисковики. `User-agent: *` их и так покрывает, но Яндекс
 * читает свою секцию приоритетно, и явное правило снимает разночтения — а
 * заодно видно, что робот не забыт.
 */
const SEARCH_CRAWLERS = ["Googlebot", "Yandex", "YandexBot"];

/** Краулеры, которым важно явно сказать «можно». */
const AI_CRAWLERS = [
  // OpenAI: обучение, переходы по ссылке из чата, поисковый индекс
  "GPTBot",
  "ChatGPT-User",
  "OAI-SearchBot",
  // Anthropic (Claude)
  "ClaudeBot",
  "Claude-User",
  "Claude-SearchBot",
  "anthropic-ai",
  // Perplexity
  "PerplexityBot",
  "Perplexity-User",
  // Google: AI Overviews и Gemini берут контент только при Google-Extended
  "Google-Extended",
  "GoogleOther",
  // Microsoft Copilot ходит через индекс Bing
  "Bingbot",
  // Apple Intelligence
  "Applebot",
  "Applebot-Extended",
  // Meta AI, Amazon, Common Crawl (на нём учится часть моделей), Cohere
  "Meta-ExternalAgent",
  "Amazonbot",
  "CCBot",
  "cohere-ai",
];

const DISALLOW = ["/admin", "/api/"];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: DISALLOW },
      ...[...SEARCH_CRAWLERS, ...AI_CRAWLERS].map((userAgent) => ({
        userAgent,
        allow: "/",
        disallow: DISALLOW,
      })),
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
