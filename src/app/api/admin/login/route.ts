import { NextRequest, NextResponse } from "next/server";
import { checkCredentials, makeSessionToken, ADMIN_COOKIE } from "@/lib/adminAuth";

export const runtime = "nodejs";

/** POST /api/admin/login { user, password } → httpOnly cookie */
export async function POST(req: NextRequest) {
  try {
    const { user, password } = await req.json();
    if (!checkCredentials(String(user ?? ""), String(password ?? ""))) {
      return NextResponse.json(
        { error: "Неверный логин или пароль." },
        { status: 401 }
      );
    }
    const res = NextResponse.json({ ok: true });
    res.cookies.set(ADMIN_COOKIE, makeSessionToken(), {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 8, // 8 часов
    });
    return res;
  } catch {
    return NextResponse.json({ error: "Ошибка входа." }, { status: 400 });
  }
}

/** DELETE /api/admin/login — выход */
export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
  return res;
}
