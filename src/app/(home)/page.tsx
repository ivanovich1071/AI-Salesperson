"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import VideoSection from "@/components/landing/VideoSection";
import {
  IconSpeed,
  IconKnowledge,
  IconAutomation,
  IconGuide,
  IconTraining,
  IconConsulting,
  IconLab,
  IconTeam,
  IconSales,
  IconSupport,
  IconReview,
  IconBooking,
  IconGeo,
  IconAudit,
  IconPartnership,
} from "@/components/icons/BrandIcons";

/* ===== Данные страницы «ВайбМайнд» (структура и тексты перенесены со страницы VibeZmest) ===== */
const NAV_LINKS = [
  { href: "#benefits", label: "Преимущества" },
  { href: "#process", label: "Как мы работаем" },
  { href: "#formats", label: "Форматы" },
  { href: "#solutions", label: "Решения" },
  { href: "#course", label: "Курс" },
  { href: "#about", label: "О компании" },
  { href: "#contacts", label: "Контакты" },
];

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

/* ===== «Лаборатория решений» — витрина виртуальных сотрудников (перенесена с /course) ===== */
type StatusTone = "live" | "partner" | "ready" | "github" | "soon";

const STATUS_STYLES: Record<StatusTone, string> = {
  live: "bg-emerald-100 text-emerald-700",
  partner: "bg-gold-light text-brown-deep",
  ready: "bg-amber-100 text-amber-700",
  github: "bg-slate-100 text-slate-700",
  soon: "bg-line text-muted",
};

type Product = {
  Icon: (p: { className?: string }) => JSX.Element;
  /** Обложка карточки. Нет фото — карточка показывает иконку, как раньше. */
  photo?: string;
  name: string;
  role: string;
  task: string;
  abilities: string[];
  tags: string[];
  status: string;
  tone: StatusTone;
  liveUrl?: string;
  liveLabel?: string;
  note?: string;
};

