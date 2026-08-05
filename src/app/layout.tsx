import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ВайбМайнд — внедрение ИИ в организациях",
  description:
    "ВайбМайнд Лаб — социально ответственная белорусская компания: обучаем, консультируем и сопровождаем внедрение ИИ. Готовые AI-решения и виртуальные сотрудники + корпоративный курс по нейросервисам и ИИ.",
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
