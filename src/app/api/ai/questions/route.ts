import { NextRequest, NextResponse } from "next/server";
import { chatJson } from "@/lib/openrouter";
import { CompanyInfoSchema, DiagnosticQuestionsSchema } from "@/lib/schemas";

export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * POST /api/ai/questions
 * Экран 2: генерация 3–4 персональных диагностических вопросов
 * на основе компании, роли и целей (с учётом матрицы направленности).
 */
export async function POST(req: NextRequest) {
  try {
    const info = CompanyInfoSchema.parse(await req.json());

    const result = await chatJson(
      [
        {
          role: "user",
          content: `Данные потенциального клиента:
- Компания: ${info.companyName}
- Текст с сайта компании: ${info.parsedWebsiteText ? info.parsedWebsiteText.slice(0, 3000) : "(сайт не проанализирован — опирайся на описание)"}
- Роль участников обучения: ${info.userRole}
- Количество участников: ${info.participantCount}
- Задачи, которые хотят решить: ${info.goals}

Сгенерируй 3–4 персональных диагностических вопроса для уточнения потребности.
Вопросы должны опираться на матрицу профессиональной направленности из базы знаний
(например, для роли «Производство / инженеры» — предиктивное обслуживание, контроль
качества, анализ брака из Занятия 6; для «HR» — адаптация и должностные инструкции
из Занятия 4). Вопросы конкретные, деловые, на русском языке.

Верни ТОЛЬКО JSON вида:
{
  "chatIntro": "короткая (2-3 предложения) реплика AI-продажника в чат: что он понял о компании и зачем задаёт вопросы",
  "questions": ["вопрос 1", "вопрос 2", "вопрос 3"]
}`,
        },
      ],
      (data) => DiagnosticQuestionsSchema.parse(data)
    );

    return NextResponse.json(result);
  } catch (e) {
    console.error("[ai/questions]", e);
    return NextResponse.json(
      {
        error:
          "AI-диагностика временно недоступна. Проверьте подключение и попробуйте ещё раз через минуту.",
      },
      { status: 502 }
    );
  }
}
