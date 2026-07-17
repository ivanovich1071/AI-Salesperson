// ============================================================
// КАТАЛОГ МОДУЛЕЙ И ЦЕНЫ — единственное место, где правятся цены.
// Валюта: белорусский рубль (BYN). Цены предварительные, по указанию
// заказчика: ~1000 / 1300 / 1500 BYN за запуск модулей 1/2/3.
// Цена за участника взята пропорционально исходному ТЗ (~12% от запуска);
// поменяйте perParticipant ниже, если нужна другая раскладка.
// ============================================================

export type ModuleId = "intro" | "practice" | "consulting";

export interface ProgramModule {
  id: ModuleId;
  title: string;
  duration: string;
  format: string;
  description: string;
  image: string; // путь в /public
  launchPrice: number; // BYN, фиксированная часть за запуск
  perParticipant: number; // BYN за каждого участника (0 = фикс. цена)
}

export const CURRENCY = "BYN";

export const MODULES: ProgramModule[] = [
  {
    id: "intro",
    title: "Вводный интенсив-модуль (12 ч)",
    duration: "12 академических часов — 6 занятий по 90 минут",
    format: "Очно (предпочтительно) / дистанционно, BYOD-практикум",
    description:
      "Основы работы с нейросетями, промпт-инжиниринг, автоматизация работы с документами и данными, кейс-практикум на реальных задачах компании.",
    image: "/images/photo_2026-07-17_3.jpg",
    launchPrice: 1000,
    perParticipant: 120,
  },
  {
    id: "practice",
    title: "Практический модуль по созданию продукта",
    duration: "2–4 часа в неделю (ориентировочно)",
    format: "Дистанционно, групповая и индивидуальная работа",
    description:
      "Глубокая проработка реальных кейсов компании, создание прототипов корпоративных ИИ-ассистентов (на базе SM AI PL и др.), интеграция в рабочие процессы.",
    image: "/images/photo_2026-07-17_4.jpg",
    launchPrice: 1300,
    perParticipant: 160,
  },
  {
    id: "consulting",
    title: "Консалтинг и руководство проектами",
    duration: "По запросу",
    format: "Индивидуальное сопровождение",
    description:
      "Индивидуальная разработка дорожной карты внедрения ИИ, аудит процессов, сопровождение пилотного проекта.",
    image: "/images/photo_2026-07-17_5.jpg",
    launchPrice: 1500,
    perParticipant: 0, // фиксированная цена за проект
  },
];

export interface CostLine {
  label: string;
  amount: number;
}

export interface CostBreakdown {
  lines: CostLine[];
  total: number;
  currency: string;
}

/**
 * Детерминированный расчет стоимости на бэкенде.
 * AI цены НЕ придумывает — он только оформляет эти цифры.
 */
export function calculateCost(
  moduleIds: ModuleId[],
  participantCount: number
): CostBreakdown {
  const lines: CostLine[] = [];
  const n = Math.max(1, Math.floor(participantCount) || 1);

  for (const id of moduleIds) {
    const m = MODULES.find((x) => x.id === id);
    if (!m) continue;
    if (m.perParticipant > 0) {
      lines.push({ label: `${m.title} — запуск`, amount: m.launchPrice });
      lines.push({
        label: `${m.title} — ${n} участ. × ${m.perParticipant} ${CURRENCY}`,
        amount: n * m.perParticipant,
      });
    } else {
      lines.push({ label: `${m.title} (фиксировано)`, amount: m.launchPrice });
    }
  }

  const total = lines.reduce((s, l) => s + l.amount, 0);
  return { lines, total, currency: CURRENCY };
}

export function formatMoney(amount: number): string {
  return `${amount.toLocaleString("ru-RU")} ${CURRENCY}`;
}

/** Краткое описание цен для отображения на карточке модуля */
export function modulePriceLabel(m: ProgramModule): string {
  if (m.perParticipant > 0) {
    return `${m.launchPrice.toLocaleString("ru-RU")} ${CURRENCY} запуск + ${m.perParticipant.toLocaleString("ru-RU")} ${CURRENCY}/участник`;
  }
  return `${m.launchPrice.toLocaleString("ru-RU")} ${CURRENCY} за проект (фиксировано)`;
}

export const USER_ROLES = [
  "Руководители",
  "Документооборот / аналитики",
  "HR",
  "Продажи / коммерческий блок",
  "Производство / инженеры",
  "Универсальные специалисты",
] as const;

export type UserRole = (typeof USER_ROLES)[number];
