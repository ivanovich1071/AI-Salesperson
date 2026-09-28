import {
  IconAudit,
  IconAutomation,
  IconBooking,
  IconConsulting,
  IconGeo,
  IconKnowledge,
  IconLab,
  IconPartnership,
  IconReview,
  IconSales,
  IconSupport,
  IconTeam,
} from "@/components/icons/BrandIcons";

type Icon = (p: { className?: string }) => JSX.Element;

/**
 * Иконки для карточек без фото. В базе хранится ключ, а не компонент —
 * админка выбирает его из этого списка.
 */
export const LAB_ICONS: Record<string, { label: string; Icon: Icon }> = {
  lab: { label: "Колба (по умолчанию)", Icon: IconLab },
  sales: { label: "Продажи", Icon: IconSales },
  support: { label: "Техподдержка", Icon: IconSupport },
  review: { label: "Рецензия, документы", Icon: IconReview },
  booking: { label: "Запись, календарь", Icon: IconBooking },
  geo: { label: "Гео, локации", Icon: IconGeo },
  audit: { label: "Аудит, аналитика", Icon: IconAudit },
  partnership: { label: "Партнерство", Icon: IconPartnership },
  automation: { label: "Автоматизация", Icon: IconAutomation },
  knowledge: { label: "Знания", Icon: IconKnowledge },
  consulting: { label: "Консалтинг", Icon: IconConsulting },
  team: { label: "Команда", Icon: IconTeam },
};

export function labIcon(key: string): Icon {
  return (LAB_ICONS[key] ?? LAB_ICONS.lab).Icon;
}
