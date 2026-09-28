import { NextResponse } from "next/server";
import { ZodError } from "zod";

/** Общие ответы API карточек «Лаборатории решений» */

export const unauthorized = () =>
  NextResponse.json({ error: "Требуется вход в админку." }, { status: 401 });

export const notFound = () =>
  NextResponse.json(
    { error: "Карточка не найдена — возможно, ее уже удалили." },
    { status: 404 }
  );

/** Первое сообщение валидации — человеку в форме не нужен весь отчет zod */
export function validationError(e: unknown) {
  const msg =
    e instanceof ZodError ? e.issues[0]?.message ?? "Проверьте поля" : "Проверьте поля";
  return NextResponse.json({ error: msg }, { status: 400 });
}
