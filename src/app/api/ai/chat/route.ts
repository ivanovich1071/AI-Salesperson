import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { chatCompletion } from "@/lib/openrouter";

export const runtime = "nodejs";
export const maxDuration = 60;

const MessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1),
});

const ProposalCtx = z.object({
  assemblyName: z.string().optional(),
  totalHours: z.number().optional(),
  modules: z.array(z.string()).optional(),
  trainingTotal: z.number().optional(),
  currency: z.string().optional(),
});

const InputSchema = z.object({
  messages: z.array(MessageSchema).min(1),
  context: z
    .object({
      companyName: z.string().optional().default(""),
      userRole: z.string().optional().default(""),
      participantCount: z.number().optional(),
      goals: z.string().optional().default(""),
      step: z.number().optional(),
      proposal: ProposalCtx.nullable().optional(),
    })
    .optional()
    .default({}),
});

const STEP_NAMES: Record<number, string> = {
  1: "заполняет данные о компании",
  2: "проходит чекбокс-анкету диагностики",
  3: "смотрит персональное предложение и расчёт",
  4: "обсуждает возражение",
  5: "выбирает время встречи",
  6: "бронирование завершено",
};

/**
 * POST /api/ai/chat — свободный диалог с AI-ассистентом в левой панели.
 * Ассистент видит контекст визарда (компания, роль, шаг, собранное предложение)
 * и отвечает по базе знаний. Возвращает обычный текст (не JSON).
 */
export async function POST(req: NextRequest) {
  try {
    const { messages, context: c } = InputSchema.parse(await req.json());

    const ctxLines = [
      "КОНТЕКСТ ТЕКУЩЕГО ДИАЛОГА (для твоих ответов, пользователю не пересказывай дословно):",
      c.companyName ? `- Компания: ${c.companyName}` : "",
      c.userRole ? `- Роль участников: ${c.userRole}` : "",
      c.participantCount ? `- Количество участников: ${c.participantCount}` : "",
      c.goals ? `- Задачи клиента: ${c.goals}` : "",
      c.step ? `- Сейчас пользователь ${STEP_NAMES[c.step] ?? "в визарде"}.` : "",
      c.proposal
        ? `- Сформированное предложение: сборка «${c.proposal.assemblyName ?? "—"}» (${c.proposal.totalHours ?? "?"} ч), модули: ${(c.proposal.modules ?? []).join(", ")}; стоимость обучения: ${c.proposal.trainingTotal ?? "?"} ${c.proposal.currency ?? "BYN"}.`
        : "",
      "",
      "Отвечай кратко и по делу (2-5 предложений), на русском. Если спрашивают о составе или цене — опирайся на предложение и базу знаний, не выдумывай цифры. Мягко возвращай разговор к подбору обучения и записи на встречу.",
    ]
      .filter(Boolean)
      .join("\n");

    // берём последние 12 реплик, чтобы не раздувать промпт
    const trimmed = messages.slice(-12);

    const reply = await chatCompletion(
      [{ role: "system", content: ctxLines }, ...trimmed],
      { temperature: 0.5 }
    );

    return NextResponse.json({ reply: reply.trim() });
  } catch (e) {
    console.error("[ai/chat]", e);
    return NextResponse.json(
      {
        error:
          "Не удалось получить ответ ассистента. Попробуйте ещё раз или продолжите заполнение формы.",
      },
      { status: 502 }
    );
  }
}