const PRODUCTS: Product[] = [
  {
    Icon: IconSales,
    photo: "/images/lab/ivan.jpg",
    name: "Иван",
    role: "Виртуальный менеджер по продажам в Телеграм",
    task: "Ведет первичные продажи и квалифицирует заявки без участия живого менеджера.",
    abilities: [
      "Отвечает на вопросы о продукте и снимает возражения",
      "Квалифицирует лида и собирает контакты",
      "Передает «теплого» клиента менеджеру или записывает на встречу",
    ],
    tags: ["Канал: Telegram", "Для: отделов продаж"],
    status: "Живое демо",
    tone: "live",
    liveUrl: "https://t.me/ELTIKBot",
    liveLabel: "Потыкать в Telegram",
    note: "Флагман лаборатории.",
  },
  {
    Icon: IconSupport,
    photo: "/images/lab/smaipl.jpg",
    name: "Бот SMAIPL",
    role: "Виртуальный специалист техподдержки на сайте",
    task: "Закрывает первую линию техподдержки пользователей в режиме 24/7.",
    abilities: [
      "Отвечает на типовые вопросы пользователей",
      "Проводит по шагам решения проблемы",
      "Эскалирует сложные обращения на человека",
    ],
    tags: ["Канал: веб-сайт", "Для: продуктовых команд"],
    status: "Внедрен у партнера",
    tone: "partner",
    liveUrl: "https://www.smaipl.ru/",
    liveLabel: "Открыть сайт партнера",
    note: "Разработан для партнера SMAIPL.",
  },
  {
    Icon: IconReview,
    photo: "/images/lab/reviewer.jpg",
    name: "Рецензент",
    role: "Виртуальный эксперт-рецензент",
    task: "Проверяет тексты и документы по заданным критериям и дает структурированную рецензию.",
    abilities: [
      "Оценивает материал по чек-листу критериев",
      "Указывает слабые места и предлагает правки",
      "Готовит итоговое заключение",
    ],
    tags: ["Канал: Telegram", "Для: экспертов и редакторов"],
    status: "Готов к внедрению",
    tone: "ready",
    liveUrl: "https://t.me/IIreviewer_bot",
    liveLabel: "Потыкать в Telegram",
  },
  {
    Icon: IconBooking,
    photo: "/images/lab/ilona.jpg",
    name: "Илона",
    role: "Виртуальный администратор — запись на прием",
    task: "Записывает клиентов на прием и управляет расписанием без администратора.",
    abilities: [
      "Показывает свободные слоты и оформляет запись",
      "Отправляет подтверждение и напоминания",
      "Переносит и отменяет визиты",
    ],
    tags: ["Канал: Telegram", "Для: услуг и салонов"],
    status: "Готов к внедрению",
    tone: "ready",
    liveUrl: "https://t.me/ILona_salon_bot",
    liveLabel: "Потыкать в Telegram",
  },
  {
    Icon: IconGeo,
    name: "Retail Scout",
    role: "Виртуальный скаут-аналитик по локациям",
    task: "Оценивает, стоит ли открывать точку по конкретному адресу.",
    abilities: [
      "Гео-анализ: изохроны пешком/авто, конкуренты, демография",
      "Скоринг локации 0–100 и отчет; пакетная загрузка адресов",
      "Внутри — пайплайн из 3 AI-агентов, результаты в реальном времени",
    ],
    tags: ["Стек: Node.js / React / OSM", "Для: развития розничной сети"],
    status: "Исходники на GitHub",
    tone: "github",
    liveUrl: "https://github.com/ivanovich1071/Retail-Scout-Tool",
    liveLabel: "Смотреть на GitHub",
    note: "Живое демо временно снято с сервера, будет задеплоено позже.",
  },
  {
    Icon: IconAudit,
    photo: "/images/lab/auditor.jpg",
    name: "AI Business Auditor",
    role: "Виртуальный AI-консультант по внедрению",
    task: "Сканирует компанию или сайт и показывает, где применимы ИИ-ассистенты.",
    abilities: [
      "Анализирует бизнес по сайту и вводным данным",
      "Находит процессы под автоматизацию ИИ",
      "Формирует рекомендации по внедрению",
    ],
    tags: ["Канал: веб", "Для: руководителей"],
    status: "Живое",
    tone: "live",
    liveUrl: "http://62.60.234.40/",
    liveLabel: "Открыть",
    note: "Пока преимущественно для внутреннего использования.",
  },
  {
    Icon: IconPartnership,
    photo: "/images/lab/otk.jpg",
    name: "Проекты с Наталией",
    role: "Совместные разработки: «Ассистент ОТК»",
    task: "Собирает карты обмера и задания на изготовление прямо по чертежу — за минуты вместо 2–6 часов ручной разметки.",
    abilities: [
      "Читает чертеж и размечает контролируемые размеры",
      "Готовит размеченный JPG, карту обмера в Word и отчет проверки",
      "Нужен там, где контроль ведут вручную по бумажному бланку — без КИМ и сканеров",
    ],
    tags: ["Стек: Python / OpenRouter", "Для: ОТК и технологов"],
    status: "Исходники на GitHub",
    tone: "github",
    liveUrl: "https://github.com/ivanovich1071/otk-assistant",
    liveLabel: "Смотреть на GitHub",
    note: "Совместная разработка с Наталией. Следующие пилоты серии — в работе.",
  },
];

