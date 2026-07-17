import { NextRequest, NextResponse } from "next/server";
import * as cheerio from "cheerio";

export const runtime = "nodejs";

const MAX_TEXT_LENGTH = 6000;

/**
 * POST /api/parse-site { url }
 * Пытается скачать сайт компании и извлечь текст (cheerio, очистка от script/style).
 * При любой ошибке возвращает мягкий фолбэк (ok: false) — процесс продолжается.
 */
export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();
    if (!url || typeof url !== "string") {
      return NextResponse.json({ ok: false, text: "" });
    }

    const normalized = url.startsWith("http") ? url : `https://${url}`;

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 10_000);
    const res = await fetch(normalized, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36",
      },
    });
    clearTimeout(timer);

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const html = await res.text();
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
