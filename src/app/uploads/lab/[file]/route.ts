import { contentTypeOf, readPhoto } from "@/lib/lab/uploads";

export const runtime = "nodejs";

/**
 * GET /uploads/lab/<имя> — фото карточек, загруженные через админку.
 * Имя проверяется строгим шаблоном (его генерирует сервер), поэтому выйти за
 * пределы каталога загрузок через «../» нельзя. Файлы не меняются — у каждой
 * загрузки новое имя, — так что кэшируем надолго.
 */
export async function GET(_req: Request, { params }: { params: { file: string } }) {
  const type = contentTypeOf(params.file);
  const buf = type ? await readPhoto(params.file) : null;
  if (!type || !buf) {
    return new Response("Not found", { status: 404 });
  }
  return new Response(new Uint8Array(buf), {
    headers: {
      "Content-Type": type,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
