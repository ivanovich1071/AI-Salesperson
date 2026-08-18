import type { Metadata } from "next";
import "./globals.css";

/**
 * Базовый адрес сайта. Нужен Next, чтобы разворачивать относительные ссылки на
 * картинки в абсолютные: без него в OG-превью уезжает localhost, и мессенджеры
 * показывают битую картинку вместо логотипа.
 */
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://vibemind.by";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  alternates: { canonical: "/" },
  title: "ВайбМайнд — внедрение ИИ в организациях",
  description:
    "ВайбМайнд — социально ответственная белорусская компания: обучаем, консультируем и сопровождаем внедрение ИИ. Готовые AI-решения и виртуальные сотрудники + корпоративный курс по нейросервисам и ИИ.",
  openGraph: {
    type: "website",
    title: "ВайбМайнд — внедрение ИИ в организациях",
    description:
      "Обучаем, консультируем и сопровождаем цифровую трансформацию рабочих процессов. Готовые AI-решения и корпоративный курс.",
    images: ["/images/vibemind-icon.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
