// ============================================================
// КАТАЛОГ УЧЕБНЫХ МОДУЛЕЙ И ЦЕНЫ (продуктовая модель «ВайбЗмест Лаб»)
// Единственное место правки цен. Валюта — белорусский рубль (BYN).
//
// Цена берётся из ПРОТОКОЛА ПАКЕТОВ (см. PACKAGES ниже), а не собирается
// сложением модулей. Так расчёт не может уехать за опубликованный прайс:
// сколько бы модулей ни подобрала анкета, итог остаётся ценой пакета плюс
// понятные надбавки за дополнительные потоки и контур руководителей.
//
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

// --- ПРОТОКОЛ ЦЕН: линейка пакетов ---
// Цена пакета = один поток до 20 человек. Подготовка программы, практические
// материалы, итоговая оценка и экспертное заключение уже внутри цены и
// отдельными строками НЕ выводятся.

export type PackageId =
  | "intro"
  | "safeStart"
  | "professional"
  | "advanced"
  | "managers"
  | "management";

export interface TrainingPackage {
  id: PackageId;
  name: string;
  /** Состав для показа клиенту */
  composition: string;
  hours: number;
  /** BYN за один поток до 20 человек */
  price: number;
  /** Сколько профессиональных треков уже входит в пакет */
  tracks: number;
}

export const PACKAGES: Record<PackageId, TrainingPackage> = {
  intro: {
    id: "intro",
    name: "Знакомство",
    composition: "Б1",
    hours: 4,
    price: 2400,
    tracks: 0,
  },
  safeStart: {
    id: "safeStart",
    name: "Безопасный старт",
    composition: "Б1 + Б2",
    hours: 8,
    price: 4500,
    tracks: 0,
  },
  professional: {
    id: "professional",
    name: "Профессиональный",
    composition: "Б1 + Б2 + один профессиональный трек",
    hours: 12,
    price: 6500,
    tracks: 1,
  },
  advanced: {
    id: "advanced",
    name: "Углублённый",
    composition: "Б1 + Б2 + два профессиональных трека",
    hours: 16,
    price: 8400,
    tracks: 2,
  },
  managers: {
    id: "managers",
    name: "Для руководителей",
    composition: "РУК",
    hours: 4,
    price: 2800,
    tracks: 0,
  },
  management: {
    id: "management",
    name: "Управление и внедрение",
    composition: "П1 + РУК",
    hours: 8,
    price: 4900,
    tracks: 1,
  },
};

/** Что входит в цену любого учебного пакета */
export const PACKAGE_INCLUDED = [
  "предварительная настройка программы",
  "практические материалы",
  "итоговая оценка",
  "экспертное заключение для организации",
] as const;

export const ADDONS = {
  /** Трек сверх пакета: ровно разница «Углублённый» − «Профессиональный» */
  extraTrack: 1900,
  /** Контур руководителей поверх программы сотрудников — отдельная группа */
  managersLoop: 2800,
} as const;

/**
 * Доля цены пакета за каждый следующий поток (2-й, 3-й, дальше — хвост).
 * Повтор практики дешевле первого проведения: программа уже собрана.
 */
const STREAM_FACTORS = [1, 0.6, 0.55] as const;
const STREAM_FACTOR_TAIL = 0.5;

/** Автоподбор не кладёт в итог больше двух треков — это потолок протокола */
export const MAX_AUTO_TRACKS = 2;
/** Больше 60 человек — точную сумму не показываем, только «от» */
export const MAX_AUTO_STREAMS = 3;
/** Страховка от любого неожиданного разбега */
export const MAX_AUTO_TOTAL = 25000;

// --- Прочие ориентиры прайса (в автоматический расчёт не входят) ---
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
export interface CostOption {
  label: string;
  amount: number;
}
export interface CostBreakdown {
  lines: CostLine[];
  total: number;
  currency: string;
  streams: number;
  /** Название пакета из протокола цен */
  packageName: string;
  /** Состав пакета для показа клиенту */
  packageComposition: string;
  /** Что входит в цену пакета */
  included: readonly string[];
  /** Треки сверх пакета: показываем как опции, в сумму НЕ включаем */
  options: CostOption[];
  /**
   * true — программа вышла за рамки протокола (больше 60 человек или
   * необычно дорогая сборка). Тогда `total` — это «от», а точная сумма
   * считается после встречи.
   */
  isEstimate: boolean;
}

/** Число потоков по числу участников (Таблица 4) */
export function streamsFor(participantCount: number): number {
  const n = Math.max(1, Math.floor(participantCount) || 1);
  return Math.max(1, Math.ceil(n / STREAM_SIZE));
}

export interface PackageSelection {
  pkg: TrainingPackage;
  /** Профессиональные треки внутри пакета */
  tracks: ModuleCode[];
  /** Треки сверх пакета — предлагаются опционально */
  extraTracks: ModuleCode[];
  /** Нужен ли отдельный контур руководителей поверх программы сотрудников */
  managersLoop: boolean;
}

