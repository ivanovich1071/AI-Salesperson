#!/usr/bin/env node
/**
 * GEO-аудит: видит ли сайт ИИ-поисковик.
 *
 * Проверяет то, на что смотрят краулеры ChatGPT, Perplexity, Claude, Gemini и
 * Copilot: пускает ли их robots.txt, есть ли машиночитаемая идентичность
 * (llms.txt, identity.json, ai.json), размечены ли страницы Schema.org и
 * закрывает ли сайт прямые вопросы пользователей (FAQPage).
 *
 * Запуск:
 *   node scripts/geo-audit.mjs                      # http://127.0.0.1:3100
 *   node scripts/geo-audit.mjs https://vibemind.by
 *   node scripts/geo-audit.mjs https://vibemind.by --min-score 80
 *
 * Код возврата 1, если набранный балл ниже порога (--min-score, по умолчанию 0).
 * Внешних зависимостей нет: только Node 18+ (встроенный fetch).
 */

const args = process.argv.slice(2);
const base = (args.find((a) => !a.startsWith("--")) ?? "http://127.0.0.1:3100").replace(/\/$/, "");
const minScoreIdx = args.indexOf("--min-score");
const minScore = minScoreIdx >= 0 ? Number(args[minScoreIdx + 1]) : 0;

/** Краулеры, отсутствие которых в robots.txt на практике стоит трафика. */
const AI_AGENTS = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "PerplexityBot",
  "Google-Extended",
  "Bingbot",
  "Applebot",
  "CCBot",
];

const checks = [];
/** @param {string} area @param {string} name @param {boolean} ok @param {string} note @param {number} weight */
const add = (area, name, ok, note = "", weight = 1) =>
  checks.push({ area, name, ok, note, weight });

async function get(path) {
  try {
    const res = await fetch(`${base}${path}`, {
      redirect: "follow",
      headers: { "User-Agent": "geo-audit/1.0 (+local)" },
    });
    return { ok: res.ok, status: res.status, text: res.ok ? await res.text() : "" };
  } catch (e) {
    return { ok: false, status: 0, text: "", error: String(e) };
  }
}

/** Вытаскивает все блоки JSON-LD со страницы. */
function extractJsonLd(html) {
  const out = [];
  const re = /<script[^>]+application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi;
  let m;
  while ((m = re.exec(html))) {
    try {
      out.push(JSON.parse(m[1].replace(/\\u003c/g, "<")));
    } catch {
      out.push(null); // битый JSON — тоже результат, отметим ниже
    }
  }
  return out;
}

/** Собирает множество @type из @graph и вложенных узлов. */
function typesOf(blocks) {
  const types = new Set();
  const walk = (node) => {
    if (!node || typeof node !== "object") return;
    if (Array.isArray(node)) return node.forEach(walk);
    if (typeof node["@type"] === "string") types.add(node["@type"]);
    if (Array.isArray(node["@type"])) node["@type"].forEach((t) => types.add(t));
    Object.values(node).forEach(walk);
  };
  blocks.forEach(walk);
  return types;
}

