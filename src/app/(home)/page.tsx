import Link from "next/link";
import VideoSection from "@/components/landing/VideoSection";
import SiteNav from "@/components/landing/SiteNav";
import SiteFooter from "@/components/landing/SiteFooter";
import ContactsSection from "@/components/landing/ContactsSection";
import SolutionsGrid from "@/components/lab/SolutionsGrid";
import { getLabSolutions } from "@/lib/lab/solutions";
import {
  IconSpeed,
  IconKnowledge,
  IconAutomation,
  IconGuide,
  IconTraining,
  IconConsulting,
  IconLab,
  IconTeam,
} from "@/components/icons/BrandIcons";

/**
 * Карточки витрины берутся из базы (правятся в админке). Страница кэшируется,
 * а админка после каждой правки сбрасывает кэш — см. revalidateLabPages().
 */
export const revalidate = 3600;

/** Сколько карточек «Лаборатории решений» показывать на главной */
const TEASER_COUNT = 3;

/* ===== Данные страницы «ВайбМайнд» (структура и тексты перенесены со страницы VibeZmest) ===== */
const BENEFITS = [
  {
    Icon: IconSpeed,
    title: "Повышаем производительность",
    text: "Помогаем быстрее выполнять интеллектуальную работу с помощью ИИ",
  },
  {
    Icon: IconKnowledge,
    title: "Сохраняем экспертные знания",
    text: "Превращаем опыт и накопленную информацию в доступные рабочие знания и ИИ-помощников",
  },
  {
    Icon: IconAutomation,
    title: "Автоматизируем рутину",
    text: "Сокращаем время сотрудников на повторяющиеся действия и рабочие процессы — с использованием ИИ и/или на основе классической автоматизации",
  },
  {
    Icon: IconGuide,
    title: "Развиваем ИИ-компетенции",
    text: "Помогаем специалистам и командам самостоятельно и осмысленно использовать возможности ИИ в работе",
  },
];

const PROCESS = [
  {
    title: "Диагностика и экспертиза",
    tagline: "Чтобы разобраться",
    text: "Изучаем вашу задачу или рабочий процесс, определяем возможности и ограничения применения ИИ и автоматизации.",
  },
  {
    title: "Обучение",
    tagline: "Чтобы научиться",
    text: "Учимся применять ИИ на реальных профессиональных задачах и рабочих материалах.",
  },
  {
    title: "Лаборатория",
    tagline: "Чтобы сделать вместе",
    text: "Проверяем идеи на практике и вместе создаем рабочий прототип решения.",
  },
  {
    title: "Проектирование и разработка",
    tagline: "Чтобы поручить задачу нам",
    text: "Подбираем минимально достаточное решение: от настройки готового инструмента и автоматизации до ИИ-помощника или ИИ-агента. При необходимости подключаем технических партнеров.",
  },
];

const FORMATS = [
  {
    Icon: IconTraining,
    title: "Корпоративное обучение",
    text: "Персональные программы для руководителей, специалистов и команд на основе их реальных задач.",
  },
  {
    Icon: IconConsulting,
    title: "Консалтинг и экспертиза",
    text: "Анализируем задачи, процессы и возможности применения ИИ, готовим рекомендации и экспертные заключения.",
  },
  {
    Icon: IconLab,
    title: "Лаборатория",
    text: "Проверяем идеи и создаем прототипы решений вместе с вашей командой.",
  },
  {
    Icon: IconTeam,
    title: "Проектирование и разработка",
    text: "Подбираем и создаем решения для конкретных рабочих задач — от автоматизации и ИИ-помощников до ИИ-агентов. Сложные технические компоненты при необходимости реализуем с партнерами.",
  },
];

