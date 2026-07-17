import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { chatJson } from "@/lib/openrouter";
import { ObjectionResponseSchema } from "@/lib/schemas";
import { formatMoney } from "@/lib/pricing";

export const runtime = "nodejs";
export const maxDuration = 60;

const InputSchema = z.object({
  objection: z.string().min(1),
  companyName: z.string(),
  userRole: z.string(),
  participantCount: z.number(),
  goals: z.string(),
  recommendedModules: z.array(z.string()),
  totalCost: z.number(),
});

/**
 * POST /api/ai/objection
 * Экран 4: персональный ответ на возражение по структуре из ТЗ:
 * признание → конкретный ответ → возврат к бизнес-задаче → безопасный шаг.
 */
export async function POST(req: NextRequest) {
  try {
    const input = InputSchema.parse(await req.json());

    const result = await chatJson(
      [
        {
          role: "user",
          content: `Клиент высказал сомнение/возражение: «${input.objection}»

КОНТЕКСТ:
- Компания: ${input.companyName}
- Роль участников: ${input.userRole}
- Количество участников: ${input.participantCount}
- Цели: ${input.goals}
- Рекомендованные модули: ${input.recommendedModules.join("; ")}
- Рассчитанная стоимость: ${formatMoney(input.totalCost)}

Сформируй персональный ответ на возражение строго по структуре.
Опирайся на программу из базы знаний (конкретные занятия, инструменты, результаты).
Тон: уважительный, без давления.

Верни ТОЛЬКО JSON вида:
{
  "acknowledgement": "1. Признание логики сомнения (1-2 предложения)",
  "answer": "2. Конкретный ответ с привязкой к контексту компании и роли (3-5 предложений, можно упомянуть стоимость в пересчёте на участника/час)",
  "businessFocus": "3. Возврат к бизнес-задаче клиента (2-3 предложения)",
  "nextStep": "4. Предложение безопасного следующего шага — 30-минутная встреча с экспертом без обязательств (1-2 предложения)"
}`,
        },
      ],
      (data) => ObjectionResponseSchema.parse(data)
    );

    return NextResponse.json(result);
  } catch (e) {
    console.error("[ai/objection]", e);
    return NextResponse.json(
      {
        error:
          "Не удалось подготовить ответ. Вы можете сразу выбрать время встречи — эксперт ответит на все вопросы лично.",
      },
      { status: 502 }
    );
  }
}
