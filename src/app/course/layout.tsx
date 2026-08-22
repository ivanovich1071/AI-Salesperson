import type { Metadata } from "next";
import JsonLd from "@/components/seo/JsonLd";
import { breadcrumbLd, courseLd, graph, personLd } from "@/lib/seo/jsonLd";

export const metadata: Metadata = {
  alternates: { canonical: "/course" },
  title: "Корпоративный курс по нейросервисам и ИИ | Вероника Пунчик",
  description:
    "Авторский курс для организаций по нейросервисам и ИИ от Вероники Пунчик. AI-диагностика подберёт программу под роли ваших сотрудников.",
  keywords: [
    "корпоративный курс по ИИ",
    "обучение нейросетям для организаций",
    "семинар-практикум по искусственному интеллекту",
    "повышение квалификации ИИ Беларусь",
    "Вероника Пунчик",
  ],
  openGraph: {
    type: "website",
    title: "Корпоративный курс по нейросервисам и ИИ | Вероника Пунчик",
    description:
      "Авторский курс для организаций по нейросервисам и ИИ. Пройдите AI-диагностику и получите персональную программу.",
    // Портрет 483×720 в ленте обрезается по центру — баннер 1200×630 читается целиком
    images: ["/images/og-cover.png"],
  },
};

export default function CourseLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Программа, модули и квалификация автора — то, что ИИ-поисковик
          цитирует в ответе на «кто ведёт курс по ИИ для организаций» */}
      <JsonLd
        data={graph(
          courseLd(),
          personLd(),
          breadcrumbLd([
            { name: "Главная", url: "/" },
            { name: "Корпоративный курс", url: "/course" },
          ])
        )}
      />
      {children}
    </>
  );
}
