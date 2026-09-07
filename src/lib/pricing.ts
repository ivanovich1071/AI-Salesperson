// ============================================================
// КАТАЛОГ УЧЕБНЫХ МОДУЛЕЙ И ЦЕНОВАЯ МОДЕЛЬ
// Единственное место правки цен. Валюта — белорусский рубль (BYN).
//
// Действующая модель — почасовая:
//   сумма академических часов всех подобранных модулей до порога
//   включительно — ставка RATES.short за час, выше порога — RATES.long.
//   Стоимость считается за группу до STREAM_SIZE человек; при большем
//   числе участников программа делится на потоки, каждый поток —
//   отдельная группа по той же ставке.
//
// Названия пакетов ниже — подписи сборок для клиента, цену они не несут.
// AI цены НЕ придумывает — только оформляет посчитанные здесь цифры.
// ============================================================

export const CURRENCY = "BYN";
export const STREAM_SIZE = 25; // максимум участников в одной группе

// --- Ставки за академический час (за одну группу) ---
export const RATE_THRESHOLD_HOURS = 8;
export const RATES = { short: 350, long: 250 } as const;

/** Ставка по объему программы: до порога включительно — короткая, выше — длинная */
export function hourlyRate(totalHours: number): number {
  return totalHours <= RATE_THRESHOLD_HOURS ? RATES.short : RATES.long;
}

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
    title: "Надежная работа с ИИ: проверка результатов, данные, безопасность и ограничения",
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
    title: "Таблицы, отчеты, данные и аналитические записки",
    hours: 4,
    audience: "Аналитики, финансы, руководители",
    condition: "Отчеты, таблицы и анализ данных",
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

// --- Названия сборок (подписи для клиента, цену не несут) ---

export type PackageId =
  | "intro"
  | "safeStart"
  | "professional"
  | "advanced"
  | "extended"
  | "managers"
  | "management";

export interface TrainingPackage {
  id: PackageId;
  name: string;
  /** Состав для показа клиенту */
  composition: string;
  hours: number;
}

export const PACKAGES: Record<PackageId, TrainingPackage> = {
  intro: {
    id: "intro",
    name: "Знакомство",
    composition: "Б1",
    hours: 4,
  },
  safeStart: {
    id: "safeStart",
    name: "Безопасный старт",
    composition: "Б1 + Б2",
    hours: 8,
  },
  professional: {
    id: "professional",
    name: "Профессиональный",
    composition: "Б1 + Б2 + один профессиональный трек",
    hours: 12,
  },
  advanced: {
    id: "advanced",
    name: "Углубленный",
    composition: "Б1 + Б2 + два профессиональных трека",
    hours: 16,
  },
  extended: {
    id: "extended",
    name: "Расширенная корпоративная программа",
    composition: "Б1 + Б2 + профессиональные модули для разных подразделений",
    hours: 16,
  },
  managers: {
    id: "managers",
    name: "Для руководителей",
    composition: "РУК",
    hours: 4,
  },
  management: {
    id: "management",
    name: "Управление и внедрение",
    composition: "П1 + РУК",
    hours: 8,
  },
};

/** Что входит в цену любой программы */
export const PACKAGE_INCLUDED = [
  "предварительная настройка программы",
  "практические материалы",
  "итоговая оценка",
  "экспертное заключение для организации",
] as const;

/** Больше 3 групп (75+ человек) — точную сумму не показываем, только «от» */
export const MAX_AUTO_STREAMS = 3;

// --- Прочие ориентиры прайса (в автоматический расчет не входят) ---
export const PRICING = {
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
  /** Часы программы — сумма часов подобранных модулей */
  hours: number;
  /** Ставка за академический час, по которой считалась программа */
  rate: number;
  /** Название сборки (подпись клиента) */
  packageName: string;
  /** Состав сборки для показа клиенту */
  packageComposition: string;
  /** Что входит в цену */
  included: readonly string[];
  /**
   * true — программа вышла за рамки автоподбора (больше 75 человек).
   * Тогда `total` — это «от», а точная сумма считается после встречи.
   */
  isEstimate: boolean;
}

/** Число групп по числу участников: больше STREAM_SIZE — программа делится */
export function streamsFor(participantCount: number): number {
  const n = Math.max(1, Math.floor(participantCount) || 1);
  return Math.max(1, Math.ceil(n / STREAM_SIZE));
}

/**
 * Название и состав сборки по набору модулей — подпись для клиента.
 * Цену сборка не определяет: стоимость считает hourlyRate по сумме часов.
 * Недостающие базовые модули программа «дотягивает» сама (трек всегда
 * идет вместе с Б1 и Б2), поэтому подпись подбирается по составу треков.
 */
export function pickPackage(moduleCodes: ModuleCode[]): TrainingPackage {
  const set = new Set(moduleCodes);
  const tracks = moduleCodes.filter((c) => getModule(c)?.kind === "prof");
  const hasБаза = set.has("Б1") || set.has("Б2");
  const hasРУК = set.has("РУК");

  // Чисто управленческая программа: обучения сотрудников нет
  if (hasРУК && !hasБаза) {
    return tracks.length === 0 ? PACKAGES.managers : PACKAGES.management;
  }
  if (tracks.length >= 3) return PACKAGES.extended;
  if (tracks.length === 2) return PACKAGES.advanced;
  if (tracks.length === 1) return PACKAGES.professional;
  return set.has("Б2") ? PACKAGES.safeStart : PACKAGES.intro;
}

/** Сумма академических часов подобранных модулей — объем программы */
export function totalHours(moduleCodes: ModuleCode[]): number {
  return moduleCodes.reduce((s, c) => s + (getModule(c)?.hours ?? 0), 0);
}

/**
 * Детерминированный расчет стоимости обучения.
 *
 * Объем программы — сумма часов всех подобранных модулей. Ставка за час
 * зависит от объема (hourlyRate). Стоимость считается за одну группу до
 * STREAM_SIZE человек; каждая следующая группа — тот же объем по той же
 * ставке. Лаборатория и проектирование считаются отдельно.
 */
export function calculateTrainingCost(
  moduleCodes: ModuleCode[],
  participantCount: number
): CostBreakdown {
  const streams = streamsFor(participantCount);
  const pkg = pickPackage(moduleCodes);
  const hours = totalHours(moduleCodes);
  const rate = hourlyRate(hours);

  const lines: CostLine[] = [
    {
      label: `Пакет «${pkg.name}» — ${pkg.composition} (${hours} ак. часов × ${rate} ${CURRENCY}/ч, группа до ${STREAM_SIZE} человек)`,
      amount: hours * rate,
    },
  ];

  // Свыше MAX_AUTO_STREAMS групп расчет превращается в оценку «от»:
  // такие программы собираются вручную, а не автоматом.
  const countedStreams = Math.min(streams, MAX_AUTO_STREAMS);
  for (let i = 2; i <= countedStreams; i++) {
    lines.push({
      label: `Группа №${i} (до ${STREAM_SIZE} человек) — тот же объем программы`,
      amount: hours * rate,
    });
  }

  const total = lines.reduce((s, l) => s + l.amount, 0);

  return {
    lines,
    total,
    currency: CURRENCY,
    streams,
    hours,
    rate,
    packageName: pkg.name,
    packageComposition: pkg.composition,
    included: PACKAGE_INCLUDED,
    isEstimate: streams > MAX_AUTO_STREAMS,
  };
}

/** Название сборки по составу модулей */
export function assemblyName(moduleCodes: ModuleCode[]): string {
  return pickPackage(moduleCodes).name;
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
