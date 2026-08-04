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
      // Состояние анкеты (шаг 2): что уже отмечено и что осталось спросить
      answeredCount: z.number().optional(),
      totalQuestions: z.number().optional(),
      pendingQuestions: z.array(z.string()).optional().default([]),
      missingCompanyFields: z.array(z.string()).optional().default([]),
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
 * Страховка от JSON в чате: модель иногда отвечает служебной структурой
 * ({"step":"program_selection",...}) — такой ответ нельзя показывать клиенту.
 */
function sanitizeReply(raw: string): string {
  let text = (raw ?? "").trim();
  // markdown-обёртка ```json ... ```
  text = text.replace(/```(?:json)?[\s\S]*?```/g, "").trim();
  const looksLikeJson =
    (text.startsWith("{") && text.endsWith("}")) ||
    (text.startsWith("[") && text.endsWith("]")) ||
    /"(step|modules|price_byn|total_hours|next_step|matchScore)"\s*:/.test(text);
  if (!text || looksLikeJson) {
    return "Готов помочь с подбором программы. Расскажите, какие задачи хотите закрыть — или задайте вопрос о курсе, модулях и стоимости.";
  }
  return text;
}

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
      c.step === 1 && (c.missingCompanyFields?.length ?? 0) > 0
        ? `- В форме шага 1 ещё не заполнено: ${c.missingCompanyFields!.join(", ")}. Спроси об этом (одним коротким вопросом за раз) — ответы клиента система сама подставит в форму.`
        : "",
      c.step === 2
        ? `- Анкета: отвечено ${c.answeredCount ?? 0} из ${c.totalQuestions ?? "?"} вопросов.` +
          ((c.pendingQuestions?.length ?? 0) > 0
            ? ` Ещё не отвечены: ${c.pendingQuestions!.map((q) => `«${q}»`).join("; ")}.`
            : " Все вопросы отвечены.")
        : "",
      "",
      "КАК ОТВЕЧАТЬ:",
      "- ТОЛЬКО обычный человеческий текст на русском. НИКОГДА не выводи JSON, фигурные скобки, код или служебные поля (step, modules, price_byn и т.п.) — это сломает интерфейс.",
      "- Коротко: 2–4 предложения. Без длинных списков и без markdown-таблиц.",
      "- Не выдумывай цифры и цены: их считает система.",
      c.step === 2
        ? "- Ты ВЕДЁШЬ диагностику: задай ОДИН следующий неотвеченный вопрос анкеты своими словами, с 3–5 примерами вариантов через запятую. Ответы клиента система сама отмечает в анкете справа."
        : "",
      c.step === 2 && (c.answeredCount ?? 0) >= 2
        ? "- Данных уже достаточно: одной фразой предложи сформировать персональное предложение и скажи, что можно нажать кнопку «Сформировать предложение»."
        : "",
      "- Отвечай на вопросы клиента о программе, модулях и стоимости по базе знаний; затем возвращай разговор к диагностике и записи на встречу.",
    ]
      .filter(Boolean)
      .join("\n");

    // берём последние 12 реплик, чтобы не раздувать промпт
    const trimmed = messages.slice(-12);

    const reply = await chatCompletion(
      [{ role: "system", content: ctxLines }, ...trimmed],
      { temperature: 0.5 }
    );

    return NextResponse.json({ reply: sanitizeReply(reply) });
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
