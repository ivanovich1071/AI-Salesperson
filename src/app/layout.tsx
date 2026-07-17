import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Корпоративный курс по нейросервисам и ИИ | Вероника Пунчик",
  description:
    "Авторский курс для организаций и структурных подразделений по нейросервисам и искусственному интеллекту от Вероники Пунчик. AI-диагностика подберёт персональную программу обучения для вашей компании.",
  openGraph: {
    type: "website",
    title: "Корпоративный курс по нейросервисам и ИИ | Вероника Пунчик",
    description:
      "Авторский курс для организаций по нейросервисам и ИИ. Пройдите AI-диагностику и получите персональную программу.",
    images: ["/images/PVN-v1.jpg"],
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
