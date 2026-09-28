import type { Metadata } from "next";
import SiteNav from "@/components/landing/SiteNav";
import SiteFooter from "@/components/landing/SiteFooter";
import ContactsSection from "@/components/landing/ContactsSection";
import SolutionsGrid from "@/components/lab/SolutionsGrid";
import JsonLd from "@/components/seo/JsonLd";
import { getLabSolutions } from "@/lib/lab/solutions";
import { breadcrumbLd, graph, productsLd } from "@/lib/seo/jsonLd";

/**
 * /solutions — витрина «Лаборатории решений». Карточки из базы, правятся в
 * админке; после правки админка сбрасывает кэш страницы (revalidateLabPages).
 */
export const revalidate = 3600;

export const metadata: Metadata = {
  alternates: { canonical: "/solutions" },
  title: "Лаборатория решений — готовые AI-ассистенты | ВайбМайнд",
  description:
    "Виртуальные сотрудники ВайбМайнд: продажи и запись клиентов в Telegram, техподдержка на сайте, рецензирование документов, аналитика. Живые демо и адаптация под вашу задачу.",
  openGraph: {
    type: "website",
    title: "Лаборатория решений ВайбМайнд",
    description:
      "Готовые AI-ассистенты и виртуальные сотрудники: что умеют, где посмотреть живое демо, как адаптировать под вашу работу.",
    images: ["/images/og-cover.png"],
  },
};

export default async function SolutionsPage() {
  const items = await getLabSolutions();

  return (
    <main className="bg-mist text-graphite">
      {/* Разметка описывает ровно то, что на странице, — поэтому она здесь, а не на главной */}
      <JsonLd
        data={graph(
          productsLd(items),
          breadcrumbLd([
            { name: "Главная", url: "/" },
            { name: "Лаборатория решений", url: "/solutions" },
          ])
        )}
      />
      <SiteNav />

      <section id="solutions" className="bg-white pb-20 pt-32">
        <div className="mx-auto max-w-6xl px-5">
          <div className="text-center">
            <h1 className="vm-title">Лаборатория решений</h1>
            <div className="vm-underline" />
            <p className="mx-auto mt-4 max-w-3xl text-graphite/70">
              Посмотрите, что мы уже реализовали на практике. Если вам нужен идентичный
              помощник, агент или инструмент — настроим решение под вашу работу и передадим
              вам права по его использованию.
            </p>
          </div>

          {/* Подход к решениям */}
          <div className="mx-auto mt-8 max-w-3xl rounded-3xl border border-teal/15 bg-mist p-8">
            <p className="leading-relaxed text-graphite/80">
              Мы начинаем не с технологии, а с вашего процесса. Иногда достаточно правильно
              настроить готовый инструмент. Иногда нужен ИИ-помощник, который помогает
              человеку думать и работать с информацией. Повторяющиеся действия можно
              передать агенту или автоматизации. А если системе нужно самостоятельно
              разбираться в ситуации и действовать — проектируем ИИ-агента.
            </p>
            <p className="mt-4 leading-relaxed text-graphite/80">
              Ниже — решения, которые мы уже создавали для себя и вместе с коллегами,
              заказчиками и партнерами. Часть из них можно воспроизвести и адаптировать под
              вашу задачу.
            </p>
          </div>

          <div className="mt-12">
            <SolutionsGrid items={items} />
          </div>

          {/* Если готового решения нет — приглашение обсудить свою задачу */}
          <div className="mx-auto mt-12 max-w-3xl rounded-3xl border border-teal/15 bg-mist p-8 text-center">
            <p className="leading-relaxed text-graphite/80">
              <strong className="text-graphite">Не нашли подходящего?</strong> Расскажите,
              какой рабочий процесс занимает много времени или работает неудобно —
              разберемся, что с ним имеет смысл делать.
            </p>
            <a href="#contacts" className="btn-teal mt-6 inline-flex">
              Обсудить задачу
            </a>
          </div>
        </div>
      </section>

      <ContactsSection />
      <SiteFooter />
    </main>
  );
}
