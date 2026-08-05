"use client";

import { useState } from "react";
import Link from "next/link";
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
    text: "Помогаем сотрудникам быстрее выполнять интеллектуальную работу",
  },
  {
    Icon: IconKnowledge,
    title: "Сохраняем знания организации",
    text: "Превращаем опыт сотрудников в доступные базы знаний и AI-помощников",
  },
  {
    Icon: IconAutomation,
    title: "Автоматизируем рутину",
    text: "Сокращаем время на документы, поиск информации, отчёты и коммуникации",
  },
  {
    Icon: IconGuide,
    title: "Сопровождаем изменения",
    text: "Помогаем внедрять ИИ как рабочий инструмент организации",
  },
];

const PROCESS = [
  { n: "1", title: "Диагностика", text: "Изучаем задачи и процессы организации" },
  { n: "2", title: "Обучение", text: "Показываем практические сценарии применения ИИ" },
  { n: "3", title: "Лаборатория решений", text: "Запускаем первое рабочее решение" },
  { n: "4", title: "Масштабирование", text: "Распространяем успешный опыт на другие процессы" },
];

const FORMATS = [
  {
    Icon: IconTraining,
    title: "Корпоративное обучение",
    text: "Программы для руководителей и сотрудников",
  },
  {
    Icon: IconConsulting,
    title: "Консалтинг",
    text: "Поиск точек роста и возможностей применения ИИ",
  },
  {
    Icon: IconLab,
    title: "Лаборатория решений",
    text: "Создание и запуск AI-ботов, ассистентов и автоматизированных процессов",
  },
  {
    Icon: IconTeam,
    title: "Сопровождение команды",
    text: "Поддержка команды на этапе изменений",
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
    name: "Иван",
    role: "Виртуальный менеджер по продажам в Телеграм",
    task: "Ведёт первичные продажи и квалифицирует заявки без участия живого менеджера.",
    abilities: [
      "Отвечает на вопросы о продукте и снимает возражения",
      "Квалифицирует лида и собирает контакты",
      "Передаёт «тёплого» клиента менеджеру или записывает на встречу",
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
    name: "Бот SMAIPL",
    role: "Виртуальный специалист техподдержки на сайте",
    task: "Закрывает первую линию техподдержки пользователей в режиме 24/7.",
    abilities: [
      "Отвечает на типовые вопросы пользователей",
      "Проводит по шагам решения проблемы",
      "Эскалирует сложные обращения на человека",
    ],
    tags: ["Канал: веб-сайт", "Для: продуктовых команд"],
    status: "Внедрён у партнёра",
    tone: "partner",
    liveUrl: "https://www.smaipl.ru/",
    liveLabel: "Открыть сайт партнёра",
    note: "Разработан для партнёра SMAIPL.",
  },
  {
    Icon: IconReview,
    name: "Рецензент",
    role: "Виртуальный эксперт-рецензент",
    task: "Проверяет тексты и документы по заданным критериям и даёт структурированную рецензию.",
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
    name: "Илона",
    role: "Виртуальный администратор — запись на приём",
    task: "Записывает клиентов на приём и управляет расписанием без администратора.",
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
      "Скоринг локации 0–100 и отчёт; пакетная загрузка адресов",
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
    name: "Проекты с Наталией",
    role: "Совместные разработки",
    task: "Серия совместных пилотов — состав и роли уточняются.",
    abilities: ["Состав решений уточняется", "Кейсы будут добавлены"],
    tags: ["Пилотные проекты"],
    status: "Скоро",
    tone: "soon",
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
      {/* Светлый фон — под оригинальный логотип: в нём надпись «Вайб» чёрная
          и на тёмном фоне не читалась. Текст секции, соответственно, тёмный. */}
      <header
        id="hero"
        className="relative overflow-hidden pb-24 pt-36 text-graphite"
        style={{
          background:
            "linear-gradient(90deg, #ffffff 0%, #f7fafa 45%, #e6f4f4 100%)",
        }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute right-[8%] top-[18%] h-96 w-96 rounded-full bg-teal/15 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-32 left-1/4 h-80 w-80 rounded-full bg-teal-emerald/10 blur-3xl"
        />
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-5 lg:grid-cols-[2fr_3fr]">
          <div className="flex justify-center">
            {/* Оригинальный логотип автора (прозрачный фон, цвета не менялись) */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/vibemind-logo-full.png"
              alt="Логотип ВайбМайнд"
              className="h-64 w-auto md:h-72"
            />
          </div>
          <div>
            <p className="text-lg font-medium italic text-teal-dark">
              Социально ответственный интеллектуальный белорусский бизнес
            </p>
            <h1 className="mt-4 text-4xl font-extrabold leading-tight text-graphite md:text-5xl">
              Диагностируем, консультируем и сопровождаем цифровую трансформацию рабочих
              процессов
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-graphite/75">
              Помогаем командам внедрять ИИ в реальную деятельность организации — от
              делегирования рутины и автоматизации до собственных виртуальных сотрудников.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <a href="#contacts" className="btn-teal">
                Обсудить задачу
              </a>
              <Link href="/course" className="btn-teal-outline">
                Корпоративный курс
              </Link>
            </div>
          </div>
        </div>
      </header>

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
          </div>
          {/* Стрелка — отдельный элемент МЕЖДУ карточками (раньше падала под карточку
              из-за lg:flex-col у обёртки). На мобильном скрыта. */}
          <div className="mt-12 flex flex-col items-stretch gap-4 lg:flex-row">
            {PROCESS.map((s, i) => (
              <div key={s.n} className="contents">
                <div className="flex flex-1 flex-col rounded-3xl border border-teal/15 bg-mist p-6 lg:text-center">
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-full text-lg font-bold text-white lg:mx-auto"
                    style={{ background: "linear-gradient(135deg, #1ca5a8, #19c9a2)" }}
                  >
                    {s.n}
                  </div>
                  <h3 className="mt-4 text-lg font-bold text-graphite">{s.title}</h3>
                  <p className="mt-2 text-sm text-graphite/70">{s.text}</p>
                </div>
                {i < PROCESS.length - 1 && (
                  <div
                    aria-hidden
                    className="hidden shrink-0 items-center self-center text-2xl text-teal lg:flex"
                  >
                    →
                  </div>
                )}
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
              Готовые AI-решения и виртуальные сотрудники — внедрим у вас, доработаем под
              задачу или научим вашу команду собирать самим.
            </p>
          </div>

          {/* Манифест */}
          <div className="mx-auto mt-8 max-w-3xl rounded-3xl border border-teal/15 bg-mist p-8">
            <p className="leading-relaxed text-graphite/80">
              AI — главное слово года, и компании массово «лепят» ИИ-агентов, получая на
              выходе лоскутное одеяло из разрозненных решений. Мы идём иначе: начинаем не с
              кода, а с воркшопа — отсеиваем хайп, находим повторяемые процессы и превращаем
              их в <strong className="text-graphite">виртуальных сотрудников</strong>. Ниже —
              те, кого мы уже собрали: с клиентами и для себя. Любого можно внедрить у вас,
              доработать под ваши процессы — или научить вашу команду делать такое самой.
              Мы не агентство: строим вместе и оставляем компетенции внутри компании.
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
                <h3 className="mt-4 text-lg font-bold text-graphite">{p.name}</h3>
                <p className="mt-1 text-sm text-graphite/70">{p.role}</p>
                <span className="mt-4 text-sm font-semibold text-teal group-hover:underline">
                  Подробнее →
                </span>
              </button>
            ))}
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
            команду с расчётом стоимости подберёт AI-диагностика.
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
              ответственная белорусская компания, которая помогает организациям{" "}
              <strong className="text-graphite">осмысленно внедрять ИИ</strong>. Мы обучаем,
              консультируем и сопровождаем изменения, чтобы современные технологии усиливали
              профессиональную экспертизу, сохраняли и развивали знания организаций, повышали
              производительность интеллектуального труда и приносили реальную пользу людям,
              командам и обществу.
            </p>
            <p>
              Наш подход основан на методологии, практическом опыте, ответственном
              использовании технологий и внимании к{" "}
              <strong className="text-graphite">
                людям как главной ценности любой организации
              </strong>
              .
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
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-teal/10 text-teal">
                  <modalProduct.Icon className="h-6 w-6" />
                </span>
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
