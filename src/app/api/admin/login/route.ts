import { NextRequest, NextResponse } from "next/server";
import {
  checkCredentials,
  makeSessionToken,
  adminUser,
  ADMIN_COOKIE,
  SESSION_TTL_MS,
} from "@/lib/adminAuth";

export const runtime = "nodejs";

/** POST /api/admin/login { user, password } → httpOnly cookie */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const user = String(body?.user ?? "").trim();
    if (!checkCredentials(user, String(body?.password ?? ""))) {
      return NextResponse.json(
        { error: "Неверный логин или пароль." },
        { status: 401 }
      );
    }
    const res = NextResponse.json({ ok: true, user });
    res.cookies.set(ADMIN_COOKIE, makeSessionToken(user), {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_TTL_MS / 1000, // 8 часов
    });
    return res;
  } catch {
    return NextResponse.json({ error: "Ошибка входа." }, { status: 400 });
  }
}

/** GET /api/admin/login — кто вошел (для шапки админки) */
export async function GET() {
  const user = adminUser();
  if (!user) return NextResponse.json({ error: "Требуется вход в админку." }, { status: 401 });
  return NextResponse.json({ user });
}

/** DELETE /api/admin/login — выход */
export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
  return res;
}
