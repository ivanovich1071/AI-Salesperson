import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

const COOKIE_NAME = "admin_session";

/** Срок сессии. Раньше он был только у cookie — сам токен жил вечно. */
export const SESSION_TTL_MS = 8 * 60 * 60 * 1000;

function secret(): string {
  return process.env.ADMIN_SESSION_SECRET || "dev-secret";
}

function sign(payload: string): string {
  return createHmac("sha256", secret()).update(payload).digest("hex");
}

/** Сравнение строк за постоянное время: по времени ответа пароль не подобрать */
function safeEqual(a: string, b: string): boolean {
  const ha = createHmac("sha256", "cmp").update(a).digest();
  const hb = createHmac("sha256", "cmp").update(b).digest();
  return timingSafeEqual(ha, hb);
}

/**
 * Пользователи админки. У всех одинаковые (полные) права.
 *
 * - `ADMIN_USER` / `ADMIN_PASSWORD` — основной вход, как и раньше;
 * - `ADMIN_USERS` — дополнительные: `логин:пароль;логин2:пароль2`.
 *   Пароль может содержать двоеточие — делим по первому.
 */
export function adminUsers(): Map<string, string> {
  const users = new Map<string, string>();
  users.set(process.env.ADMIN_USER || "admin", process.env.ADMIN_PASSWORD || "demo2026");
  for (const pair of (process.env.ADMIN_USERS || "").split(";")) {
    const i = pair.indexOf(":");
    if (i <= 0) continue;
    const login = pair.slice(0, i).trim();
    const password = pair.slice(i + 1).trim();
    if (login && password) users.set(login, password);
  }
  return users;
}

export function checkCredentials(user: string, password: string): boolean {
  const expected = adminUsers().get(user);
  // Сравниваем и для неизвестного логина — чтобы время ответа не выдавало, есть ли такой
  const ok = safeEqual(password, expected ?? "\u0000no-such-user");
  return ok && expected !== undefined;
}

export function makeSessionToken(user: string, now = Date.now()): string {
  const payload = JSON.stringify({ u: user, t: now });
  return `${Buffer.from(payload).toString("base64url")}.${sign(payload)}`;
}

/** Логин из токена, если подпись верна и срок не вышел; иначе null */
export function verifySessionToken(
  token: string | undefined,
  now = Date.now()
): string | null {
  if (!token) return null;
  const [payloadB64, sig] = token.split(".");
  if (!payloadB64 || !sig) return null;
  try {
    const payload = Buffer.from(payloadB64, "base64url").toString();
    const expected = sign(payload);
    if (
      sig.length !== expected.length ||
      !timingSafeEqual(Buffer.from(sig), Buffer.from(expected))
    ) {
      return null;
    }
    const { u, t } = JSON.parse(payload) as { u?: unknown; t?: unknown };
    if (typeof u !== "string" || typeof t !== "number") return null;
    if (now - t > SESSION_TTL_MS || t > now + 60_000) return null;
    // Пользователя могли убрать из ADMIN_USERS — его сессия больше не действует
    if (!adminUsers().has(u)) return null;
    return u;
  } catch {
    return null;
  }
}

/** Кто вошел в админку (по cookie-сессии), или null */
export function adminUser(): string | null {
  return verifySessionToken(cookies().get(COOKIE_NAME)?.value);
}

/** Проверка cookie-сессии в API-роутах админки */
export function isAdminRequest(): boolean {
  return adminUser() !== null;
}

export const ADMIN_COOKIE = COOKIE_NAME;