/**
 * Подбор пакета из протокола по набору модулей.
 * Пакет — это готовая позиция прайса, поэтому недостающие базовые модули
 * он «дотягивает» сам (например, трек всегда идёт вместе с Б1 и Б2).
 */
export function pickPackage(moduleCodes: ModuleCode[]): PackageSelection {
  const set = new Set(moduleCodes);
  const tracks = moduleCodes.filter((c) => getModule(c)?.kind === "prof");
  const hasБаза = set.has("Б1") || set.has("Б2");
  const hasРУК = set.has("РУК");

  // Чисто управленческая программа: обучения сотрудников нет
  if (hasРУК && !hasБаза) {
    if (tracks.length === 0) {
      return { pkg: PACKAGES.managers, tracks: [], extraTracks: [], managersLoop: false };
    }
    // П1 — профильный трек руководителей, поэтому он и попадает в пакет
    const primary = tracks.includes("П1") ? "П1" : tracks[0];
    return {
      pkg: PACKAGES.management,
      tracks: [primary],
      extraTracks: tracks.filter((c) => c !== primary),
      managersLoop: false,
    };
  }

  const inPackage = tracks.slice(0, MAX_AUTO_TRACKS);
  const extraTracks = tracks.slice(MAX_AUTO_TRACKS);
  const managersLoop = hasРУК;

  let pkg: TrainingPackage;
  if (inPackage.length >= 2) pkg = PACKAGES.advanced;
  else if (inPackage.length === 1) pkg = PACKAGES.professional;
  else if (set.has("Б2")) pkg = PACKAGES.safeStart;
  else pkg = PACKAGES.intro;

  return { pkg, tracks: inPackage, extraTracks, managersLoop };
}

/** Округление до сотни: в прайсе нет цен вида 3 575 */
function round100(amount: number): number {
  return Math.round(amount / 100) * 100;
}

function streamFactor(index: number): number {
  return STREAM_FACTORS[index - 1] ?? STREAM_FACTOR_TAIL;
}

/**
 * Детерминированный расчёт стоимости обучения (Уровень 1).
 *
 * Основа — цена пакета из протокола. Сверху только два вида надбавок:
 * дополнительные потоки (каждые следующие 20 человек, дешевле первого)
 * и отдельный контур руководителей. Треки сверх пакета в сумму не идут —
 * они уходят в `options`. Лаборатория и проектирование считаются отдельно.
 */
export function calculateTrainingCost(
  moduleCodes: ModuleCode[],
  participantCount: number,
  /** Треки, отложенные автоподбором (см. selectProgram) — идут в опции */
  deferredTracks: ModuleCode[] = []
): CostBreakdown {
  const streams = streamsFor(participantCount);
  const picked = pickPackage(moduleCodes);
  const { pkg, managersLoop } = picked;
  const extraTracks = Array.from(new Set([...picked.extraTracks, ...deferredTracks]));
  const lines: CostLine[] = [
    {
      label: `Пакет «${pkg.name}» — ${pkg.composition} (${pkg.hours} ч, до ${STREAM_SIZE} человек)`,
      amount: pkg.price,
    },
  ];

  // Свыше MAX_AUTO_STREAMS потоков расчёт превращается в оценку «от»:
  // такие программы собираются вручную, а не автоматом.
  const countedStreams = Math.min(streams, MAX_AUTO_STREAMS);
  for (let i = 2; i <= countedStreams; i++) {
    lines.push({
      label: `Дополнительный поток №${i} (до ${STREAM_SIZE} человек)`,
      amount: round100(pkg.price * streamFactor(i)),
    });
  }

  if (managersLoop) {
    lines.push({
      label: "Контур руководителей: отдельная группа (РУК)",
      amount: ADDONS.managersLoop,
    });
  }

  const total = lines.reduce((s, l) => s + l.amount, 0);
  const options: CostOption[] = extraTracks.map((code) => {
    const m = getModule(code);
    return {
      label: `${code}. ${m ? shortTitle(m) : code}`,
      amount: ADDONS.extraTrack,
    };
  });

  return {
    lines,
    total,
    currency: CURRENCY,
    streams,
    packageName: pkg.name,
    packageComposition: pkg.composition,
    included: PACKAGE_INCLUDED,
    options,
    isEstimate: streams > MAX_AUTO_STREAMS || total > MAX_AUTO_TOTAL,
  };
}

function shortTitle(m: TrainingModule): string {
  return m.title.split(":")[0].split(",")[0].trim();
}

/** Часы программы — по пакету, а не по сумме подобранных модулей */
export function totalHours(moduleCodes: ModuleCode[]): number {
  return pickPackage(moduleCodes).pkg.hours;
}

/** Название пакета из протокола цен по составу модулей */
export function assemblyName(moduleCodes: ModuleCode[]): string {
  return pickPackage(moduleCodes).pkg.name;
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
