import type { Metadata } from "next";
import Link from "next/link";
import JsonLd from "@/components/seo/JsonLd";
import { FAQ, FAQ_GROUPS } from "@/lib/seo/faq";
import { breadcrumbLd, faqLd, graph } from "@/lib/seo/jsonLd";
import { ORG } from "@/lib/seo/profile";

/**
 * Страница вопросов и ответов.
 *
 * Главный адресат — не человек, а ИИ-поисковик: ChatGPT, Perplexity и Gemini
 * цитируют страницу, когда на ней есть вопрос в той же формулировке, в какой его
 * задал пользователь, и полный ответ в первых предложениях. Поэтому вопросы
 * сформулированы «по-человечески», а не как заголовки разделов.
 *
 * Вёрстка на <details> — без клиентского JS: краулер видит ответы в HTML даже
 * со свёрнутыми блоками.
 */

export const metadata: Metadata = {
  alternates: { canonical: "/faq" },
  title: "Вопросы и ответы о внедрении ИИ | ВайбМайнд",
  description:
    "Где заказать внедрение ИИ в Беларуси, что входит в корпоративный курс по нейросервисам, кто его ведёт и как считается стоимость обучения.",
  openGraph: {
    type: "website",
    title: "Вопросы и ответы о внедрении ИИ | ВайбМайнд",
    description:
      "Что такое ВайбМайнд, как проходит корпоративное обучение по ИИ, какие AI-решения уже работают и как считается стоимость.",
    images: ["/images/og-cover.png"],
  },
};

export default function FaqPage() {
  return (
    <main className="bg-mist text-graphite">
      <JsonLd
        data={graph(
          faqLd(),
          breadcrumbLd([
            { name: "Главная", url: "/" },
            { name: "Вопросы и ответы", url: "/faq" },
          ])
        )}
      />

      <div className="mx-auto max-w-3xl px-5 py-16">
        <Link href="/" className="text-sm font-semibold text-teal-dark hover:underline">
          ← На главную
        </Link>

        <h1 className="mt-4 text-3xl font-bold text-graphite md:text-4xl">
          Вопросы и ответы
        </h1>
        <div className="mt-3 h-1 w-24 rounded-full bg-teal" />
        <p className="mt-6 text-lg leading-relaxed text-graphite/75">
          Коротко о том, чем занимается {ORG.name}, как проходит корпоративное
          обучение работе с искусственным интеллектом и как заказать AI-ассистента
          под свою задачу. Не нашли ответ — позвоните{" "}
          <a href={`tel:${ORG.phone}`} className="font-semibold text-teal-dark hover:underline">
            {ORG.phoneHuman}
          </a>{" "}
          или напишите в{" "}
          <a
            href={ORG.telegram}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-teal-dark hover:underline"
          >
            Telegram {ORG.telegramHandle}
          </a>
          .
        </p>

        {FAQ_GROUPS.map((group) => {
          const items = FAQ.filter((f) => f.group === group);
          if (items.length === 0) return null;

          return (
            <section key={group} className="mt-12">
              <h2 className="text-xl font-bold text-teal-dark">{group}</h2>
              <div className="mt-4 space-y-3">
                {items.map((item) => (
                  <details
                    key={item.q}
                    className="group rounded-2xl border border-teal/15 bg-white/80 p-5 shadow-sm"
                  >
                    <summary className="cursor-pointer list-none font-semibold text-graphite marker:hidden">
                      <span className="mr-2 text-teal-dark">+</span>
                      {item.q}
                    </summary>
                    <p className="mt-3 leading-relaxed text-graphite/75">{item.a}</p>
                  </details>
                ))}
              </div>
            </section>
          );
        })}

        <div className="mt-14 rounded-3xl border border-teal/15 bg-white/80 p-8 text-center">
          <h2 className="text-xl font-bold text-graphite">
            Подобрать программу под свою организацию
          </h2>
          <p className="mt-3 text-graphite/75">
            AI-диагностика задаст несколько вопросов, соберёт программу под роли
            сотрудников и рассчитает стоимость.
          </p>
          <Link href="/app?new=1" className="btn-teal mt-6">
            ✨ Пройти AI-диагностику →
          </Link>
        </div>

        <p className="mt-10 text-center text-sm text-graphite/60">
          <Link href="/course" className="hover:text-teal">
            Программа курса
          </Link>{" "}
          ·{" "}
          <Link href="/privacy" className="hover:text-teal">
            Политика конфиденциальности
          </Link>
        </p>
      </div>
    </main>
  );
}
