import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

const COOKIE_NAME = "admin_session";

function secret(): string {
  return process.env.ADMIN_SESSION_SECRET || "dev-secret";
}

export function makeSessionToken(): string {
  const payload = `admin:${Date.now()}`;
  const sig = createHmac("sha256", secret()).update(payload).digest("hex");
  return `${Buffer.from(payload).toString("base64url")}.${sig}`;
}

export function verifySessionToken(token: string | undefined): boolean {
  if (!token) return false;
  const [payloadB64, sig] = token.split(".");
  if (!payloadB64 || !sig) return false;
  try {
    const payload = Buffer.from(payloadB64, "base64url").toString();
    const expected = createHmac("sha256", secret()).update(payload).digest("hex");
    return (
      sig.length === expected.length &&
      timingSafeEqual(Buffer.from(sig), Buffer.from(expected))
    );
  } catch {
    return false;
  }
}

export function checkCredentials(user: string, password: string): boolean {
  const expectedUser = process.env.ADMIN_USER || "admin";
  const expectedPass = process.env.ADMIN_PASSWORD || "demo2026";
  return user === expectedUser && password === expectedPass;
}

/** Проверка cookie-сессии в API-роутах админки */
export function isAdminRequest(): boolean {
  const token = cookies().get(COOKIE_NAME)?.value;
  return verifySessionToken(token);
}

export const ADMIN_COOKIE = COOKIE_NAME;