export default async function VibeMindHome() {
  const teaser = await getLabSolutions({ limit: TEASER_COUNT });

  return (
    <main className="bg-mist text-graphite">
      <SiteNav />

      {/* ===== HERO ===== */}
      <header
        id="hero"
        className="vm-hero-network relative isolate overflow-hidden pb-24 pt-36 text-white"
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
        <div className="relative z-10 mx-auto grid max-w-6xl items-center gap-12 px-5 lg:grid-cols-[2fr_3fr]">
          <div className="flex justify-center">
            {/* Полный логотип на прозрачном фоне, вариант для ТЕМНОГО фона hero.
                Буква «Й» в слове «Майнд» — белая: она стоит на градиенте, и любой
                темный вариант там пропадает, слово читается как «Ма нд».
                Рукописное «Вайб» черное — оно лежит поверх бирюзовой фигуры, а не
                на фоне, поэтому читается. На светлом фоне этот файл использовать
                нельзя — там пропадет уже «Й». */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/vibemind-logo-light.png"
              alt="Логотип ВайбМайнд"
              className="h-72 w-auto drop-shadow-2xl md:h-80"
            />
          </div>
          <div>
            {/* Строка над заголовком — в цвет знака ВайбМайнд (#1ca5a8, токен teal) */}
            <p className="text-lg font-medium italic text-teal">
              Социально ответственный интеллектуальный белорусский бизнес
            </p>
            <h1 className="mt-4 text-4xl font-extrabold leading-tight md:text-5xl">
              Помогаем разобраться, где ИИ действительно полезен в вашей работе
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-white/80">
              Исследуем рабочие процессы, находим возможности применения ИИ и автоматизации,
              помогаем выбрать подходящий путь: освоить необходимые для вас инструменты,
              создать ИИ-решение совместно или поручить разработку нам.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <a href="#contacts" className="btn-teal">
                Обсудить задачу
              </a>
              <Link
                href="/course"
                className="inline-flex items-center gap-2 rounded-2xl border border-white/30 px-8 py-4 font-semibold text-white transition-all hover:bg-white/10"
              >
                Корпоративный курс
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* ===== ВИДЕО О КОМПАНИИ ===== */}
      <VideoSection />

      {/* ===== BENEFITS ===== */}
      <section id="benefits" className="py-20">
        <div className="mx-auto max-w-6xl px-5">
          <div className="text-center">
            <h2 className="vm-title">Чем мы полезны</h2>
            <div className="vm-underline" />
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {BENEFITS.map((b) => (
              <div key={b.title} className="vm-card flex h-full flex-col">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal/10 text-teal">
                  <b.Icon className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-lg font-bold text-graphite">{b.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-graphite/70">{b.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== PROCESS ===== */}
      <section id="process" className="bg-white py-20">
        <div className="mx-auto max-w-6xl px-5">
          <div className="text-center">
            <h2 className="vm-title">Как мы работаем</h2>
            <div className="vm-underline" />
            <p className="mx-auto mt-4 max-w-2xl text-graphite/70">
              Выберите нужный вам этап — мы подключимся там, где нужна наша экспертиза
            </p>
          </div>
          {/* Четыре равноправные точки входа, а не цепочка 1→2→3→4. Порядок слева
              направо при желании читается как путь, но каждая карточка самодостаточна. */}
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {PROCESS.map((s) => (
              <div
                key={s.title}
                className="flex flex-col rounded-3xl border border-teal/15 bg-mist p-6"
              >
                <span aria-hidden className="text-xl leading-none text-teal">
                  ✦
                </span>
                <h3 className="mt-3 text-lg font-bold text-graphite">{s.title}</h3>
                <p className="mt-1 text-sm font-semibold text-teal">{s.tagline}</p>
                <p className="mt-2 text-sm leading-relaxed text-graphite/70">{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FORMATS ===== */}
      <section id="formats" className="py-20">
        <div className="mx-auto max-w-6xl px-5">
          <div className="text-center">
            <h2 className="vm-title">Форматы сотрудничества</h2>
            <div className="vm-underline" />
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {FORMATS.map((f) => (
              <div key={f.title} className="vm-card flex h-full flex-col">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal/10 text-teal">
                  <f.Icon className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-lg font-bold text-graphite">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-graphite/70">{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== ЛАБОРАТОРИЯ РЕШЕНИЙ — тизер (вся витрина на /solutions) ===== */}
      <section id="solutions" className="bg-white py-20">
        <div className="mx-auto max-w-6xl px-5">
          <div className="text-center">
            <h2 className="vm-title">Лаборатория решений</h2>
            <div className="vm-underline" />
            <p className="mx-auto mt-4 max-w-3xl text-graphite/70">
              Посмотрите, что мы уже реализовали на практике. Если вам нужен идентичный
              помощник, агент или инструмент — настроим решение под вашу работу и передадим
              вам права по его использованию.
            </p>
          </div>

          <div className="mt-12">
            <SolutionsGrid items={teaser} />
          </div>

          <div className="mt-10 text-center">
            <Link href="/solutions" className="btn-teal">
              Все решения →
            </Link>
          </div>
        </div>
      </section>

      {/* ===== COURSE ===== */}
      <section
        id="course"
        className="py-20 text-white"
        style={{
          background:
            "linear-gradient(135deg, #0e1e1f 0%, #073d3d 60%, #1ca5a8 140%)",
        }}
      >
        <div className="mx-auto max-w-4xl px-5 text-center">
          <h2 className="text-3xl font-bold md:text-4xl">Корпоративный курс по ИИ</h2>
          <div className="mx-auto mt-3 h-1 w-24 rounded-full bg-teal-emerald" />
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-white/80">
            Для большинства организаций цифровая трансформация начинается с формирования
            общего языка и практических навыков работы с ИИ. Персональную программу под вашу
            команду с расчетом стоимости подберет AI-диагностика.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link href="/course" className="btn-teal">
              Перейти к программе курса →
            </Link>
            <Link
              href="/app?new=1"
              className="inline-flex items-center gap-2 rounded-2xl border border-white/30 px-8 py-4 font-semibold text-white transition-all hover:bg-white/10"
            >
              ✨ Пройти AI-диагностику
            </Link>
          </div>
        </div>
      </section>

      {/* ===== ABOUT ===== */}
      <section id="about" className="bg-white py-20">
        <div className="mx-auto max-w-4xl px-5">
          <div className="text-center">
            <h2 className="vm-title">О компании</h2>
            <div className="vm-underline" />
          </div>
          <div className="mt-8 space-y-4 text-lg leading-relaxed text-graphite/75">
            <p>
              <strong className="text-graphite">ВайбМайнд</strong> — социально
              ответственная белорусская компания, которая помогает специалистам, командам и
              организациям осмысленно применять ИИ в реальной работе.
            </p>
            <p>
              Мы исследуем рабочие процессы, обучаем, консультируем и создаем практические
              решения там, где технологии действительно могут дать результат.
            </p>
            <p>
              Наш подход основан на методологии, исследовательской и практической
              экспертизе, ответственном использовании технологий и внимании к людям как
              главной ценности.
            </p>
            <p>
              Наша задача — не создавать зависимость от внешнего подрядчика, а оставлять
              после совместной работы действующее решение, понятный процесс и компетенции
              для его дальнейшего развития.
            </p>
          </div>
        </div>
      </section>

      <ContactsSection />

      <SiteFooter />
    </main>
  );
}
