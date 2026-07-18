import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { chatJson } from "@/lib/openrouter";
import { CompanyInfoSchema, ProposalSchema } from "@/lib/schemas";
import { MODULES, calculateCost, modulePriceLabel } from "@/lib/pricing";
import { selectProgram, describePlan } from "@/lib/moduleSelection";

export const runtime = "nodejs";
export const maxDuration = 90;

const InputSchema = z.object({
  company: CompanyInfoSchema,
  questions: z.array(z.string()),
  answers: z.array(z.string()),
});

/**
 * POST /api/ai/proposal
 * Экран 3: персональная программа.
 * Модули выбирает СИСТЕМА детерминированно (Program Selector, матрица ролей),
 * стоимость считает бэкенд (Pricing Agent). AI только объясняет выбор
 * и оформляет предложение (Presentation Agent).
 */
export async function POST(req: NextRequest) {
  try {
    const { company, questions, answers } = InputSchema.parse(await req.json());

    // === Program Selector: детерминированный выбор по роли ===
    const plan = selectProgram(company.userRole);
    const selectedModules = plan.modules
      .map((id) => MODULES.find((m) => m.id === id)!)
      .filter(Boolean);

    const qa = questions
      .map((q, i) => `Вопрос: ${q}\nОтвет клиента: ${answers[i] || "(без ответа)"}`)
      .join("\n\n");

    const catalog = selectedModules
      .map(
        (m) =>
          `- id="${m.id}": ${m.title}. ${m.description} Длительность: ${m.duration}. Формат: ${m.format}.`
      )
      .join("\n");

    const proposal = await chatJson(
      [
        {
          role: "user",
          content: `Клиент прошёл диагностику. Оформи персональное предложение (Presentation Agent).

ДАННЫЕ КЛИЕНТА:
- Компания: ${company.companyName}
- Текст с сайта: ${company.parsedWebsiteText ? company.parsedWebsiteText.slice(0, 2500) : "(нет)"}
- Роль участников: ${company.userRole}
- Количество участников: ${company.participantCount}
- Цели: ${company.goals}

ДИАГНОСТИКА:
${qa}

СИСТЕМА УЖЕ ВЫБРАЛА МОДУЛИ по матрице направленности (менять состав НЕЛЬЗЯ):
${catalog}

ПЛАН ЗАНЯТИЙ ДЛЯ РОЛИ «${company.userRole}»:
${describePlan(plan)}

Для КАЖДОГО выбранного модуля напиши, почему он подходит именно этой роли и компании,
со ссылкой на конкретные занятия и инструменты из базы знаний. Цены НЕ упоминай.
Эффект описывай качественно, без процентов и сумм.

Верни ТОЛЬКО JSON вида:
{
  "summary": "Блок «Что мы увидели»: краткий саммари ситуации компании (3-5 предложений)",
  "recommendedModules": [${plan.modules.map((id) => `{"id": "${id}", "reason": "почему подходит (2-3 предложения, со ссылкой на занятия)"}`).join(", ")}],
  "trainingFormat": "Блок «Как будет проходить обучение»: формат (очно/дистанционно, BYOD), занятия в фокусе для этой роли, конкретные инструменты из базы знаний",
  "matchScore": 87,
  "chatComment": "короткая реплика AI-продажника в чат о готовом предложении"
}`,
        },
      ],
      (data) => ProposalSchema.parse(data)
    );

    // Детерминированная сборка: состав модулей — только из плана системы,
    // от AI берём только объяснения (reason); стоимость — Pricing Agent.
    const aiReasons = new Map(
      proposal.recommendedModules.map((m) => [m.id, m.reason])
    );
    const modules = selectedModules.map((m) => ({
      id: m.id,
      title: m.title,
      duration: m.duration,
      format: m.format,
      description: m.description,
      image: m.image,
      priceLabel: modulePriceLabel(m),
      reason: aiReasons.get(m.id) || m.description,
    }));

    const cost = calculateCost(plan.modules, company.participantCount);

    return NextResponse.json({
      summary: proposal.summary,
      modules,
      trainingFormat: proposal.trainingFormat,
      matchScore: proposal.matchScore,
      chatComment: proposal.chatComment,
      cost,
    });
  } catch (e) {
    console.error("[ai/proposal]", e);
    return NextResponse.json(
      {
        error:
          "Не удалось сформировать предложение. Попробуйте ещё раз — мы уже сохранили ваши ответы.",
      },
      { status: 502 }
    );
  }
}
