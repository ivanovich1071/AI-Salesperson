import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { chatJson } from "@/lib/openrouter";
import { questionsForRole } from "@/lib/diagnosticQuestions";
import type { UserRole } from "@/lib/pricing";

export const runtime = "nodejs";
export const maxDuration = 45;

/**
 * POST /api/ai/extract-diagnostics
 * Разбирает свободный ответ пользователя (из чата, текст или расшифрованный голос)
 * и сопоставляет его с вопросами чекбокс-анкеты для его роли.
 *
 * Чтобы избежать перефразирования, модель выбирает варианты ПО НОМЕРАМ, а сервер
 * сам подставляет дословные строки вариантов. Никогда не бросает — при сбое отдаёт пусто.
 */
const InputSchema = z.object({
  role: z.string().min(1),
  message: z.string().min(1),
});

const ExtractSchema = z.object({
  matches: z
    .array(
      z.object({
        qid: z.string(),
        optionNumbers: z.array(z.number()).default([]),
        other: z.string().optional().default(""),
      })
    )
    .default([]),
  notes: z.string().optional().default(""),
});

export async function POST(req: NextRequest) {
  try {
    const { role, message } = InputSchema.parse(await req.json());
    const questions = questionsForRole((role as UserRole) || "Универсальные специалисты");

    // qid → массив вариантов (индексы 1-based в промпте) + пометка single-select
    const optionsById = new Map<string, string[]>();
    const singleIds = new Set<string>();
    const lines: string[] = [];
    for (const q of questions) {
      optionsById.set(q.id, q.options);
      lines.push(
        `[${q.id}] ${q.text}\n` +
          q.options.map((o, i) => `  ${i + 1}) ${o}`).join("\n")
      );
      if (q.sub) {
        optionsById.set(q.sub.id, q.sub.options);
        singleIds.add(q.sub.id);
        lines.push(
          `[${q.sub.id}] ${q.sub.text} (ВЫБРАТЬ ОДИН)\n` +
            q.sub.options.map((o, i) => `  ${i + 1}) ${o}`).join("\n")
        );
      }
    }
    const catalog = lines.join("\n\n");

    const prompt = `Разбери ответ клиента по анкете и заполни JSON.
ПРИМЕР: [q01] 1) Отчёты 2) Письма → "пишем письма" → {"matches":[{"qid":"q01","optionNumbers":[2],"other":""}],"notes":""}

АНКЕТА:
${catalog}

СООБЩЕНИЕ: "${message}"
Верни ТОЛЬКО JSON {"matches":[{"qid":"код","optionNumbers":[],"other":""}],"notes":""}`;

    const extracted = await chatJson(
      [{ role: "user", content: prompt }],
      (d) => ExtractSchema.parse(d),
      {
        system:
          "Ты — точный парсер ответов на анкету. Возвращай только валидный JSON по заданной схеме, без пояснений.",
        temperature: 0.2,
      }
    );

    // Сервер сам подставляет дословные строки по номерам (никакого перефразирования)
    const matches = extracted.matches
      .map((m) => {
        const opts = optionsById.get(m.qid);
        if (!opts) return null;
        const single = singleIds.has(m.qid);
        let picked = Array.from(
          new Set(
            (m.optionNumbers ?? [])
              .map((n) => opts[Math.round(n) - 1])
              .filter((s): s is string => typeof s === "string")
          )
        );
        if (single) picked = picked.slice(0, 1);
        const other = single ? "" : (m.other ?? "").trim();
        if (picked.length === 0 && !other) return null;
        return { qid: m.qid, options: picked, other, single };
      })
      .filter((x): x is NonNullable<typeof x> => x !== null);

    // Если ничего не сопоставилось и это похоже на вопрос — не засоряем заметки его текстом
    const rawNotes = (extracted.notes ?? "").trim();
    const notes = matches.length === 0 && /\?\s*$/.test(message.trim()) ? "" : rawNotes;
    return NextResponse.json({ matches, notes });
  } catch (e) {
    console.error("[ai/extract-diagnostics]", e);
    return NextResponse.json({ matches: [], notes: "" });
  }
}
