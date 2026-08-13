import { NextRequest, NextResponse } from "next/server";
import * as cheerio from "cheerio";
import { safeFetchHtml } from "@/lib/safeFetch";

export const runtime = "nodejs";

const MAX_TEXT_LENGTH = 6000;

/**
 * POST /api/parse-site { url }
 * Пытается скачать сайт компании и извлечь текст (cheerio, очистка от script/style).
 * При любой ошибке возвращает мягкий фолбэк (ok: false) — процесс продолжается.
 *
 * Адрес приходит от пользователя, поэтому запрос идёт через safeFetchHtml:
 * схема, приватные диапазоны, редиректы и размер ответа проверяются там.
 */
export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();
    if (!url || typeof url !== "string") {
      return NextResponse.json({ ok: false, text: "" });
    }

    const normalized = url.startsWith("http") ? url : `https://${url}`;
    const html = await safeFetchHtml(normalized);

    const $ = cheerio.load(html);
    $("script, style, noscript, svg, iframe, nav, footer").remove();
    const text = $("body").text().replace(/\s+/g, " ").trim();

    if (text.length < 100) {
      // SPA или пустая страница — считаем, что анализ не удался
      return NextResponse.json({ ok: false, text: "" });
    }

    return NextResponse.json({ ok: true, text: text.slice(0, MAX_TEXT_LENGTH) });
  } catch {
    return NextResponse.json({ ok: false, text: "" });
  }
}
