"use client";

import { useState } from "react";
import Link from "next/link";

/* ===== Мини-иконки (inline SVG вместо Font Awesome) ===== */
const CheckIcon = () => (
  <svg viewBox="0 0 24 24" className="mt-1 h-4 w-4 shrink-0 fill-gold">
    <path d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z" />
  </svg>
);
const BrainIcon = ({ className = "h-6 w-6" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={`fill-current ${className}`}>
    <path d="M12 2a4 4 0 0 0-4 4 4 4 0 0 0-3 6.6A4 4 0 0 0 8 19a4 4 0 0 0 4 3 4 4 0 0 0 4-3 4 4 0 0 0 3-6.4A4 4 0 0 0 16 6a4 4 0 0 0-4-4Zm0 2a2 2 0 0 1 2 2v12a2 2 0 1 1-4 0V6a2 2 0 0 1 2-2Z" />
  </svg>
);

const NAV_LINKS = [
  { href: "#home", label: "Главная" },
  { href: "#about", label: "О курсе" },
  { href: "#program", label: "Программа" },
  { href: "#benefits", label: "AI-навыки" },
  { href: "#author", label: "Автор" },
  { href: "#contact", label: "Контакты" },
];

// Продуктовые уровни для витрины лендинга (описательно, независимо от каталога модулей)
const PRODUCT_LEVELS = [
  {
    title: "Практическое обучение",
    subtitle: "Модули Б1, Б2, П1–П8, РУК · по 4 ч",
    image: "/images/photo_2026-07-17_3.jpg",
    topics: [
      "Базовые модули: задачи, промпты, работа с файлами, проверка результатов и безопасность",
      "Профессиональные модули под роль: документы, данные, HR, продажи, управление и др.",
      "Экспертное заключение по итогам обучения",
    ],
  },
  {
    title: "Лаборатория AI-кейсов",
    subtitle: "Отдельный продукт после обучения",
    image: "/images/photo_2026-07-17_4.jpg",
    topics: [
      "Команды находят, проверяют и оформляют собственные кейсы применения ИИ",
      "До 4 командных кейсов за цикл",
      "Итог — дорожная карта внедрения ИИ",
    ],
  },
  {
    title: "Проектирование и разработка",
    subtitle: "Следующие продуктовые уровни",
    image: "/images/photo_2026-07-17_5.jpg",
    topics: [
      "Проектирование: сценарий, требования, данные, проверки",
      "Разработка: PoC, MVP или готовое решение",
      "Стоимость — после отдельной оценки задачи",
    ],
  },
];

const CERTIFICATES = [
  { src: "/images/cert-prompt-engineer.jpg", label: "Промпт-инженер (Университет Зерокодинга)" },
  { src: "/images/cert-cisco.jpg", label: "Cisco IT Essentials" },
  { src: "/images/cert-docent.jpg", label: "Доцент по специальности «Педагогика»" },
  { src: "/images/cert-phd.jpg", label: "Кандидат педагогических наук" },
];

const SKILLS = [
  {
    title: "Ключевые навыки",
    text: "Освоите работу с ведущими AI-моделями (ChatGPT, Gemini, Qwen, DeepSeek, Kimi, GigaChat, YandexGPT и др.), агрегаторами и ключевыми нейросервисами",
  },
  {
    title: "Рабочее окружение и доступ",
    text: "Овладеете пошаговым алгоритмом регистрации, настройки и подготовки своего рабочего места (BYOD) для немедленной и эффективной работы с нейросетями",
  },
  {
    title: "Разработка AI-помощников",
    text: "Освоите методологию автоматизации (коллекция промптов, чат-боты, ассистенты)",
  },
  {
    title: "Готовые AI-решения",
    text: "Создадите работающий кейс автоматизации, полностью адаптированный под вашу профессиональную деятельность (от промпта до бота и пайплайна)",
  },
  {
    title: "Постоянная поддержка",
    text: "Получите консультации преподавателя и доступ к актуальным методическим материалам через онлайн-дашборд",
  },
];

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [modalCert, setModalCert] = useState<{ src: string; label: string } | null>(null);

  return (
    <main className="bg-milk">
      {/* ===== NAVBAR ===== */}
      <nav className="fixed inset-x-0 top-0 z-40 border-b border-line bg-milk/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3">
          <a href="#home" className="flex items-center gap-2 font-bold text-brown-deep">
            <span className="text-gold"><BrainIcon /></span>
            <span>Корпоративный AI Курс</span>
          </a>
          <ul className="hidden items-center gap-6 text-sm font-medium text-brown-light lg:flex">
            {NAV_LINKS.map((l) => (
              <li key={l.href}>
                <a href={l.href} className="transition-colors hover:text-gold">
                  {l.label}
                </a>
              </li>
            ))}
            <li>
              <Link
                href="/app?new=1"
                className="rounded-2xl bg-gold px-5 py-2.5 font-semibold text-brown-deep shadow-gold transition-all hover:bg-gold-hover"
              >
                AI-диагностика
              </Link>
            </li>
          </ul>
          <button
            className="flex flex-col gap-1.5 p-2 lg:hidden"
            aria-label="Меню"
            onClick={() => setMenuOpen((v) => !v)}
          >
            <span className="h-0.5 w-6 bg-brown-deep" />
            <span className="h-0.5 w-6 bg-brown-deep" />
            <span className="h-0.5 w-6 bg-brown-deep" />
          </button>
        </div>
        {menuOpen && (
          <ul className="border-t border-line bg-milk px-5 py-4 lg:hidden">
            {NAV_LINKS.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  className="block py-2 font-medium text-brown-light"
                  onClick={() => setMenuOpen(false)}
                >
                  {l.label}
                </a>
              </li>
            ))}
            <li className="pt-2">
              <Link href="/app?new=1" className="btn-primary w-full justify-center">
                Пройти AI-диагностику →
              </Link>
            </li>
          </ul>
        )}
      </nav>

      {/* ===== HERO ===== */}
      <section
        id="home"
        className="relative overflow-hidden bg-gradient-to-br from-brown-deep via-[#4E342E] to-brown-light pb-24 pt-36 text-milk"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-gold/10 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-40 left-1/4 h-80 w-80 rounded-full bg-gold/10 blur-3xl"
        />
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-5 lg:grid-cols-[3fr_2fr]">
          <div>
            <h1 className="text-4xl font-extrabold leading-tight md:text-5xl">
              <span className="text-gold">+30% к эффективности команды.</span>{" "}
              Делегирование задач ИИ: от рутины к экспертным решениям
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-milk/85">
              Обучение сотрудников: от делегирования ИИ документов, отчётов, писем и сбора
              аналитики — до создания чат-ботов, автоматизированных пайплайнов и
              медиаконтента. Авторский корпоративный курс с сопровождением эксперта по ИИ,
              к.п.н., члена Комитета по искусственному интеллекту{" "}
              <a
                href="https://nfai.ru/"
                target="_blank"
                rel="noopener noreferrer"
                className="underline decoration-gold underline-offset-2"
              >
                НФИИ
              </a>{" "}
              (РФ)
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/app?new=1" className="btn-primary">
                🚀 Пройти AI-диагностику →
              </Link>
              <a
                href="#about"
                className="inline-flex items-center gap-2 rounded-2xl border border-milk/30 px-8 py-4 font-semibold text-milk transition-all hover:bg-milk/10"
              >
                Узнать больше
              </a>
            </div>
            <p className="mt-4 text-sm text-milk/60">
              За несколько минут AI изучит вашу задачу и подготовит персональную программу
              обучения с расчётом стоимости
            </p>
          </div>
          <div className="hidden justify-center lg:flex">
            <div className="flex h-64 w-64 items-center justify-center rounded-full border border-gold/40 bg-gold/10 text-gold shadow-gold">
              <BrainIcon className="h-32 w-32" />
            </div>
          </div>
        </div>
      </section>

      {/* ===== ABOUT ===== */}
      <section id="about" className="py-20">
        <div className="mx-auto max-w-6xl px-5">
          <div className="text-center">
            <h2 className="section-title">О курсе</h2>
            <div className="title-underline" />
          </div>
          <p className="mx-auto mt-8 max-w-4xl text-center text-lg leading-relaxed text-muted">
            О нейросетях сегодня говорят все. Но чаще — в контексте малого бизнеса,
            маркетинга или фриланса. Этот курс — иной ракурс: он ориентирован на повышение
            эффективности работы сотрудников в организациях, на предприятиях и в
            госсекторе. Курс{" "}
            <strong className="text-brown-deep">
              «Нейросервисы и системы искусственного интеллекта: от основ к экспертным
              решениям»
            </strong>{" "}
            — интенсивная программа для обучения специалистов{" "}
            <strong className="text-brown-deep">на базе вашего предприятия</strong>,
            адаптированная под реальные задачи сотрудников. Обучение строится на
            практических кейсах в сфере профессиональной деятельности — от упрощения
            рутинных процессов до внедрения интеллектуальных решений. При выборе
            AI-инструментария учитываются{" "}
            <strong className="text-brown-deep">
              корпоративная политика безопасности, особенности использования VPN и доступ к
              рабочему окружению
            </strong>
            .{" "}
            <span className="font-semibold text-gold">
              Искусственный интеллект доступнее, чем кажется — достаточно сделать первый шаг
              с опытным наставником
            </span>
          </p>

          <div className="mt-12 grid gap-6 md:grid-cols-2">
            <div className="card p-8">
              <h3 className="text-xl font-bold text-brown-deep">
                Гибкая адаптация программы под запрос организации
              </h3>
              <p className="mt-3 text-muted">
                Обучение в группах одной организации или отрасли позволяет адаптировать
                курс под:
              </p>
              <ul className="mt-4 space-y-2">
                {["Профессию", "Уровень цифровой культуры", "Инфраструктуру организации"].map(
                  (t) => (
                    <li key={t} className="flex gap-2 text-brown-light">
                      <CheckIcon /> {t}
                    </li>
                  )
                )}
              </ul>
            </div>
            <div className="card p-8">
              <h3 className="text-xl font-bold text-brown-deep">Для кого этот курс</h3>
              <ul className="mt-4 space-y-2">
                {[
                  "Руководители — оптимизация бизнес-процессов",
                  "Педагоги — внедрение ИИ в образовательную среду",
                  "Аналитики — анализ данных и прогнозирование",
                  "Маркетологи — автоматизация и персонализация",
                  "Инженеры — решение технических задач",
                  "Для всех, кто хочет повысить эффективность и оптимизировать рутину",
                ].map((t) => (
                  <li key={t} className="flex gap-2 text-brown-light">
                    <CheckIcon /> {t}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ===== PROGRAM ===== */}
      <section id="program" className="bg-white py-20">
        <div className="mx-auto max-w-6xl px-5">
          <div className="text-center">
            <h2 className="section-title">Программа обучения</h2>
            <div className="title-underline" />
            <p className="mx-auto mt-4 max-w-2xl text-muted">
              От практического обучения до проектирования решений. Персональную программу
              под вашу команду с расчётом стоимости подберёт AI-диагностика.
            </p>
          </div>
          <div className="mt-12 grid gap-8 lg:grid-cols-3">
            {PRODUCT_LEVELS.map((m, i) => (
              <div key={m.title} className="card group flex flex-col overflow-hidden">
                <div className="relative h-48 overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={m.image}
                    alt={m.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-brown-deep/60 to-transparent" />
                  <span className="absolute left-4 top-4 rounded-2xl bg-gold px-3 py-1 text-sm font-bold text-brown-deep shadow-gold">
                    0{i + 1}
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <h3 className="text-lg font-bold text-brown-deep">{m.title}</h3>
                  <p className="mt-1 text-sm font-medium text-gold">{m.subtitle}</p>
                  <ul className="mt-4 flex-1 space-y-2">
                    {m.topics.map((t) => (
                      <li key={t} className="flex gap-2 text-sm text-brown-light">
                        <CheckIcon /> {t}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link href="/app?new=1" className="btn-primary">
              Подобрать модули под мою команду →
            </Link>
          </div>
        </div>
      </section>

      {/* ===== BENEFITS / SKILLS ===== */}
      <section id="benefits" className="py-20">
        <div className="mx-auto max-w-6xl px-5">
          <div className="text-center">
            <h2 className="section-title">Формируемые AI-навыки</h2>
            <div className="title-underline" />
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {SKILLS.map((s) => (
              <div key={s.title} className="card p-7">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gold-light text-brown-deep">
                  <BrainIcon />
                </div>
                <h3 className="mt-4 text-lg font-bold text-brown-deep">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== AUTHOR ===== */}
      <section id="author" className="bg-white py-20">
        <div className="mx-auto max-w-6xl px-5">
          <div className="text-center">
            <h2 className="section-title">Автор и ключевой спикер курса</h2>
            <div className="title-underline" />
          </div>

          <div className="mt-12 flex flex-col gap-10 lg:flex-row">
            <div className="shrink-0 text-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/PVN-v1.jpg"
                alt="Вероника Пунчик"
                className="mx-auto w-64 rounded-3xl border-4 border-gold shadow-gold"
              />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-brown-deep">
                Вероника Николаевна Пунчик
              </h3>
              <p className="mt-1 font-semibold text-gold">
                Бизнес-аналитик, методолог AI-решений, кандидат педагогических наук, доцент
              </p>
              <div className="mt-4 space-y-4 leading-relaxed text-muted">
                <p>
                  Исследователь, разработчик AI-решений для цифровой трансформации
                  образования, бизнеса, организаций и профессиональных сообществ. Автор
                  более{" "}
                  <strong className="text-brown-deep">
                    250 научных и учебно-методических публикаций
                  </strong>
                  . Индекс Хирша РИНЦ — <strong className="text-brown-deep">10</strong>.
                </p>
                <p>
                  С IT — через всю жизнь: от детского увлечения программированием и
                  вычислительной техникой в 1985 году до современных проектов в области
                  искусственного интеллекта, автоматизации и бизнес-аналитики через{" "}
                  <strong className="text-brown-deep">
                    промпт-инжиниринг (Университет Зерокодинга, резидент Сколково)
                  </strong>
                  .
                </p>
                <p>
                  <strong className="text-brown-deep">
                    25 лет инновационной педагогической деятельности:
                  </strong>{" "}
                  от ассистента кафедры педагогики БГПУ до профессора кафедры молодежной
                  политики РИВШ.
                </p>
              </div>
            </div>
          </div>

          {/* Сертификаты */}
          <div className="mt-14">
            <h4 className="text-center text-xl font-bold text-brown-deep">
              Дипломы и сертификаты
            </h4>
            <div className="mt-6 grid grid-cols-2 gap-6 md:grid-cols-4">
              {CERTIFICATES.map((c) => (
                <button
                  key={c.src}
                  className="card overflow-hidden p-3 text-left transition-transform hover:-translate-y-1"
                  onClick={() => setModalCert(c)}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={c.src}
                    alt={c.label}
                    className="h-40 w-full rounded-2xl object-cover"
                  />
                  <p className="mt-2 text-center text-xs font-medium text-brown-light">
                    {c.label}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Партнёры */}
          <div className="mt-12 space-y-6">
            <div>
              <h4 className="font-bold text-brown-deep">Партнёры и организации:</h4>
              <div className="mt-3 flex flex-wrap gap-2">
                <a href="https://smaipl.ru/" target="_blank" rel="noopener noreferrer">
                  <span className="rounded-2xl bg-gold-light px-4 py-2 text-sm font-semibold text-brown-deep">
                    SMAIPL
                  </span>
                </a>
                <a href="https://nfai.ru/" target="_blank" rel="noopener noreferrer">
                  <span className="rounded-2xl bg-gold-light px-4 py-2 text-sm font-semibold text-brown-deep">
                    НФИИ
                  </span>
                </a>
              </div>
            </div>
            <div>
              <h4 className="font-bold text-brown-deep">Внедрено:</h4>
              <div className="mt-3 flex flex-wrap gap-2">
                {[
                  "БелАЗ",
                  "Синодальный отдел по делам молодежи Белорусской Православной Церкви",
                  "NEWM-Limited (Ireland)",
                  "ЭЛТИ-КУДИЦ (Москва)",
                  "Спортивный менеджер со знаком качества (Брест)",
                ].map((b) => (
                  <span
                    key={b}
                    className="rounded-2xl border border-line bg-milk px-4 py-2 text-sm font-medium text-brown-light"
                  >
                    {b}
                  </span>
                ))}
                <a
                  href="http://mgiro.minsk.edu.by/main.aspx?guid=213143"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span className="rounded-2xl border border-line bg-milk px-4 py-2 text-sm font-medium text-brown-light">
                    МГИРО
                  </span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== CONTACT / CTA (вместо Google Forms) ===== */}
      <section
        id="contact"
        className="bg-gradient-to-br from-brown-deep via-[#4E342E] to-brown-light py-20 text-milk"
      >
        <div className="mx-auto max-w-6xl px-5">
          <div className="text-center">
            <h2 className="text-3xl font-bold md:text-4xl">Оставить заявку</h2>
            <div className="title-underline" />
            <p className="mx-auto mt-4 max-w-2xl text-milk/80">
              Сделайте первый шаг к интеграции искусственного интеллекта в свою
              профессиональную сферу. Наш AI-продажник за несколько минут изучит вашу
              компанию, подберёт модули, рассчитает стоимость и запишет на встречу с
              Вероникой.
            </p>
            <Link href="/app?new=1" className="btn-primary mt-8">
              ✨ Пройти AI-диагностику и записаться →
            </Link>
          </div>

          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { title: "Email", value: "pvnvna@yandex.by", href: "mailto:pvnvna@yandex.by" },
              {
                title: "GitHub",
                value: "github.com/PedFund",
                href: "https://github.com/PedFund",
              },
              { title: "Локация", value: "Минск, Беларусь" },
              {
                title: "Telegram-канал",
                value: "ДоцентыИИноваторы",
                href: "https://t.me/IInovatorsD",
              },
            ].map((c) => (
              <div
                key={c.title}
                className="rounded-3xl border border-milk/15 bg-milk/5 p-6 text-center"
              >
                <h4 className="font-bold text-gold">{c.title}</h4>
                {c.href ? (
                  <a
                    href={c.href}
                    target={c.href.startsWith("http") ? "_blank" : undefined}
                    rel="noopener noreferrer"
                    className="mt-1 block text-sm text-milk/85 underline-offset-2 hover:underline"
                  >
                    {c.value}
                  </a>
                ) : (
                  <p className="mt-1 text-sm text-milk/85">{c.value}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="bg-[#2C1B18] py-10 text-sm text-milk/70">
        <div className="mx-auto max-w-6xl px-5">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div className="flex items-center gap-2 font-bold text-milk">
              <span className="text-gold"><BrainIcon /></span>
              Курс по нейросервисам и ИИ
            </div>
            <div className="flex flex-wrap justify-center gap-5">
              {NAV_LINKS.slice(0, 5).map((l) => (
                <a key={l.href} href={l.href} className="hover:text-gold">
                  {l.label}
                </a>
              ))}
              <Link href="/privacy" className="hover:text-gold">
                Политика конфиденциальности
              </Link>
            </div>
            <div className="flex gap-4">
              <a href="mailto:pvnvna@yandex.by" aria-label="Email" className="hover:text-gold">
                ✉️
              </a>
              <a
                href="https://github.com/PedFund"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
                className="hover:text-gold"
              >
                💻
              </a>
              <a
                href="https://t.me/pvnvna"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Telegram"
                className="hover:text-gold"
              >
                ✈️
              </a>
            </div>
          </div>
          <p className="mt-8 border-t border-milk/10 pt-6 text-center">
            © 2025–2026 Вероника Пунчик | Плательщик НПД | УНП АА1103777. Все права
            защищены.
          </p>
        </div>
      </footer>

      {/* ===== CERT MODAL ===== */}
      {modalCert && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-brown-deep/80 p-6"
          onClick={() => setModalCert(null)}
        >
          <div className="max-h-full max-w-3xl overflow-auto rounded-3xl bg-white p-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={modalCert.src} alt={modalCert.label} className="w-full rounded-2xl" />
            <p className="mt-3 text-center font-semibold text-brown-deep">
              {modalCert.label}
            </p>
          </div>
        </div>
      )}
    </main>
  );
}
