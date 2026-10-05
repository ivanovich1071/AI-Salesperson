import Link from "next/link";
import VideoSection from "@/components/landing/VideoSection";
import SiteNav from "@/components/landing/SiteNav";
import SiteFooter from "@/components/landing/SiteFooter";
import ContactsSection from "@/components/landing/ContactsSection";
import SolutionsGrid from "@/components/lab/SolutionsGrid";
import { getLabSolutions } from "@/lib/lab/solutions";

/**
 * Карточки витрины берутся из базы (правятся в админке). Страница кэшируется,
 * а админка после каждой правки сбрасывает кэш — см. revalidateLabPages().
 */
export const revalidate = 3600;

const TEASER_COUNT = 3;

const START_SCENARIOS = [
  {
    title: "«Мы вообще не знаем, что нам нужно»",
    text: "Начнем с людей и рабочих процессов. Оценим компетенции и готовность команды, изучим реальные задачи и определим, где ИИ действительно может быть полезен",
  },
  {
    title: "«Хотим научить команду»",
    text: "Построим обучение вокруг вашей работы. Профессионалы осваивают ИИ на реальных задачах, а вместе с ними мы выявляем процессы, которые можно улучшить или автоматизировать",
  },
  {
    title: "«ИИ уже используем, но бессистемно и эффекта не видим»",
    text: "Разберемся, что действительно работает, а что создает лишние действия. Соберем инициативы в дорожную карту: что внедрять, что автоматизировать, чему обучить людей и в какой последовательности двигаться",
  },
  {
    title: "«У нас есть конкретная задача»",
    text: "Разберем процесс и найдем минимально достаточное решение – от готового ИИ-инструмента до автоматизации или собственного решения",
  },
];

const PROCESS_STEPS = [
  {
    title: "Диагностируем",
    text: "Изучаем не только процессы, но и людей: задачи, компетенции, готовность команды, корпоративную культуру и организационные ограничения",
  },
  {
    title: "Обучаем на вашей работе",
    text: "Профессионалы развивают компетенции работы с ИИ на собственных задачах. Одновременно выявляем процессы, которые стоит изменить, упростить или автоматизировать",
  },
  {
    title: "Создаем дорожную карту изменений",
    text: "Определяем, что сотрудники могут делать самостоятельно, где достаточно готового ИИ-инструмента, что стоит автоматизировать, а где требуется отдельное решение",
  },
  {
    title: "Движемся по ней вместе",
    text: "Помогаем менять процессы, внедрять инструменты, автоматизировать отдельные операции и создавать прикладные ИИ-решения. При необходимости сложной технической реализации подключаем партнеров",
  },
  {
    title: "Оставляем компетенции внутри команды",
    text: "Передаем решение и знания о том, как с ним работать и развивать дальше. Наша задача – усилить команду, а не сделать ее зависимой от подрядчика",
  },
];

const TRUSTED = [
  "БелАЗ",
  "ООО «Евроторг»",
  "Белорусская православная церковь (отдел по делам молодежи)",
  "АО ЭЛТИ-КУДИЦ",
  "LLC Newm-Limited",
  "SMAIPL",
  "Клуб Правильного Питания",
];

const ROADMAP_OUTCOMES = [
  "Готовый ИИ-инструмент",
  "Автоматизировать часть",
  "Разработать решение",
  "Ничего не внедрять",
];

