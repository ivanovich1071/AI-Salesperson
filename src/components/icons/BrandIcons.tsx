/**
 * Фирменные однотонные иконки ВайбМайнд.
 *
 * Стилистика знака: тонкая линия (stroke 1.5) + узелки-точки, как в «сетке» логотипа.
 * Цвет наследуется через currentColor — задавайте его классом (например `text-teal`).
 * Набор переиспользуется на главной и в карточках «Лаборатории решений».
 */

type IconProps = { className?: string };

function Svg({ className = "h-6 w-6", children }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

/* ===== Главная: «Чем мы полезны» ===== */

/** Производительность — импульс с узелками */
export function IconSpeed(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M3 15h3l2.5-7 3 11L14 12h3" />
      <circle cx="20" cy="12" r="1.4" fill="currentColor" stroke="none" />
      <circle cx="3" cy="15" r="1.1" fill="currentColor" stroke="none" />
    </Svg>
  );
}

/** Знания организации — слои базы знаний + узелок */
export function IconKnowledge(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M4 7c0-1.4 3.6-2.5 8-2.5S20 5.6 20 7s-3.6 2.5-8 2.5S4 8.4 4 7Z" />
      <path d="M4 7v5c0 1.4 3.6 2.5 8 2.5s8-1.1 8-2.5V7" />
      <path d="M4 12v5c0 1.4 3.6 2.5 8 2.5s8-1.1 8-2.5v-5" />
      <circle cx="12" cy="7" r="1.2" fill="currentColor" stroke="none" />
    </Svg>
  );
}

/** Автоматизация рутины — цикл со узелками на орбите */
export function IconAutomation(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M20 12a8 8 0 1 1-2.6-5.9" />
      <path d="M20 4v4h-4" />
      <circle cx="12" cy="12" r="2.2" />
      <circle cx="12" cy="4" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="6" cy="18" r="1.2" fill="currentColor" stroke="none" />
    </Svg>
  );
}

/** Сопровождение изменений — маршрут с точками-этапами */
export function IconGuide(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M4 19c3 0 3-6 6-6s3-6 6-6h4" />
      <circle cx="4" cy="19" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="10" cy="13" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="16" cy="7" r="1.5" fill="currentColor" stroke="none" />
    </Svg>
  );
}

/* ===== Главная: «Форматы сотрудничества» ===== */

/** Корпоративное обучение — академическая шапочка */
export function IconTraining(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M12 4 2.5 8.5 12 13l9.5-4.5L12 4Z" />
      <path d="M6 10.5V16c0 1.7 2.7 3 6 3s6-1.3 6-3v-5.5" />
      <circle cx="12" cy="8.5" r="1.2" fill="currentColor" stroke="none" />
    </Svg>
  );
}

/** Консалтинг — идея-узел с расходящимися связями */
export function IconConsulting(p: IconProps) {
  return (
    <Svg {...p}>
      <circle cx="12" cy="9" r="4.5" />
      <path d="M12 13.5V17M9.5 19h5M12 2v1.5M4.7 5.7l1 1M19.3 5.7l-1 1" />
      <circle cx="12" cy="9" r="1.3" fill="currentColor" stroke="none" />
    </Svg>
  );
}

/** Лаборатория решений — колба с узелками (продукты и пилоты) */
export function IconLab(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M9 3h6M10 3v5.5L5.6 16A3 3 0 0 0 8.2 20.5h7.6A3 3 0 0 0 18.4 16L14 8.5V3" />
      <path d="M7.2 14h9.6" />
      <circle cx="10.5" cy="17" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="14" cy="18" r="0.9" fill="currentColor" stroke="none" />
    </Svg>
  );
}

/** Сопровождение команды — люди-узлы в связке */
export function IconTeam(p: IconProps) {
  return (
    <Svg {...p}>
      <circle cx="8" cy="8" r="2.6" />
      <circle cx="16.5" cy="9.5" r="2.1" />
      <path d="M3.5 19c0-2.8 2-4.6 4.5-4.6s4.5 1.8 4.5 4.6" />
      <path d="M14.2 14.8c2.2-.5 4.3 1 4.3 3.4" />
      <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" />
    </Svg>
  );
}

/* ===== Карточки «Лаборатории решений» ===== */

/** Иван — менеджер по продажам (портфель + узелок сделки) */
export function IconSales(p: IconProps) {
  return (
    <Svg {...p}>
      <rect x="3" y="7.5" width="18" height="12" rx="2.5" />
      <path d="M9 7.5V6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v1.5M3 12h18" />
      <circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none" />
    </Svg>
  );
}

/** Бот техподдержки — гарнитура оператора */
export function IconSupport(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M4 13v-1a8 8 0 0 1 16 0v1" />
      <rect x="2.5" y="13" width="4" height="6" rx="1.6" />
      <rect x="17.5" y="13" width="4" height="6" rx="1.6" />
      <path d="M19.5 19v.5a2.5 2.5 0 0 1-2.5 2.5h-3" />
      <circle cx="12" cy="22" r="1" fill="currentColor" stroke="none" />
    </Svg>
  );
}

/** Рецензент — документ под лупой */
export function IconReview(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M13.5 3H6.5A1.5 1.5 0 0 0 5 4.5v15A1.5 1.5 0 0 0 6.5 21H14" />
      <path d="M13.5 3 19 8.5V12M8.5 7.5h5M8.5 11h3" />
      <circle cx="16" cy="16.5" r="3.2" />
      <path d="m18.4 18.9 2.4 2.4" />
    </Svg>
  );
}

/** Запись на приём — календарь с отметкой */
export function IconBooking(p: IconProps) {
  return (
    <Svg {...p}>
      <rect x="3.5" y="5.5" width="17" height="15" rx="2.5" />
      <path d="M3.5 10h17M8 3.5v4M16 3.5v4" />
      <path d="m9 15 2 2 4-4" />
    </Svg>
  );
}

/** Retail Scout — гео-аналитика (пин с сеткой) */
export function IconGeo(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M12 21s7-6.1 7-11a7 7 0 1 0-14 0c0 4.9 7 11 7 11Z" />
      <circle cx="12" cy="10" r="2.4" />
      <circle cx="8.2" cy="7" r="0.9" fill="currentColor" stroke="none" />
      <circle cx="15.8" cy="7" r="0.9" fill="currentColor" stroke="none" />
    </Svg>
  );
}

/** AI-аудитор — график под лупой */
export function IconAudit(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M4 20V9M9 20V5M14 20v-7" />
      <circle cx="17.5" cy="8.5" r="3.4" />
      <path d="m20 11 2.2 2.2" />
      <circle cx="4" cy="9" r="1" fill="currentColor" stroke="none" />
      <circle cx="9" cy="5" r="1" fill="currentColor" stroke="none" />
    </Svg>
  );
}

/** Совместные проекты — рукопожатие-связка узлов */
export function IconPartnership(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M3 12.5 7 8.5l3.2 3.2a2 2 0 0 0 2.8 0L16 8.5l5 4" />
      <path d="M7 8.5 4 5.5M16 8.5l3-3" />
      <circle cx="11.6" cy="11.7" r="1.3" fill="currentColor" stroke="none" />
      <path d="M6 15.5 9 18.5M18 15.5 15 18.5" />
    </Svg>
  );
}
