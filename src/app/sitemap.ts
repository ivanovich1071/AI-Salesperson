import type { MetadataRoute } from "next";
import { KEY_PAGES, SITE_URL } from "@/lib/seo/profile";

/**
 * /sitemap.xml — список публичных страниц. Указан в robots.txt; с него краулеры
 * ИИ-поисковиков начинают обход и по нему же замечают новые страницы вроде /faq.
 *
 * Приоритеты: главная и курс — вход в воронку, /faq — источник прямых ответов
 * для ИИ, /privacy — обязательная, но неинтересная страница.
 */

const PRIORITY: Record<string, number> = {
  "/": 1,
  "/course": 0.9,
  "/faq": 0.8,
  "/app": 0.7,
  "/privacy": 0.3,
};

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return KEY_PAGES.map((page) => ({
    url: page.url === "/" ? SITE_URL : `${SITE_URL}${page.url}`,
    lastModified,
    changeFrequency: page.url === "/privacy" ? "yearly" : "monthly",
    priority: PRIORITY[page.url] ?? 0.5,
  }));
}
