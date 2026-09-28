import { NextRequest, NextResponse } from "next/server";
import { adminUser } from "@/lib/adminAuth";
import { unauthorized } from "@/lib/lab/api";
import { MAX_PHOTO_BYTES, savePhoto } from "@/lib/lab/uploads";

export const runtime = "nodejs";

/**
 * POST /api/admin/solutions/upload — фото карточки (multipart, поле `file`).
 * Возвращает путь `/uploads/lab/…`, который форма кладет в поле `photo`.
 * Файл, так и не попавший в карточку, остается лежать — это пара сотен КБ.
 */
export async function POST(req: NextRequest) {
  if (!adminUser()) return unauthorized();

  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof Blob)) {
    return NextResponse.json({ error: "Файл не получен." }, { status: 400 });
  }
  if (file.size > MAX_PHOTO_BYTES) {
    return NextResponse.json({ error: "Фото больше 5 МБ." }, { status: 413 });
  }

  try {
    const url = await savePhoto(Buffer.from(await file.arrayBuffer()));
    return NextResponse.json({ url });
  } catch (e) {
    if (e instanceof Error && e.message === "not-an-image") {
      return NextResponse.json(
        { error: "Это не картинка. Подходят JPG, PNG или WebP." },
        { status: 400 }
      );
    }
    console.error("[admin/solutions/upload]", e);
    return NextResponse.json({ error: "Не удалось сохранить фото." }, { status: 500 });
  }
}
