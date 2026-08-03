// ============================================================
// КАТАЛОГ УЧЕБНЫХ МОДУЛЕЙ И ЦЕНЫ (продуктовая модель «ВайбЗмест Лаб»)
// Единственное место правки цен. Валюта — белорусский рубль (BYN).
//
// Принцип: стоимость зависит НЕ от числа участников напрямую, а от
// количества потоков, профессиональных групп и повторов занятий.
// AI цены НЕ придумывает — только оформляет посчитанные здесь цифры.
// ============================================================

export const CURRENCY = "BYN";
export const STREAM_SIZE = 20; // максимум участников в одном потоке

// --- Коды учебных модулей (Таблица 2) ---
export type ModuleCode =
  | "Б1" | "Б2"
  | "П1" | "П2" | "П3" | "П4" | "П5" | "П6" | "П7" | "П8"
  | "РУК";

export interface TrainingModule {
  code: ModuleCode;
  title: string;
  hours: number;
  audience: string;
  condition: string;
  image: string; // путь в /public
  kind: "base" | "prof" | "management";
}

export const MODULES: TrainingModule[] = [
  {
    code: "Б1",
    title: "Практическое знакомство с ИИ: задачи, промпты и работа с файлами",
    hours: 4,
    audience: "Все сотрудники",
    condition: "Минимальный модуль для начинающих",
    image: "/images/photo_2026-07-17_3.jpg",
    kind: "base",
  },
  {
    code: "Б2",
    title: "Надёжная работа с ИИ: проверка результатов, данные, безопасность и ограничения",
    hours: 4,
    audience: "Все сотрудники",
    condition: "Обязательно для госсектора и работы с документами или данными",
    image: "/images/photo_2026-07-17_4.jpg",
    kind: "base",
  },
  {
    code: "П1",
    title: "ИИ для управления, процессов и принятия решений",
    hours: 4,
    audience: "Руководители",
    condition: "Управленческие задачи",
    image: "/images/photo_2026-07-17_5.jpg",
    kind: "prof",
  },
  {
    code: "П2",
    title: "Документы, переписка, протоколы и OCR",
    hours: 4,
    audience: "Административные подразделения",
    condition: "Работа с документами и перепиской",
    image: "/images/photo_2026-07-17_3.jpg",
    kind: "prof",
  },
  {
    code: "П3",
    title: "Таблицы, отчёты, данные и аналитические записки",
    hours: 4,
    audience: "Аналитики, финансы, руководители",
    condition: "Отчёты, таблицы и анализ данных",
    image: "/images/photo_2026-07-17_4.jpg",
    kind: "prof",
  },
  {
    code: "П4",
    title: "Договоры, закупки и коммерческие предложения",
    hours: 4,
    audience: "Юристы, закупки, снабжение",
    condition: "Договорная и закупочная работа",
    image: "/images/photo_2026-07-17_5.jpg",
    kind: "prof",
  },
  {
    code: "П5",
    title: "HR, обучение и внутренние коммуникации",
    hours: 4,
    audience: "HR, руководители, методисты",
    condition: "Кадровые, образовательные и внутренние процессы",
    image: "/images/photo_2026-07-17_3.jpg",
    kind: "prof",
  },
  {
    code: "П6",
    title: "Маркетинг, продажи и конкурентная разведка",
    hours: 4,
    audience: "Маркетинг и коммерческие подразделения",
    condition: "Маркетинговые и коммерческие задачи",
    image: "/images/photo_2026-07-17_4.jpg",
    kind: "prof",
  },
  {
    code: "П7",
    title: "ИИ в образовании и исследованиях",
    hours: 4,
    audience: "Вузы и образовательные организации",
    condition: "Образовательная или исследовательская деятельность",
    image: "/images/photo_2026-07-17_5.jpg",
    kind: "prof",
  },
  {
    code: "П8",
    title: "Графика, презентации и видео",
    hours: 4,
    audience: "Маркетинг, обучение, коммуникации",
    condition: "Создание визуального контента",
    image: "/images/photo_2026-07-17_3.jpg",
    kind: "prof",
  },
  {
    code: "РУК",
    title: "Управленческий контур применения ИИ",
    hours: 4,
    audience: "Руководители",
    condition: "Добавляется отдельно, если участвуют руководители",
    image: "/images/photo_2026-07-17_5.jpg",
    kind: "management",
  },
];

export function getModule(code: ModuleCode): TrainingModule | undefined {
  return MODULES.find((m) => m.code === code);
}

// --- Ценовые константы (Таблица 5), BYN ---
export const PRICING = {
  setup: 600, // подготовка и настройка программы, на договор
  finalMeeting: 400, // итоговая встреча + краткие рекомендации, на организацию
  base: {
    Б1: { first: 1200, additional: 700 },
    Б2: { first: 1400, additional: 1000 },
  },
  prof: { first: 1400, additional: 1000 }, // любой П-модуль на проф-группу
  РУК: 1200, // одна группа руководителей
  strategicSession: 1500,
  extendedDocumentFrom: 800,
} as const;

