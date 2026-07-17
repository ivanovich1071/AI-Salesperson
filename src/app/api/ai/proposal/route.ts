import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { chatJson } from "@/lib/openrouter";
import { CompanyInfoSchema, ProposalSchema } from "@/lib/schemas";
import { MODULES, calculateCost, modulePriceLabel } from "@/lib/pricing";

export const runtime = "nodejs";
export const maxDuration = 90;

const InputSchema = z.object({
  company: CompanyInfoSchema,
  questions: z.array(z.string()),
  answers: z.array(z.string()),
});

/**
 * POST /api/ai/proposal
 * Экран 3: персональная программа. AI выбирает модули и объясняет выбор,
 * стоимость считает бэкенд детерминированно (AI цифры не придумывает).
 */
export async function POST(req: NextRequest) {
  try {
    const { company, questions, answers } = InputSchema.parse(await req.json());

    const qa = questions
      .map((q, i) => `Вопрос: ${q}\nОтвет клиента: ${answers[i] || "(без ответа)"}`)
      .join("\n\n");

    const catalog = MODULES.map(
      (m) =>
        `- id="${m.id}": ${m.title}. ${m.description} Длительность: ${m.duration}. Формат: ${m.format}. Цена: ${modulePriceLabel(m)}.`
    ).join("\n");

    const proposal = await chatJson(
      [
        {
          role: "user",
          content: `Клиент прошёл диагностику. Составь персональное предложение.

ДАННЫЕ КЛИЕНТА:
- Компания: ${company.companyName}
- Текст с сайта: ${company.parsedWebsiteText ? company.parsedWebsiteText.slice(0, 2500) : "(нет)"}
- Роль участников: ${company.userRole}
- Количество участников: ${company.participantCount}
- Цели: ${company.goals}

ДИАГНОСТИКА:
${qa}

КАТАЛОГ МОДУЛЕЙ (выбирай ТОЛЬКО из этих id, цены НЕ называй — их считает система):
${catalog}

Верни ТОЛЬКО JSON вида:
{
  "summary": "Блок «Что мы увидели»: краткий саммари ситуации компании (3-5 предложений)",
  "recommendedModules": [{"id": "intro", "reason": "почему модуль подходит именно этой роли и компании (2-3 предложения)"}],
  "trainingFormat": "Блок «Как будет проходить обучение»: формат (онлайн/офлайн, BYOD), какие занятия из программы будут в фокусе для этой роли, конкретные инструменты (DeepSeek, Gemini, Perplexity, NotebookLM, Gamma, Буквица, SM AI PL)",
  "matchScore": 87,
  "chatComment": "короткая реплика AI-продажника в чат о готовом предложении"
}`,
        },
      ],
      (data) => ProposalSchema.parse(data)
    );

    // Детерминированный расчет стоимости на бэкенде
    const moduleIds = proposal.recommendedModules.map((m) => m.id);
    const cost = calculateCost(moduleIds, company.participantCount);

    const modules = proposal.recommendedModules.map((rec) => {
      const m = MODULES.find((x) => x.id === rec.id)!;
      return {
        id: m.id,
        title: m.title,
        duration: m.duration,
        format: m.format,
        description: m.description,
        image: m.image,
        priceLabel: modulePriceLabel(m),
        reason: rec.reason,
      };
    });

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
