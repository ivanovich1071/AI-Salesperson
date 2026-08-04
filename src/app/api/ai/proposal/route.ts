import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { chatJson } from "@/lib/openrouter";
import { CompanyInfoSchema, ProposalSchema } from "@/lib/schemas";
import {
  getModule,
  calculateTrainingCost,
  totalHours,
  assemblyName,
  formatRange,
  LAB,
  DESIGN_DEVELOPMENT,
} from "@/lib/pricing";
import { selectProgram } from "@/lib/moduleSelection";

export const runtime = "nodejs";
export const maxDuration = 90;

const QAItem = z.object({ question: z.string(), answer: z.string() });
const InputSchema = z.object({
  company: CompanyInfoSchema,
  qa: z.array(QAItem), // объединённые ответы анкеты: вопрос + (чекбоксы + «Другое»)
});

const NEXT_STEPS = [
  "Экспертное заключение по итогам обучения (входит в стоимость)",
  "Лаборатория AI-кейсов или аудит процессов — по желанию",
  "Дорожная карта внедрения ИИ (по итогам лаборатории или аудита)",
  "Проектирование и разработка конкретного решения — после отдельной оценки",
];

/**
 * Детерминированная база «соответствия задачам» (0–100) — по полноте вводных.
 * Комбинируется с оценкой AI (см. ниже), чтобы число не было захардкожено.
 */
function computeBaseMatch(
  qa: { question: string; answer: string }[],
  goals: string,
  parsedWebsiteText: string,
  moduleCount: number
): number {
  const answered = qa.filter((x) => x.answer && x.answer.trim().length > 0).length;
  const coverage = qa.length > 0 ? answered / qa.length : 0; // доля отвеченных пунктов
  let score = 55;
  score += Math.round(coverage * 25); // до +25 за полноту анкеты
  if (goals.trim().length > 20) score += 6; // содержательная формулировка задач
  if (parsedWebsiteText.trim().length > 0) score += 4; // есть контекст с сайта
  if (moduleCount >= 3) score += 5; // подобрана полноценная сборка
  return Math.max(45, Math.min(96, score));
}

/**
 * POST /api/ai/proposal
 * Модули выбирает СИСТЕМА (Program Selector, Таблица 7), стоимость обучения
 * считает КОД (Pricing, Таблица 5). AI только объясняет выбор и оформляет предложение.
 */
export async function POST(req: NextRequest) {
  try {
    const { company, qa } = InputSchema.parse(await req.json());

    const answersText = qa.map((x) => x.answer).join("\n");
    const hasManagers = company.userRole === "Руководители";

    // === Program Selector: детерминированный выбор ===
    const selection = selectProgram(company.userRole, answersText, hasManagers);
    const codes = selection.modules;

    // === Pricing: детерминированный расчёт обучения ===
    const cost = calculateTrainingCost(codes, company.participantCount);
    const hours = totalHours(codes);
    const bundle = assemblyName(codes);

    const catalog = codes
      .map((c) => {
        const m = getModule(c)!;
        return `- ${c}: ${m.title} (${m.hours} ч, аудитория: ${m.audience})`;
      })
      .join("\n");

    const qaText = qa
      .map((x) => `Вопрос: ${x.question}\nОтвет: ${x.answer || "(без ответа)"}`)
      .join("\n\n");

    const proposal = await chatJson(
      [
        {
          role: "user",
          content: `Клиент прошёл диагностику (чекбокс-анкета). Оформи персональное предложение.

ДАННЫЕ КЛИЕНТА:
- Компания: ${company.companyName}
- Роль участников: ${company.userRole}
- Количество участников: ${company.participantCount}
- Текст с сайта: ${company.parsedWebsiteText ? company.parsedWebsiteText.slice(0, 2000) : "(нет)"}

ОТВЕТЫ АНКЕТЫ:
${qaText}

СИСТЕМА УЖЕ ВЫБРАЛА УЧЕБНЫЕ МОДУЛИ по матрице направленности (состав менять НЕЛЬЗЯ):
${catalog}
Сборка: «${bundle}», суммарно ${hours} ак. часов.
${selection.publicCloudRestricted ? "ВАЖНО: у клиента запрещены публичные облачные ИИ-сервисы — подчеркни работу в закрытом контуре и локальные/корпоративные инструменты." : ""}

Для КАЖДОГО выбранного модуля напиши краткое объяснение, почему он подходит именно
этой роли и задачам клиента, со ссылкой на занятия и инструменты из базы знаний.
Цены НЕ упоминай (их считает система). Эффект описывай качественно, без процентов и сумм.

Верни ТОЛЬКО JSON вида:
{
  "summary": "Блок «Что мы увидели»: 3-5 предложений о ситуации компании по ответам анкеты",
  "moduleReasons": [${codes.map((c) => `{"code": "${c}", "reason": "почему модуль ${c} подходит (2-3 предложения)"}`).join(", ")}],
  "trainingFormat": "Как будет проходить обучение: очно/дистанционно, BYOD, принцип «демонстрация → применение → результат», конкретные инструменты из базы знаний",
  "matchScore": <целое 0-100: твоя честная оценка, насколько подобранная программа покрывает задачи и ответы ИМЕННО этого клиента; оценивай по существу, НЕ ставь одно и то же число всегда>,
  "chatComment": "короткая реплика AI-продажника в чат о готовом предложении"
}`,
        },
      ],
      (data) => ProposalSchema.parse(data)
    );

    // Комбинированное соответствие: формула в коде + оценка AI (50/50)
    const baseMatch = computeBaseMatch(
      qa,
      company.goals ?? "",
      company.parsedWebsiteText ?? "",
      codes.length
    );
    const aiMatch = Math.max(0, Math.min(100, proposal.matchScore));
    const finalMatch = Math.max(45, Math.min(97, Math.round((baseMatch + aiMatch) / 2)));

    const reasonByCode = new Map(
      proposal.moduleReasons.map((r) => [r.code, r.reason])
    );

    const trainingModules = codes.map((c) => {
      const m = getModule(c)!;
      return {
        code: c,
        title: m.title,
        hours: m.hours,
        image: m.image,
        reason: reasonByCode.get(c) || m.condition,
      };
    });

    return NextResponse.json({
      summary: proposal.summary,
      trainingModules,
      totalHours: hours,
      assemblyName: bundle,
      trainingFormat: proposal.trainingFormat,
      trainingCost: cost,
      lab: {
        title: LAB.title,
        range: formatRange(LAB.priceMin, LAB.priceMax),
        description: LAB.description,
      },
      designDevelopment: {
        title: DESIGN_DEVELOPMENT.title,
        note: DESIGN_DEVELOPMENT.note,
        description: DESIGN_DEVELOPMENT.description,
      },
      nextSteps: NEXT_STEPS,
      matchScore: finalMatch,
      chatComment: proposal.chatComment,
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
