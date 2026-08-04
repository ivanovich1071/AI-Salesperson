import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { chatJson } from "@/lib/openrouter";
import { USER_ROLES } from "@/lib/pricing";

export const runtime = "nodejs";
export const maxDuration = 45;

/**
 * POST /api/ai/extract-company
 * Извлекает из свободного сообщения клиента данные Шага 1 (компания, роль,
 * количество участников, задачи), чтобы подставить их в форму.
 * Роль выбирается ПО НОМЕРУ из фиксированного списка — без перефразирования.
 * Никогда не бросает: при сбое возвращает пустой результат.
 */
const InputSchema = z.object({ message: z.string().min(1) });

const ExtractSchema = z.object({
  companyName: z.string().optional().default(""),
  roleNumber: z.number().nullable().optional(),
  participantCount: z.number().nullable().optional(),
  goals: z.string().optional().default(""),
});

export async function POST(req: NextRequest) {
  try {
    const { message } = InputSchema.parse(await req.json());

    const roleList = USER_ROLES.map((r, i) => `  ${i + 1}) ${r}`).join("\n");
    const prompt = `Извлеки данные о компании из сообщения клиента и заполни JSON.
ПРИМЕР: "ООО Ромашка, 12 продажников, хотим ускорить подготовку КП" → {"companyName":"ООО Ромашка","roleNumber":5,"participantCount":12,"goals":"ускорить подготовку коммерческих предложений"}

РОЛИ (выбери номер наиболее подходящей):
${roleList}

СООБЩЕНИЕ: "${message}"
Верни ТОЛЬКО JSON {"companyName":"","roleNumber":null,"participantCount":null,"goals":""} — поля, которых нет в сообщении, оставь пустыми/null.`;

    const d = await chatJson([{ role: "user", content: prompt }], (x) => ExtractSchema.parse(x), {
      system:
        "Ты — точный парсер данных о компании. Возвращай только валидный JSON по заданной схеме, без пояснений.",
      temperature: 0.2,
    });

    const n = d.roleNumber ?? 0;
    const userRole = n >= 1 && n <= USER_ROLES.length ? USER_ROLES[n - 1] : "";
    const count =
      typeof d.participantCount === "number" && d.participantCount > 0 && d.participantCount < 100000
        ? Math.round(d.participantCount)
        : null;

    return NextResponse.json({
      companyName: (d.companyName ?? "").trim(),
      userRole,
      participantCount: count,
      goals: (d.goals ?? "").trim(),
    });
  } catch (e) {
    console.error("[ai/extract-company]", e);
    return NextResponse.json({ companyName: "", userRole: "", participantCount: null, goals: "" });
  }
}
