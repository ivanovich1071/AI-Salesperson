import type { Metadata } from "next";

/**
 * Все CTA на сайте ведут на `/app?new=1` (сброс стора для нового клиента).
 * Для поисковиков это отдельный адрес: без canonical Google и Яндекс индексируют
 * `/app` и `/app?new=1` как две страницы с одинаковым содержимым и делят между
 * ними вес.
 */
export const metadata: Metadata = {
  alternates: { canonical: "/app" },
  title: "AI-диагностика: подбор программы обучения по ИИ | ВайбМайнд",
  description:
    "Ответьте на несколько вопросов о компании — AI-диагностика подберёт модули обучения под роли сотрудников, рассчитает стоимость и запишет на встречу.",
};

export default function WizardLayout({ children }: { children: React.ReactNode }) {
  return children;
}