// --- Лаборатория AI-кейсов (Таблица 6) — отдельный продукт ---
export const LAB = {
  title: "Лаборатория AI-кейсов",
  priceMin: 5000,
  priceMax: 9500,
  description:
    "Отдельный продуктовый уровень после обучения или первичной диагностики: 2–4 команды по 3–5 человек находят, проверяют и оформляют собственные кейсы применения ИИ (до 4 командных кейсов). Итог — дорожная карта внедрения ИИ.",
} as const;

// --- Проектирование и Разработка — не считаются автоматически ---
export const DESIGN_DEVELOPMENT = {
  title: "Проектирование и разработка AI-решения",
  note: "Стоимость определяется после отдельной оценки задачи.",
  description:
    "Следующие продуктовые уровни: проектирование (описание сценария, требований, данных, проверок) и разработка (PoC, MVP или готовое решение). Оцениваются отдельно после лаборатории или аудита.",
} as const;

export interface CostLine {
  label: string;
  amount: number;
}
export interface CostBreakdown {
  lines: CostLine[];
  total: number;
  currency: string;
  streams: number;
}

/** Число потоков по числу участников (Таблица 4) */
export function streamsFor(participantCount: number): number {
  const n = Math.max(1, Math.floor(participantCount) || 1);
  return Math.max(1, Math.ceil(n / STREAM_SIZE));
}

/**
 * Детерминированный расчёт стоимости обучения (Уровень 1).
 * Каждый П-модуль = одна профессиональная группа. Базовые Б1/Б2 —
 * первый поток + доп. потоки. Лаборатория/проектирование сюда НЕ входят.
 */
export function calculateTrainingCost(
  moduleCodes: ModuleCode[],
  participantCount: number
): CostBreakdown {
  const streams = streamsFor(participantCount);
  const extra = streams - 1;
  const lines: CostLine[] = [];

  lines.push({ label: "Подготовка и настройка программы", amount: PRICING.setup });

  const streamsLabel =
    streams > 1 ? ` (${streams} потока × до ${STREAM_SIZE} чел.)` : "";

  for (const code of moduleCodes) {
    const m = getModule(code);
    if (!m) continue;

    if (code === "Б1" || code === "Б2") {
      const p = PRICING.base[code];
      lines.push({
        label: `${code}. ${shortTitle(m)}${streamsLabel}`,
        amount: p.first + extra * p.additional,
      });
    } else if (code === "РУК") {
      lines.push({ label: `РУК. ${shortTitle(m)}`, amount: PRICING.РУК });
    } else {
      // профессиональный модуль = одна проф-группа
      lines.push({
        label: `${code}. ${shortTitle(m)}${streamsLabel}`,
        amount: PRICING.prof.first + extra * PRICING.prof.additional,
      });
    }
  }

  lines.push({ label: "Итоговая встреча и краткие рекомендации", amount: PRICING.finalMeeting });

  const total = lines.reduce((s, l) => s + l.amount, 0);
  return { lines, total, currency: CURRENCY, streams };
}

function shortTitle(m: TrainingModule): string {
  return m.title.split(":")[0].split(",")[0].trim();
}

/** Суммарные часы программы */
export function totalHours(moduleCodes: ModuleCode[]): number {
  return moduleCodes.reduce((s, c) => s + (getModule(c)?.hours ?? 0), 0);
}

/** Название готовой сборки (Таблица 3) по составу модулей */
export function assemblyName(moduleCodes: ModuleCode[]): string {
  const set = new Set(moduleCodes);
  const profCount = moduleCodes.filter((c) => getModule(c)?.kind === "prof").length;
  const hasБ1 = set.has("Б1");
  const hasБ2 = set.has("Б2");
  const hasРУК = set.has("РУК");

  if (hasБ1 && hasБ2 && profCount >= 2) return "Углублённое профессиональное обучение";
  if (hasБ1 && hasБ2 && profCount === 1) return "Профессиональное обучение";
  if (hasБ1 && hasБ2) return "Базовое практическое обучение";
  if (hasРУК && !hasБ1) return "Программа для руководителей";
  if (hasБ1) return "Практическое знакомство";
  return "Индивидуальная сборка";
}

export function formatMoney(amount: number): string {
  return `${amount.toLocaleString("ru-RU")} ${CURRENCY}`;
}

export function formatRange(min: number, max: number): string {
  return `${min.toLocaleString("ru-RU")}–${max.toLocaleString("ru-RU")} ${CURRENCY}`;
}

// --- Роли участников (экран 1) ---
export const USER_ROLES = [
  "Руководители",
  "Документооборот / аналитики",
  "HR",
  "Продажи / коммерческий блок",
  "Производство / инженеры",
  "Универсальные специалисты",
] as const;

export type UserRole = (typeof USER_ROLES)[number];
