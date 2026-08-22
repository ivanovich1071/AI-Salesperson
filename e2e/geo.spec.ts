import { test, expect, Page } from "@playwright/test";
import { FAQ } from "../src/lib/seo/faq";

/**
 * Видимость сайта для ИИ-поисковиков (GEO).
 *
 * Эти файлы и разметку никто не открывает глазами, поэтому ломаются они молча:
 * достаточно переименовать роут или поправить robots.txt — и сайт перестаёт
 * попадать в ответы ChatGPT, Perplexity и Gemini, а заметно это станет месяцы
 * спустя по упавшим заявкам. Тест ловит поломку сразу.
 */

/** Собирает типы Schema.org из всех блоков JSON-LD на странице. */
async function schemaTypes(page: Page): Promise<string[]> {
  return page.$$eval('script[type="application/ld+json"]', (nodes) => {
    const types: string[] = [];
    const walk = (node: unknown): void => {
      if (!node || typeof node !== "object") return;
      if (Array.isArray(node)) return node.forEach(walk);
      const rec = node as Record<string, unknown>;
      if (typeof rec["@type"] === "string") types.push(rec["@type"] as string);
      if (Array.isArray(rec["@type"])) types.push(...(rec["@type"] as string[]));
      Object.values(rec).forEach(walk);
    };
    for (const n of nodes) {
      // Битый JSON здесь важнее молчаливого пропуска — пусть тест упадёт
      walk(JSON.parse(n.textContent ?? "null"));
    }
    return types;
  });
}

test.describe("Файлы для ИИ-поисковиков", () => {
  test("robots.txt пускает краулеров ИИ и закрывает админку", async ({ request }) => {
    const res = await request.get("/robots.txt");
    expect(res.status()).toBe(200);
    const body = await res.text();

    for (const agent of ["GPTBot", "ClaudeBot", "PerplexityBot", "Google-Extended", "Bingbot"]) {
      expect(body, `нет правила для ${agent}`).toContain(`User-Agent: ${agent}`);
    }
    expect(body).toContain("Disallow: /admin");
    expect(body).toMatch(/Sitemap:\s*https?:\/\/\S+\/sitemap\.xml/);
  });

  test("sitemap.xml перечисляет публичные страницы", async ({ request }) => {
    const res = await request.get("/sitemap.xml");
    expect(res.status()).toBe(200);
    const body = await res.text();

    for (const path of ["/course", "/faq", "/app", "/privacy"]) {
      expect(body, `нет ${path}`).toContain(`${path}<`);
    }
  });

  test("llms.txt описывает компанию и ведёт к остальным источникам", async ({ request }) => {
    const res = await request.get("/llms.txt");
    expect(res.status()).toBe(200);
    expect(res.headers()["content-type"]).toContain("text/plain");

    const body = await res.text();
    expect(body).toContain("ВайбМайнд");
    expect(body).toContain("+375 29 7-200-700");
    expect(body).toContain("/llms-full.txt");
    expect(body).toContain("/identity.json");
  });

  test("llms-full.txt содержит программу курса и решения", async ({ request }) => {
    const body = await (await request.get("/llms-full.txt")).text();
    expect(body).toContain("Вероника Николаевна Пунчик");
    expect(body).toContain("Б1");
    expect(body).toContain("Retail Scout");
  });

  test("identity.json — валидный Schema.org", async ({ request }) => {
    const res = await request.get("/identity.json");
    expect(res.status()).toBe(200);

    const json = await res.json();
    expect(json["@context"]).toBe("https://schema.org");
    expect(JSON.stringify(json["@graph"])).toContain("Organization");
    expect(json.identity.url).toMatch(/^https?:\/\//);
  });

  test("ai.json объясняет правила использования контента", async ({ request }) => {
    const json = await (await request.get("/ai.json")).json();
    expect(json.attribution.required).toBe(true);
    expect(Array.isArray(json.constraints)).toBe(true);
    expect(json.constraints.join(" ")).toContain("стоимость");
  });

  test("/.well-known/ai.txt отдаётся текстом", async ({ request }) => {
    const res = await request.get("/.well-known/ai.txt");
    expect(res.status()).toBe(200);
    expect(await res.text()).toContain("AI usage policy");
  });
});

test.describe("Разметка Schema.org", () => {
  test("главная: организация, сайт и перечень решений", async ({ page }) => {
    await page.goto("/");
    const types = await schemaTypes(page);
    expect(types).toContain("Organization");
    expect(types).toContain("WebSite");
    expect(types).toContain("ItemList");
  });

  test("курс: программа и автор", async ({ page }) => {
    await page.goto("/course");
    const types = await schemaTypes(page);
    expect(types).toContain("Course");
    expect(types).toContain("Person");
    expect(types).toContain("BreadcrumbList");
  });

  test("faq: все вопросы размечены и видны в HTML", async ({ page }) => {
    await page.goto("/faq");

    const types = await schemaTypes(page);
    expect(types).toContain("FAQPage");

    const questions = await page.$$eval('script[type="application/ld+json"]', (nodes) => {
      for (const n of nodes) {
        const data = JSON.parse(n.textContent ?? "null");
        const graph = data?.["@graph"] ?? [data];
        const faq = graph.find((g: { "@type"?: string }) => g?.["@type"] === "FAQPage");
        if (faq) return faq.mainEntity.map((q: { name: string }) => q.name);
      }
      return [];
    });

    expect(questions).toHaveLength(FAQ.length);

    // Разметка без видимого текста — прямой путь под санкции и в игнор моделей
    for (const item of FAQ) {
      await expect(page.getByText(item.q, { exact: false }).first()).toBeVisible();
    }
  });
});
