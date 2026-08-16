import type { Page } from "@playwright/test";

/**
 * Перехватывает все AI-роуты и отдаёт заготовленные ответы.
 *
 * Зачем: живой OpenRouter отвечает 8–30 секунд, стоит денег и каждый раз выдаёт
 * другой текст — тесты были бы медленными, дорогими и «мигающими» (см. TESTING.md, 4.1).
 * Формы ответов соответствуют схемам из src/lib/schemas.ts и тому, что реально
 * возвращают роуты, — иначе мок разойдётся с продом.
 */

export const AI_FIXTURES = {
  chat: "Подскажу по программе: 6 занятий по 90 минут, формат BYOD. Что для вас важнее — документы или аналитика?",

  /** Ответ /api/ai/proposal (роут собирает модули и цены сам, AI даёт тексты) */
  proposal: {
    summary:
      "Вы готовите коммерческие предложения и деловую переписку, ИИ пока не используете.",
    trainingModules: [
      {
        code: "Б1",
        title: "Практическое знакомство с ИИ",
        hours: 4,
        image: "/images/photo_2026-07-17_3.jpg",
        reason: "Даёт базу: постановка задачи, промпты, работа с файлами.",
      },
      {
        code: "П2",
        title: "Деловая переписка и документы",
        hours: 4,
        image: "/images/photo_2026-07-17_4.jpg",
        reason: "Закрывает вашу задачу по письмам и коммерческим предложениям.",
      },
    ],
    totalHours: 8,
    assemblyName: "Профессиональный",
    trainingFormat: "Очно, BYOD, по принципу «демонстрация → применение → результат».",
    trainingCost: {
      lines: [
        {
          label: "Пакет «Профессиональный» — Б1 + Б2 + один профессиональный трек (12 ч, до 20 человек)",
          amount: 6500,
        },
      ],
      total: 6500,
      currency: "BYN",
      streams: 1,
      packageName: "Профессиональный",
      packageComposition: "Б1 + Б2 + один профессиональный трек",
      included: [
        "предварительная настройка программы",
        "практические материалы",
        "итоговая оценка",
        "экспертное заключение для организации",
      ],
      options: [{ label: "П6. Маркетинг", amount: 1900 }],
      isEstimate: false,
    },
    lab: {
      title: "Лаборатория AI-кейсов",
      range: "5 000–9 500 BYN",
      description: "Команды находят и оформляют собственные кейсы применения ИИ.",
    },
    designDevelopment: {
      title: "Проектирование и разработка",
      note: "Стоимость определяется после отдельной оценки задачи.",
      description: "Следующие продуктовые уровни после обучения.",
    },
    nextSteps: [
      "Экспертное заключение по итогам обучения (входит в стоимость)",
      "Лаборатория AI-кейсов или аудит процессов — по желанию",
    ],
    matchScore: 84,
    chatComment: "Готово! Подобрал программу под ваши задачи.",
  },

  /** Ответ /api/ai/objection */
  objection: {
    acknowledgement: "Понимаю, бюджет — важный фактор.",
    answer: "Программа собирается под роль: платите только за нужные модули.",
    businessFocus: "Это напрямую сокращает время на подготовку КП и писем.",
    nextStep: "Предлагаю 30-минутную встречу с экспертом без обязательств.",
  },

  /** Ответ /api/ai/extract-company — данные компании из чата */
  extractCompany: {
    companyName: "ООО Ромашка",
    userRole: "Продажи / коммерческий блок",
    participantCount: 8,
    goals: "ускорить подготовку коммерческих предложений",
  },

  /** Ответ /api/ai/extract-diagnostics — авто-заполнение анкеты из чата */
  extractDiagnostics: {
    matches: [
      {
        qid: "q01",
        options: ["Подготовка коммерческих предложений", "Подготовка писем и деловой переписки"],
        other: "",
        single: false,
      },
      { qid: "q02", options: ["Пока не используют ИИ"], other: "", single: false },
    ],
    notes: "",
  },

  /** Ответ /api/transcribe — распознанная речь */
  transcribe: { text: "хотим автоматизировать подготовку отчётов" },
};

/** Ставит перехват на все AI-роуты. Вызывать до page.goto(). */
export async function mockAi(page: Page) {
  await page.route("**/api/ai/chat", (route) =>
    route.fulfill({ json: { reply: AI_FIXTURES.chat } })
  );
  await page.route("**/api/ai/proposal", (route) =>
    route.fulfill({ json: AI_FIXTURES.proposal })
  );
  await page.route("**/api/ai/objection", (route) =>
    route.fulfill({ json: AI_FIXTURES.objection })
  );
  await page.route("**/api/ai/extract-company", (route) =>
    route.fulfill({ json: AI_FIXTURES.extractCompany })
  );
  await page.route("**/api/ai/extract-diagnostics", (route) =>
    route.fulfill({ json: AI_FIXTURES.extractDiagnostics })
  );
  await page.route("**/api/transcribe", (route) =>
    route.fulfill({ json: AI_FIXTURES.transcribe })
  );
  // Парсинг сайта компании — внешняя сеть, тоже не дёргаем
  await page.route("**/api/parse-site", (route) =>
    route.fulfill({ json: { ok: true, text: "Тестовое описание компании." } })
  );
}

/** Имитация сбоя AI — для проверки дружелюбных сообщений об ошибке. */
export async function mockAiFailure(page: Page, pattern = "**/api/ai/proposal") {
  await page.route(pattern, (route) =>
    route.fulfill({ status: 502, json: { error: "AI недоступен" } })
  );
}
