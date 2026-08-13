import { NextRequest, NextResponse } from "next/server";

/**
 * Ограничение частоты запросов к API.
 *
 * Зачем: шесть роутов `/api/ai/**` ходят в OpenRouter за деньги, `/api/bookings`
 * может занять все свободные слоты эксперта, `/api/diagnostics` — засыпать базу.
 * Без лимитов скрипт в двадцать строк выжигает баланс за ночь, а сайт при этом
 * формально «работает».
 *
 * Хранилище — в памяти процесса: сервер один, Redis разворачивать незачем.
 * При перезапуске счётчики обнуляются, и это нормально: защита от вала, а не учёт.
 */

const WINDOW_MS = 60_000;

type Bucket = { count: number; resetAt: number };
const hits = new Map<string, Bucket>();

type Rule = {
  key: string;
  match: (path: string) => boolean;
  /** Запросов в минуту с одного адреса */
  limit: number;
  /** Максимальный размер тела запроса */
  maxBody: number;
};

const JSON_BODY = 100 * 1024;

const RULES: Rule[] = [
  // Whisper: платно и тяжело, аудио приходит файлом
  { key: "transcribe", match: (p) => p.startsWith("/api/transcribe"), limit: 5, maxBody: 5 * 1024 * 1024 },
  // Все обращения к модели
  { key: "ai", match: (p) => p.startsWith("/api/ai/"), limit: 20, maxBody: JSON_BODY },
  // Бронь слота — бот может забрать всё расписание
  { key: "bookings", match: (p) => p.startsWith("/api/bookings"), limit: 5, maxBody: JSON_BODY },
  // Публичный роут, пишет в базу
  { key: "diagnostics", match: (p) => p.startsWith("/api/diagnostics"), limit: 5, maxBody: JSON_BODY },
  // Сервер по этому роуту ходит наружу
  { key: "parse-site", match: (p) => p.startsWith("/api/parse-site"), limit: 10, maxBody: 10 * 1024 },
  // Подбор пароля админки
  { key: "admin-login", match: (p) => p.startsWith("/api/admin/login"), limit: 10, maxBody: JSON_BODY },
];

function clientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}

/** Чистим протухшие записи, чтобы карта не росла бесконечно. */
function sweep(now: number) {
  if (hits.size < 5000) return;
  hits.forEach((bucket, key) => {
    if (bucket.resetAt <= now) hits.delete(key);
  });
}

function tooMany(retryAfterSec: number) {
  return NextResponse.json(
    {
      error:
        "Слишком много запросов подряд. Подождите минуту и попробуйте снова — " +
        "это ограничение защищает сервис от перегрузки.",
    },
    { status: 429, headers: { "Retry-After": String(retryAfterSec) } }
  );
}

export function middleware(req: NextRequest) {
  // E2E-прогон дёргает роуты очередями — лимиты его гарантированно уронят
  if (process.env.RATE_LIMIT_DISABLED === "1") return NextResponse.next();

  const path = req.nextUrl.pathname;
  const rule = RULES.find((r) => r.match(path));
  if (!rule) return NextResponse.next();

  const declared = Number(req.headers.get("content-length") ?? 0);
  if (declared > rule.maxBody) {
    return NextResponse.json(
      { error: "Запрос слишком большой." },
      { status: 413 }
    );
  }

  const now = Date.now();
  sweep(now);

  const key = `${clientIp(req)}:${rule.key}`;
  const bucket = hits.get(key);

  if (!bucket || bucket.resetAt <= now) {
    hits.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return NextResponse.next();
  }

  if (bucket.count >= rule.limit) {
    return tooMany(Math.ceil((bucket.resetAt - now) / 1000));
  }

  bucket.count += 1;
  return NextResponse.next();
}

export const config = {
  matcher: "/api/:path*",
};
