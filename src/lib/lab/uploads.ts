import { randomBytes } from "crypto";
import { mkdir, readFile, unlink, writeFile } from "fs/promises";
import path from "path";

/**
 * Фото карточек, загруженные через админку.
 *
 * Лежат вне public/: Next отдает из public только то, что было там на момент
 * сборки. Каталог по умолчанию — data/uploads/lab в каталоге приложения (в
 * .gitignore; `git reset --hard` при деплое неотслеживаемые файлы не трогает).
 * Отдает их роут src/app/uploads/lab/[file]/route.ts.
 */
export const UPLOAD_URL_PREFIX = "/uploads/lab/";

export function uploadDir(): string {
  return process.env.LAB_UPLOAD_DIR || path.join(process.cwd(), "data", "uploads", "lab");
}

export const MAX_PHOTO_BYTES = 5 * 1024 * 1024;

const TYPES = {
  jpg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
} as const;
type Ext = keyof typeof TYPES;

/** Тип по первым байтам файла, а не по имени и не по заголовку браузера */
export function detectImage(buf: Buffer): Ext | null {
  if (buf.length > 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "jpg";
  if (
    buf.length > 8 &&
    buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
  ) {
    return "png";
  }
  if (
    buf.length > 12 &&
    buf.subarray(0, 4).toString("ascii") === "RIFF" &&
    buf.subarray(8, 12).toString("ascii") === "WEBP"
  ) {
    return "webp";
  }
  return null;
}

/** Имя файла генерирует сервер — из запроса в путь не попадает ничего */
const FILE_RE = /^[a-f0-9]{24}\.(jpg|png|webp)$/;

export function contentTypeOf(file: string): string | null {
  const m = FILE_RE.exec(file);
  return m ? TYPES[m[1] as Ext] : null;
}

export async function savePhoto(buf: Buffer): Promise<string> {
  const ext = detectImage(buf);
  if (!ext) throw new Error("not-an-image");
  const name = `${randomBytes(12).toString("hex")}.${ext}`;
  await mkdir(uploadDir(), { recursive: true });
  await writeFile(path.join(uploadDir(), name), buf);
  return UPLOAD_URL_PREFIX + name;
}

export async function readPhoto(file: string): Promise<Buffer | null> {
  if (!contentTypeOf(file)) return null;
  try {
    return await readFile(path.join(uploadDir(), file));
  } catch {
    return null;
  }
}

/** Удаляет только файлы, загруженные через админку; фото из репозитория не трогает */
export async function removeUploadedPhoto(photo: string): Promise<void> {
  if (!photo.startsWith(UPLOAD_URL_PREFIX)) return;
  const file = photo.slice(UPLOAD_URL_PREFIX.length);
  if (!contentTypeOf(file)) return;
  await unlink(path.join(uploadDir(), file)).catch(() => {});
}
