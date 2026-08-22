import type { Metadata } from "next";
import "./globals.css";
import JsonLd from "@/components/seo/JsonLd";
import { graph, organizationLd, websiteLd } from "@/lib/seo/jsonLd";
import { SITE_URL } from "@/lib/seo/profile";

/**
 * Базовый адрес сайта берём из общего профиля (`src/lib/seo/profile.ts`) — тем же
 * значением подписаны llms.txt, identity.json и разметка Schema.org, иначе они
 * разъедутся. Next разворачивает по нему относительные ссылки на картинки: без
 * metadataBase в OG-превью уезжает localhost, и мессенджеры показывают битую
 * картинку вместо логотипа.
 */

/**
 * Превью для соцсетей и мессенджеров. Ровно 1200×630 — иначе Telegram, LinkedIn
 * и Facebook обрежут картинку или покажут крошечный квадрат вместо баннера.
 */
const OG_IMAGE = {
  url: "/images/og-cover.png",
  width: 1200,
  height: 630,
  alt: "ВайбМайнд — внедрение ИИ в организациях",
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  alternates: {
    canonical: "/",
    types: {
      // Краткий «паспорт» сайта для языковых моделей — см. src/lib/seo/llms.ts
      "text/plain": `${SITE_URL}/llms.txt`,
    },
  },
  title: "ВайбМайнд — внедрение ИИ в организациях",
  // Держим в пределах ~160 символов: длиннее Google и Яндекс обрезают многоточием
  description:
    "ВайбМайнд — белорусская компания: обучаем, консультируем и сопровождаем внедрение ИИ в организациях. Готовые AI-ассистенты и курс по нейросервисам.",
  applicationName: "ВайбМайнд",
  keywords: [
    "внедрение ИИ в организации",
    "корпоративное обучение ИИ",
    "нейросервисы для бизнеса",
    "AI-ассистент под задачу",
    "чат-бот для компании",
    "искусственный интеллект Беларусь",
    "ВайбМайнд",
    "VibeMind",
  ],
  authors: [{ name: "ВайбМайнд", url: SITE_URL }],
  creator: "ВайбМайнд",
  publisher: "ВайбМайнд",
  // Явное разрешение поисковикам: часть из них считает молчание запретом
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "ru_RU",
    siteName: "ВайбМайнд",
    url: SITE_URL,
    title: "ВайбМайнд — внедрение ИИ в организациях",
    description:
      "Обучаем, консультируем и сопровождаем цифровую трансформацию рабочих процессов. Готовые AI-решения и корпоративный курс.",
    images: [OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: "ВайбМайнд — внедрение ИИ в организациях",
    description:
      "Обучаем, консультируем и сопровождаем внедрение ИИ. Готовые AI-решения и корпоративный курс по нейросервисам.",
    images: [OG_IMAGE.url],
  },
  /**
   * Коды подтверждения прав в Google Search Console и Яндекс.Вебмастере.
   * Без них нельзя отправить sitemap и следить за индексацией. Значения — из
   * окружения: в репозитории им не место, на сервере они добавляются в .env.
   */
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
    yandex: process.env.YANDEX_VERIFICATION,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <head>
        {/* Кто мы и что это за сайт — фактура для ИИ-поисковиков на каждой странице.
            Разметка конкретного контента (решения, курс, FAQ) живёт в layout-ах разделов. */}
        <JsonLd data={graph(organizationLd(), websiteLd())} />
      </head>
      <body>{children}</body>
    </html>
  );
}