export default function VibeMindHome() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [modalProduct, setModalProduct] = useState<Product | null>(null);

  return (
    <main className="bg-mist text-graphite">
      {/* ===== NAVBAR ===== */}
      <nav className="fixed inset-x-0 top-0 z-40 border-b border-teal/10 bg-mist/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3">
          <a
            href="#hero"
            className="flex shrink-0 items-center gap-2 font-bold text-graphite"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/vibemind-icon.png" alt="ВайбМайнд" className="h-9 w-auto" />
            <span className="whitespace-nowrap">ВайбМайнд</span>
          </a>
          {/* Порог бургер-меню — xl: на ~950px пункты наезжали на логотип */}
          <ul className="hidden items-center gap-5 text-sm font-medium text-graphite/70 xl:flex">
            {NAV_LINKS.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  className="whitespace-nowrap transition-colors hover:text-teal"
                >
                  {l.label}
                </a>
              </li>
            ))}
            <li>
              <Link
                href="/app?new=1"
                className="whitespace-nowrap rounded-2xl px-5 py-2.5 font-semibold text-white shadow-teal transition-all hover:-translate-y-0.5"
                style={{ background: "linear-gradient(135deg, #1ca5a8, #19c9a2)" }}
              >
                AI-диагностика
              </Link>
            </li>
          </ul>
          <button
            className="flex flex-col gap-1.5 p-2 xl:hidden"
            aria-label="Меню"
            onClick={() => setMenuOpen((v) => !v)}
          >
            <span className="h-0.5 w-6 bg-graphite" />
            <span className="h-0.5 w-6 bg-graphite" />
            <span className="h-0.5 w-6 bg-graphite" />
          </button>
        </div>
        {menuOpen && (
          <ul className="border-t border-teal/10 bg-mist px-5 py-4 xl:hidden">
            {NAV_LINKS.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  className="block py-2 font-medium text-graphite/80"
                  onClick={() => setMenuOpen(false)}
                >
                  {l.label}
                </a>
              </li>
            ))}
            <li className="flex flex-col gap-2 pt-2">
              <Link href="/app?new=1" className="btn-teal w-full justify-center">
                AI-диагностика →
              </Link>
              <Link href="/course" className="btn-teal-outline w-full justify-center">
                Корпоративный курс
              </Link>
            </li>
          </ul>
        )}
      </nav>

      {/* ===== HERO ===== */}
      <header
        id="hero"
        className="relative overflow-hidden pb-24 pt-36 text-white"
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
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-5 lg:grid-cols-[2fr_3fr]">
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
              className="h-64 w-auto drop-shadow-2xl md:h-72"
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

      {/* ===== ЛАБОРАТОРИЯ РЕШЕНИЙ ===== */}
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

          {/* Витрина карточек */}
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {PRODUCTS.map((p) => (
              <button
                key={p.name}
                onClick={() => setModalProduct(p)}
                className="vm-card group flex h-full flex-col items-start text-left"
              >
                {p.photo ? (
                  // Обложка выходит за padding карточки: -mx-8/-mt-8 компенсируют p-8
                  <div className="relative -mx-8 -mt-8 self-stretch overflow-hidden rounded-t-3xl">
                    <Image
                      src={p.photo}
                      alt={p.role}
                      width={800}
                      height={600}
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="aspect-[4/3] w-full object-cover"
                    />
                    <span
                      className={`absolute right-3 top-3 rounded-2xl px-3 py-1 text-xs font-semibold shadow-sm ${STATUS_STYLES[p.tone]}`}
                    >
                      {p.status}
                    </span>
                  </div>
                ) : (
                  <div className="flex w-full items-start justify-between gap-3">
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal/10 text-teal">
                      <p.Icon className="h-6 w-6" />
                    </span>
                    <span
                      className={`rounded-2xl px-3 py-1 text-xs font-semibold ${STATUS_STYLES[p.tone]}`}
                    >
                      {p.status}
                    </span>
                  </div>
                )}
                <h3 className={`text-lg font-bold text-graphite ${p.photo ? "mt-6" : "mt-4"}`}>
                  {p.name}
                </h3>
                <p className="mt-1 text-sm text-graphite/70">{p.role}</p>
                <span className="mt-4 text-sm font-semibold text-teal group-hover:underline">
                  Подробнее →
                </span>
              </button>
            ))}
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

      {/* ===== CONTACTS ===== */}
      <section id="contacts" className="py-20">
        <div className="mx-auto max-w-6xl px-5">
          <div className="text-center">
            <h2 className="vm-title">Контакты</h2>
            <div className="vm-underline" />
          </div>
          <div className="mx-auto mt-12 grid max-w-2xl gap-6 sm:grid-cols-2">
            <div className="vm-card text-center">
              <h3 className="font-bold text-teal">Телефон</h3>
              <a
                href="tel:+375297200700"
                className="mt-1 block text-graphite/80 hover:text-teal"
              >
                +375 29 7-200-700
              </a>
            </div>
            <div className="vm-card text-center">
              <h3 className="font-bold text-teal">Telegram</h3>
              <a
                href="https://t.me/vibemindpro"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 block text-graphite/80 hover:text-teal"
              >
                @vibemindpro
              </a>
            </div>
          </div>
          <div className="mt-10 text-center">
            <Link href="/app?new=1" className="btn-teal">
              ✨ Пройти AI-диагностику →
            </Link>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="bg-graphite py-10 text-sm text-white/60">
        <div className="mx-auto max-w-6xl px-5">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div className="flex items-center gap-2 font-bold text-white">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/vibemind-icon.png" alt="ВайбМайнд" className="h-8 w-auto" />
              ВайбМайнд
            </div>
            <div className="flex flex-wrap justify-center gap-5">
              {NAV_LINKS.map((l) => (
                <a key={l.href} href={l.href} className="hover:text-teal">
                  {l.label}
                </a>
              ))}
              <Link href="/faq" className="hover:text-teal">
                Вопросы и ответы
              </Link>
              <Link href="/privacy" className="hover:text-teal">
                Политика конфиденциальности
              </Link>
            </div>
          </div>
          <p className="mt-8 border-t border-white/10 pt-6 text-center">
            © 2025–2026 ВайбМайнд. Все права защищены.
          </p>
        </div>
      </footer>

      {/* ===== МОДАЛКА ПРОДУКТА (Лаборатория решений) ===== */}
      {modalProduct && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-graphite/80 p-6"
          onClick={() => setModalProduct(null)}
        >
          <div
            className="max-h-full w-full max-w-lg overflow-auto rounded-3xl bg-white p-8"
            onClick={(e) => e.stopPropagation()}
          >
            {modalProduct.photo && (
              <div className="-mx-8 -mt-8 mb-6 overflow-hidden rounded-t-3xl">
                <Image
                  src={modalProduct.photo}
                  alt={modalProduct.role}
                  width={800}
                  height={450}
                  sizes="(max-width: 640px) 100vw, 512px"
                  className="aspect-[16/9] w-full object-cover"
                />
              </div>
            )}

            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                {!modalProduct.photo && (
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-teal/10 text-teal">
                    <modalProduct.Icon className="h-6 w-6" />
                  </span>
                )}
                <div>
                  <h3 className="text-xl font-bold text-graphite">{modalProduct.name}</h3>
                  <p className="text-sm text-graphite/70">{modalProduct.role}</p>
                </div>
              </div>
              <button
                onClick={() => setModalProduct(null)}
                aria-label="Закрыть"
                className="text-2xl leading-none text-graphite/50 hover:text-graphite"
              >
                ×
              </button>
            </div>

            <span
              className={`mt-4 inline-block rounded-2xl px-3 py-1 text-xs font-semibold ${STATUS_STYLES[modalProduct.tone]}`}
            >
              {modalProduct.status}
            </span>

            <p className="mt-4 text-graphite/80">{modalProduct.task}</p>

            <h4 className="mt-5 font-bold text-graphite">Что умеет</h4>
            <ul className="mt-2 space-y-2">
              {modalProduct.abilities.map((a) => (
                <li key={a} className="flex gap-2 text-sm text-graphite/75">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-teal" />
                  {a}
                </li>
              ))}
            </ul>

            <div className="mt-4 flex flex-wrap gap-2">
              {modalProduct.tags.map((t) => (
                <span
                  key={t}
                  className="rounded-2xl bg-mist px-3 py-1 text-xs font-medium text-graphite/70"
                >
                  {t}
                </span>
              ))}
            </div>

            {modalProduct.note && (
              <p className="mt-4 text-xs text-graphite/60">{modalProduct.note}</p>
            )}

            <div className="mt-6 flex flex-wrap gap-3">
              {modalProduct.liveUrl && (
                <a
                  href={modalProduct.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-teal !px-6 !py-3 !text-sm"
                >
                  {modalProduct.liveLabel ?? "Открыть"}
                </a>
              )}
              <a
                href="#contacts"
                onClick={() => setModalProduct(null)}
                className="btn-teal-outline !px-6 !py-3 !text-sm"
              >
                Запросить демо
              </a>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