async function main() {
  console.log(`\nGEO-аудит: ${base}\n${"─".repeat(60)}`);

  // ---------- 1. Доступ для краулеров ----------
  const robots = await get("/robots.txt");
  add("Доступ", "robots.txt отдаётся", robots.ok, `HTTP ${robots.status}`, 2);
  if (robots.ok) {
    const txt = robots.text;
    const named = AI_AGENTS.filter((a) => new RegExp(`User-agent:\\s*${a}`, "i").test(txt));
    add(
      "Доступ",
      "AI-краулеры названы поимённо",
      named.length >= AI_AGENTS.length - 1,
      `найдено ${named.length} из ${AI_AGENTS.length}${
        named.length < AI_AGENTS.length
          ? `; нет: ${AI_AGENTS.filter((a) => !named.includes(a)).join(", ")}`
          : ""
      }`,
      2
    );
    add(
      "Доступ",
      "нет полного запрета (Disallow: /)",
      !/^\s*Disallow:\s*\/\s*$/im.test(txt),
      "",
      3
    );
    add("Доступ", "указан sitemap", /Sitemap:/i.test(txt), "", 1);
  }

  const sitemap = await get("/sitemap.xml");
  const urlCount = (sitemap.text.match(/<loc>/g) ?? []).length;
  add("Доступ", "sitemap.xml отдаётся", sitemap.ok && urlCount > 0, `URL: ${urlCount}`, 2);

  // NEXT_PUBLIC_SITE_URL подставляется на сборке: если на сервере он не задан
  // или остался localhost, sitemap, canonical и JSON-LD уводят краулера в никуда
  if (sitemap.ok && urlCount > 0) {
    const firstLoc = (sitemap.text.match(/<loc>([^<]+)<\/loc>/) ?? [])[1] ?? "";
    const sameHost = (() => {
      try {
        return new URL(firstLoc).host === new URL(base).host;
      } catch {
        return false;
      }
    })();
    add("Доступ", "адреса в sitemap ведут на этот же домен", sameHost, firstLoc, 3);
  }

  // ---------- 2. Машиночитаемая идентичность ----------
  const llms = await get("/llms.txt");
  add("Идентичность", "llms.txt", llms.ok && llms.text.includes("#"), `HTTP ${llms.status}`, 3);

  const llmsFull = await get("/llms-full.txt");
  add("Идентичность", "llms-full.txt", llmsFull.ok, `HTTP ${llmsFull.status}`, 1);

  const identity = await get("/identity.json");
  let identityOk = false;
  try {
    const j = JSON.parse(identity.text);
    identityOk = Boolean(j["@context"] || j.identity);
  } catch {
    /* невалидный JSON — ниже отметится как провал */
  }
  add("Идентичность", "identity.json валиден", identity.ok && identityOk, `HTTP ${identity.status}`, 2);

  const aiJson = await get("/ai.json");
  add("Идентичность", "ai.json", aiJson.ok, `HTTP ${aiJson.status}`, 1);

  const wellKnown = await get("/.well-known/ai.txt");
  add("Идентичность", "/.well-known/ai.txt", wellKnown.ok, `HTTP ${wellKnown.status}`, 1);

  // ---------- 3. Разметка главной ----------
  const home = await get("/");
  if (!home.ok) {
    add("Разметка", "главная открывается", false, `HTTP ${home.status}`, 3);
  } else {
    const html = home.text;
    const ld = extractJsonLd(html);
    const types = typesOf(ld);

    add("Разметка", "есть <title>", /<title[^>]*>[^<]{10,}/i.test(html), "", 1);
    add(
      "Разметка",
      "есть meta description",
      /<meta[^>]+name="description"[^>]+content="[^"]{50,}"/i.test(html),
      "",
      2
    );
    add("Разметка", "есть canonical", /rel="canonical"/i.test(html), "", 1);
    add("Разметка", "есть og:title/og:description", /property="og:title"/i.test(html), "", 1);
    add("Разметка", "есть og:image", /property="og:image"/i.test(html), "", 1);
    // Иконку показывают и Google, и Яндекс в выдаче — её отсутствие видно всем
    add("Разметка", "есть favicon", /rel="(shortcut )?icon"/i.test(html), "", 1);
    add("Разметка", "указан lang", /<html[^>]+lang="/i.test(html), "", 1);
    add("Разметка", "ровно один <h1>", (html.match(/<h1/gi) ?? []).length === 1, "", 1);
    add("Разметка", "JSON-LD присутствует", ld.length > 0 && !ld.includes(null), `блоков: ${ld.length}`, 3);
    add("Разметка", "тип Organization", types.has("Organization"), "", 2);
    add("Разметка", "тип WebSite", types.has("WebSite"), "", 1);
    add(
      "Разметка",
      "перечислены услуги (Service/ItemList)",
      types.has("Service") || types.has("ItemList"),
      "",
      1
    );
  }

  // ---------- 4. Цитабельность ----------
  const faq = await get("/faq");
  const faqTypes = faq.ok ? typesOf(extractJsonLd(faq.text)) : new Set();
  add("Цитабельность", "страница /faq", faq.ok, `HTTP ${faq.status}`, 2);
  add("Цитабельность", "разметка FAQPage", faqTypes.has("FAQPage"), "", 2);
  add("Цитабельность", "вопросы размечены (Question)", faqTypes.has("Question"), "", 1);

  const course = await get("/course");
  const courseTypes = course.ok ? typesOf(extractJsonLd(course.text)) : new Set();
  add("Цитабельность", "разметка Course", courseTypes.has("Course"), "", 1);
  add("Цитабельность", "разметка Person (автор)", courseTypes.has("Person"), "", 1);

  // ---------- 5. Классика Google/Yandex по всем страницам ----------
  // Дубли title/description и страницы без h1 — самая частая причина, по которой
  // раздел «висит» в индексе как малоценный. У SPA-страниц h1 обязан быть в HTML
  // до гидратации: Яндекс исполняет JS выборочно.
  const PAGES = ["/", "/course", "/faq", "/app", "/privacy"];
  const meta = [];
  for (const path of PAGES) {
    const res = path === "/" ? home : path === "/course" ? course : path === "/faq" ? faq : await get(path);
    if (!res.ok) {
      meta.push({ path, ok: false });
      continue;
    }
    const title = (res.text.match(/<title[^>]*>([^<]*)<\/title>/i) ?? [])[1] ?? "";
    const desc = (res.text.match(/<meta[^>]+name="description"[^>]+content="([^"]*)"/i) ?? [])[1] ?? "";
    const h1 = (res.text.match(/<h1[\s>]/gi) ?? []).length;
    meta.push({ path, ok: true, title, desc, h1 });
  }
  const live = meta.filter((m) => m.ok);
  const noH1 = live.filter((m) => m.h1 === 0).map((m) => m.path);
  add("Классика", "на каждой странице есть h1 в HTML", noH1.length === 0, noH1.join(", "), 2);

  const dupTitle = live.length - new Set(live.map((m) => m.title)).size;
  add("Классика", "title уникальны", dupTitle === 0, dupTitle ? `дублей: ${dupTitle}` : "", 2);

  const dupDesc = live.length - new Set(live.map((m) => m.desc)).size;
  add("Классика", "description уникальны", dupDesc === 0, dupDesc ? `дублей: ${dupDesc}` : "", 2);

  const longTitle = live.filter((m) => m.title.length > 65).map((m) => m.path);
  add("Классика", "title не обрезается в выдаче (≤65)", longTitle.length === 0, longTitle.join(", "), 1);

  const badDesc = live.filter((m) => m.desc.length < 70 || m.desc.length > 170).map((m) => m.path);
  add("Классика", "description в пределах 70–170 символов", badDesc.length === 0, badDesc.join(", "), 1);

  // ---------- Отчёт ----------
  const byArea = new Map();
  for (const c of checks) {
    if (!byArea.has(c.area)) byArea.set(c.area, []);
    byArea.get(c.area).push(c);
  }

  for (const [area, items] of byArea) {
    console.log(`\n${area}`);
    for (const c of items) {
      const mark = c.ok ? "✓" : "✗";
      console.log(`  ${mark} ${c.name}${c.note ? ` — ${c.note}` : ""}`);
    }
  }

  const total = checks.reduce((s, c) => s + c.weight, 0);
  const earned = checks.reduce((s, c) => s + (c.ok ? c.weight : 0), 0);
  const score = Math.round((earned / total) * 100);
  const failed = checks.filter((c) => !c.ok);

  console.log(`\n${"─".repeat(60)}`);
  console.log(`GEO-score: ${score}/100 (проверок пройдено ${checks.length - failed.length}/${checks.length})`);
  if (failed.length) {
    console.log("\nЧто починить в первую очередь:");
    failed
      .sort((a, b) => b.weight - a.weight)
      .slice(0, 5)
      .forEach((c) => console.log(`  • [${c.area}] ${c.name}${c.note ? ` — ${c.note}` : ""}`));
  }
  console.log("");

  if (score < minScore) {
    console.error(`GEO-score ${score} ниже порога ${minScore}`);
    process.exit(1);
  }
}

main().catch((e) => {
  console.error("Аудит не выполнен:", e);
  process.exit(2);
});