export default async function VibeMindHome() {
  const teaser = await getLabSolutions({ limit: TEASER_COUNT });

  return (
    <main className="bg-mist text-graphite">
      <SiteNav />

      {/* ===== ПЕРВЫЙ ЭКРАН ===== */}
      <header
        id="hero"
        className="vm-hero-network relative isolate overflow-hidden pb-12 pt-24 text-white md:pb-20 md:pt-32"
        style={{
          background:
            "linear-gradient(90deg, #111111 0%, #111111 34%, #0e1e1f 66%, #073d3d 100%)",
        }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute right-[8%] top-[18%] h-96 w-96 rounded-full bg-teal/20 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-32 left-1/4 h-80 w-80 rounded-full bg-teal-emerald/15 blur-3xl"
        />
        <div className="relative z-10 mx-auto grid max-w-6xl items-center gap-6 px-5 lg:grid-cols-[2fr_3fr] lg:gap-10">
          <div className="flex justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/vibemind-logo-light.png"
              alt="Логотип ВайбМайнд"
              className="h-56 w-auto drop-shadow-2xl sm:h-64 md:h-80"
            />
          </div>
          <div>
            <p className="text-base font-medium italic text-teal md:text-lg">
              Социально ответственный интеллектуальный белорусский бизнес
            </p>
            <h1 className="mt-4 text-3xl font-extrabold leading-[1.08] sm:text-4xl md:text-5xl">
              ИИ, который усиливает профессионалов и команды
            </h1>
            <p className="mt-4 text-base font-medium italic text-teal md:text-lg">
              <span className="block">Работаем с ИИ</span>
              <span className="block">Ориентируемся на людей</span>
            </p>
            <p className="mt-5 text-base leading-relaxed text-white/80 md:mt-6 md:text-lg">
              Обучаем профессионалов работать с ИИ на реальных задачах. Вместе находим
              процессы для улучшения и автоматизации, создаем дорожную карту изменений и
              помогаем пройти ее – от первых инструментов до собственных ИИ-решений
            </p>
            <p className="mt-4 max-w-3xl text-sm font-semibold leading-relaxed text-white md:text-base">
              Можно пройти весь путь вместе с нами или начать с того этапа, который нужен
              вам сейчас
            </p>
          </div>
        </div>
      </header>

      {/* ===== С ЧЕГО НАЧАТЬ ===== */}
      <section id="start" className="vm-section-fade vm-soft-boundary py-16">
        <div className="mx-auto max-w-6xl px-5">
          <div className="text-center">
            <h2 className="vm-title">Неважно, сколько вы уже знаете об ИИ</h2>
            <div className="vm-underline" />
            <p className="mx-auto mt-4 max-w-2xl text-lg text-graphite/70">
              Начнем с того места, где находится ваша команда сейчас
            </p>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {START_SCENARIOS.map((scenario, index) => (
              <article key={scenario.title} className="vm-card vm-compact-card h-full">
                <span className="text-sm font-bold text-teal">0{index + 1}</span>
                <h3 className="mt-3 text-lg font-bold leading-snug text-graphite">
                  {scenario.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-graphite/70">
                  {scenario.text}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ===== СОЦИАЛЬНОЕ ДОКАЗАТЕЛЬСТВО ===== */}
      <section className="vm-trust-band vm-soft-boundary py-10 text-white" aria-labelledby="trusted-title">
        <div className="mx-auto max-w-6xl px-5 text-center">
          <h2 id="trusted-title" className="text-3xl font-bold md:text-4xl">
            Нам доверяют
          </h2>
          <p className="mx-auto mt-5 max-w-5xl text-lg font-semibold leading-loose text-white/85 md:text-xl">
            {TRUSTED.join(" · ")}
          </p>
          <p className="mt-3 font-semibold text-teal-emerald">
            А также индивидуальные предприниматели и независимые профессионалы
          </p>
        </div>
      </section>

      {/* ===== МЕТОД ВАЙБМАЙНД ===== */}
      <section id="process" className="vm-soft-boundary bg-white py-16">
        <div className="mx-auto max-w-7xl px-5">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal">
              Как мы работаем
            </p>
            <h2 className="vm-title mt-2">От людей и рабочих задач – к работающим решениям</h2>
            <div className="vm-underline" />
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            {PROCESS_STEPS.map((step, index) => (
              <article
                key={step.title}
                className="vm-process-card relative flex h-full flex-col rounded-3xl border border-teal/15 bg-mist p-5"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-teal to-teal-emerald text-sm font-bold text-white shadow-teal">
                  {index + 1}
                </span>
                <h3 className="mt-4 font-bold leading-snug text-graphite">{step.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-graphite/70">{step.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ===== ДОРОЖНАЯ КАРТА ===== */}
      <section className="vm-roadmap-section vm-soft-boundary py-14 text-white" aria-labelledby="roadmap-title">
        <div className="mx-auto max-w-6xl px-5">
          <div className="text-center">
            <h2 id="roadmap-title" className="text-3xl font-bold md:text-4xl">
              Дорожная карта изменений
            </h2>
          </div>
          <div className="mt-8 grid items-center gap-4 lg:grid-cols-[1fr_auto_1.25fr_auto_2fr]">
            <div className="vm-roadmap-node">Обучить</div>
            <span aria-hidden className="vm-roadmap-arrow">→</span>
            <div className="vm-roadmap-node">Изменить процесс</div>
            <span aria-hidden className="vm-roadmap-arrow">→</span>
            <div className="grid gap-2 sm:grid-cols-2">
              {ROADMAP_OUTCOMES.map((outcome) => (
                <div key={outcome} className="vm-roadmap-result">
                  {outcome}
                </div>
              ))}
            </div>
          </div>
          <p className="mx-auto mt-8 max-w-4xl text-center text-lg font-bold">
            Не внедряем ИИ ради ИИ. Находим, где он действительно усиливает работу
          </p>
          <p className="mx-auto mt-3 max-w-4xl text-center leading-relaxed text-white/72">
            Учитываем не только возможности технологий, но и правила вашей организации,
            политику безопасности, корпоративную культуру и людей, которым предстоит с этим
            работать
          </p>
          <div className="mx-auto mt-7 max-w-4xl rounded-3xl border border-white/15 bg-white/5 px-6 py-5 text-center backdrop-blur">
            <p className="font-bold">Не обязательно проходить весь путь</p>
            <p className="mt-2 text-sm leading-relaxed text-white/75">
              Если задача уже понятна – начнем с нее. Если пока непонятно, что именно может
              дать ИИ, – разберемся вместе
            </p>
          </div>
        </div>
      </section>

      {/* ===== ЧЕЛОВЕКОЦЕНТРИЧНЫЙ ТЕЗИС ===== */}
      <section className="vm-soft-boundary px-5 py-10">
        <p className="mx-auto max-w-5xl text-center text-3xl font-extrabold leading-tight text-graphite md:text-5xl">
          <span className="block">ИИ не вместо профессионала</span>
          <span className="block text-teal">ИИ – в руках профессионала</span>
        </p>
      </section>

      {/* ===== ПЕРЕХОД К ЛАБОРАТОРИИ ===== */}
      <section className="vm-soft-boundary bg-white py-14">
        <div className="mx-auto max-w-4xl px-5 text-center">
          <h2 className="text-3xl font-bold md:text-4xl">Не каждой задаче нужен собственный ИИ</h2>
          <p className="mt-5 text-lg leading-relaxed text-graphite/75">
            Иногда достаточно готового инструмента. Иногда нужно изменить процесс или
            автоматизировать его часть. Иногда нужен собственный ИИ-помощник. А иногда лучше
            вообще ничего не внедрять
          </p>
          <p className="mt-4 font-bold text-graphite">
            Мы ищем не самое технологичное, а наиболее подходящее решение
          </p>
          <p className="mt-4 font-semibold text-teal">
            А решения, которые уже доказали свою применимость, собираем в Лаборатории решений
          </p>
        </div>
      </section>

      {/* ===== ЛАБОРАТОРИЯ РЕШЕНИЙ ===== */}
      <section id="solutions" className="vm-section-fade vm-soft-boundary py-16">
        <div className="mx-auto max-w-6xl px-5">
          <div className="text-center">
            <h2 className="vm-title">Лаборатория решений</h2>
            <div className="vm-underline" />
            <p className="mx-auto mt-4 max-w-3xl text-xl font-bold text-graphite">
              Возможно, часть вашего пути мы уже прошли
            </p>
            <p className="mx-auto mt-4 max-w-3xl leading-relaxed text-graphite/70">
              Здесь мы собираем решения, созданные для реальных рабочих задач. Их можно
              изучить, попробовать и адаптировать под ваш процесс – обычно быстрее и
              доступнее, чем создавать решение с нуля
            </p>
          </div>
          <div className="mt-10">
            <SolutionsGrid
              items={teaser}
              cardCta={{ label: "Адаптировать под мою задачу", href: "/app?new=1" }}
            />
          </div>
          <div className="mt-8 text-center">
            <Link href="/solutions" className="btn-teal">
              Перейти в Лабораторию решений
            </Link>
          </div>
        </div>
      </section>

      {/* ===== ОБУЧЕНИЕ ===== */}
      <section id="training" className="vm-training-band vm-soft-boundary py-16 text-white">
        <div className="mx-auto max-w-4xl px-5 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-emerald">
            Программы обучения
          </p>
          <h2 className="mt-3 text-3xl font-bold md:text-4xl">
            Обучение, после которого остается больше, чем знания
          </h2>
          <p className="mx-auto mt-5 max-w-3xl text-lg leading-relaxed text-white/80">
            Работаем с реальными задачами вашей команды. Профессионалы осваивают инструменты
            ИИ и развивают собственные компетенции, а вместе с ними мы выявляем процессы,
            которые можно улучшить или автоматизировать
          </p>
          <p className="mx-auto mt-4 max-w-3xl font-bold leading-relaxed text-white">
            Результатом обучения могут стать не только новые навыки, но и конкретные
            инициативы для дорожной карты изменений
          </p>
          <Link href="/course" className="btn-teal mt-7">
            Посмотреть программы обучения
          </Link>
        </div>
      </section>

      {/* ===== О КОМПАНИИ ===== */}
      <section id="about" className="vm-soft-boundary bg-white py-16">
        <div className="mx-auto max-w-4xl px-5">
          <div className="text-center">
            <h2 className="vm-title">О компании</h2>
            <div className="vm-underline" />
          </div>
          <div className="mt-8 space-y-4 text-lg leading-relaxed text-graphite/75">
            <p className="font-bold text-graphite">
              ВайбМайнд – белорусская компания об ИИ, технологиях и прежде всего о людях,
              которые с ними работают
            </p>
            <p>
              Мы не начинаем с вопроса «какую нейросеть внедрить». Начинаем с
              профессионалов, их опыта и реальных рабочих процессов
            </p>
            <p>
              Диагностируем, обучаем, помогаем выстроить дорожную карту изменений и вместе
              создаем решения – так, чтобы ИИ усиливал компетенции людей и команд
            </p>
            <p>
              Учитываем процессы, корпоративную культуру, требования безопасности и правила
              конкретной организации
            </p>
            <p className="font-bold text-teal">
              <span className="block">Работаем с ИИ</span>
              <span className="block">Ориентируемся на людей</span>
            </p>
          </div>
        </div>
      </section>

      {/* ===== FAQ ===== */}
      <section className="vm-faq-teaser vm-soft-boundary py-12" aria-labelledby="faq-teaser-title">
        <div className="mx-auto grid max-w-6xl items-center gap-8 px-5 md:grid-cols-[1.2fr_0.8fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal">
              Полезно знать
            </p>
            <h2 id="faq-teaser-title" className="mt-2 text-3xl font-bold md:text-4xl">
              Вопросы и ответы о работе с ИИ
            </h2>
            <p className="mt-4 max-w-2xl leading-relaxed text-graphite/70">
              Как начать, если задача пока не сформулирована? Что происходит во время
              обучения? Можно ли адаптировать готовое решение? Собрали подробные ответы на
              вопросы, которые чаще всего возникают перед началом работы
            </p>
          </div>
          <div className="md:text-right">
            <Link href="/faq" className="btn-teal">
              Открыть вопросы и ответы
            </Link>
          </div>
        </div>
      </section>

      <VideoSection />

      <ContactsSection consultation />

      <SiteFooter />
    </main>
  );
}
