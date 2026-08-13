import dns from "node:dns/promises";

/**
 * Защита от SSRF для роутов, которые ходят по адресу, присланному пользователем.
 *
 * Проблема: форма «Сайт компании» заставляет НАШ сервер сделать запрос. Без проверок
 * туда можно подставить `http://127.0.0.1:3100/api/...`, внутреннюю сеть хостера или
 * служебный адрес облака `169.254.169.254` — и получить ответ обратно в браузер.
 *
 * Работает только в Node-рантайме: нужен резолвер DNS.
 */

const MAX_REDIRECTS = 3;
const MAX_BYTES = 2 * 1024 * 1024;
const TIMEOUT_MS = 10_000;

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36";

function isPrivateV4(ip: string): boolean {
  const parts = ip.split(".").map(Number);
  if (parts.length !== 4 || parts.some((n) => !Number.isInteger(n) || n < 0 || n > 255)) {
    return true; // не разобрали адрес — считаем опасным
  }
  const [a, b] = parts;
  if (a === 0 || a === 10 || a === 127) return true;
  if (a === 169 && b === 254) return true; // link-local: метаданные облачных провайдеров
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 168) return true;
  if (a === 100 && b >= 64 && b <= 127) return true; // CGNAT
  if (a >= 224) return true; // multicast и зарезервированные
  return false;
}

function isPrivateV6(ip: string): boolean {
  const v = ip.toLowerCase().split("%")[0];
  if (v === "::" || v === "::1") return true;
  if (v.startsWith("fe80") || v.startsWith("fc") || v.startsWith("fd")) return true;
  const mapped = v.match(/^::ffff:(\d{1,3}(?:\.\d{1,3}){3})$/);
  if (mapped) return isPrivateV4(mapped[1]);
  return false;
}

/**
 * Проверяет, что адрес внешний и публичный.
 * Бросает исключение, если схема не та или хост резолвится в приватную сеть.
 *
 * Полной защиты от DNS rebinding здесь нет: между проверкой и запросом запись может
 * смениться. Для этого нужно подключаться к уже проверенному IP — избыточно для
 * задачи «прочитать сайт компании».
 */
export async function assertPublicUrl(raw: string): Promise<URL> {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new Error("Некорректный адрес");
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error("Разрешены только http и https");
  }

  const host = url.hostname.replace(/^\[|\]$/g, "");

  // Голый IP в адресе проверяем сразу, без резолвера
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host)) {
    if (isPrivateV4(host)) throw new Error("Внутренние адреса запрещены");
    return url;
  }
  if (host.includes(":")) {
    if (isPrivateV6(host)) throw new Error("Внутренние адреса запрещены");
    return url;
  }
  if (host === "localhost" || host.endsWith(".localhost") || host.endsWith(".internal")) {
    throw new Error("Внутренние адреса запрещены");
  }

  const records = await dns.lookup(host, { all: true });
  if (records.length === 0) throw new Error("Хост не резолвится");

  for (const { address, family } of records) {
    const bad = family === 6 ? isPrivateV6(address) : isPrivateV4(address);
    if (bad) throw new Error("Внутренние адреса запрещены");
  }

  return url;
}

/**
 * Скачивает страницу с проверкой каждого редиректа и жёстким лимитом размера.
 * Редирект проверяется отдельно — иначе публичный адрес уводит во внутреннюю сеть
 * ответом 302, минуя первую проверку.
 */
export async function safeFetchHtml(raw: string): Promise<string> {
  let current = raw;

  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    const url = await assertPublicUrl(current);

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

    let res: Response;
    try {
      res = await fetch(url, {
        signal: controller.signal,
        redirect: "manual",
        headers: { "User-Agent": UA, Accept: "text/html,application/xhtml+xml" },
      });
    } finally {
      clearTimeout(timer);
    }

    if (res.status >= 300 && res.status < 400) {
      const location = res.headers.get("location");
      if (!location) throw new Error("Редирект без адреса");
      current = new URL(location, url).toString();
      continue;
    }

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const declared = Number(res.headers.get("content-length") ?? 0);
    if (declared > MAX_BYTES) throw new Error("Страница слишком большая");

    return await readCapped(res);
  }

  throw new Error("Слишком много редиректов");
}

/** Читает тело потоком и обрывает на лимите, чтобы гигабайтный файл не съел память. */
async function readCapped(res: Response): Promise<string> {
  if (!res.body) return "";

  const reader = res.body.getReader();
  const decoder = new TextDecoder("utf-8");
  const chunks: string[] = [];
  let received = 0;

  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      received += value.byteLength;
      if (received > MAX_BYTES) {
        await reader.cancel();
        break;
      }
      chunks.push(decoder.decode(value, { stream: true }));
    }
  } finally {
    reader.releaseLock();
  }

  chunks.push(decoder.decode());
  return chunks.join("");
}
