"use client";

import { useState } from "react";
import Link from "next/link";

/* ===== Данные страницы «ВайбМайнд» (структура и тексты перенесены со страницы VibeZmest) ===== */
const NAV_LINKS = [
  { href: "#benefits", label: "Преимущества" },
  { href: "#process", label: "Как мы работаем" },
  { href: "#formats", label: "Форматы" },
  { href: "#course", label: "Курс" },
  { href: "#about", label: "О компании" },
  { href: "#contacts", label: "Контакты" },
];

const BENEFITS = [
  {
    emoji: "⚡",
    title: "Повышаем производительность",
    text: "Помогаем сотрудникам быстрее выполнять интеллектуальную работу",
  },
  {
    emoji: "📚",
    title: "Сохраняем знания организации",
    text: "Превращаем опыт сотрудников в доступные базы знаний и AI-помощников",
  },
  {
    emoji: "🤖",
    title: "Автоматизируем рутину",
    text: "Сокращаем время на документы, поиск информации, отчёты и коммуникации",
  },
  {
    emoji: "🧭",
    title: "Сопровождаем изменения",
    text: "Помогаем внедрять ИИ как рабочий инструмент организации",
  },
];

const PROCESS = [
  { n: "1", title: "Диагностика", text: "Изучаем задачи и процессы организации" },
  { n: "2", title: "Обучение", text: "Показываем практические сценарии применения ИИ" },
  { n: "3", title: "Пилотный проект", text: "Запускаем первое рабочее решение" },
  { n: "4", title: "Масштабирование", text: "Распространяем успешный опыт на другие процессы" },
];

const FORMATS = [
  {
    emoji: "🎓",
    title: "Корпоративное обучение",
    text: "Программы для руководителей и сотрудников",
  },
  {
    emoji: "🧩",
    title: "Консалтинг",
    text: "Поиск точек роста и возможностей применения ИИ",
  },
  {
    emoji: "🛠️",
    title: "Проектное внедрение",
    text: "Создание и запуск AI-ботов, ассистентов и автоматизированных процессов",
  },
  {
    emoji: "🤝",
    title: "Сопровождение команды",
    text: "Поддержка команды на этапе изменений",
  },
];

export default function VibeMindHome() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <main className="bg-mist text-graphite">
      {/* ===== NAVBAR ===== */}
      <nav className="fixed inset-x-0 top-0 z-40 border-b border-teal/10 bg-mist/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3">
          <a href="#hero" className="flex items-center gap-2 font-bold text-graphite">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/vibemind-logo.jpg" alt="ВайбМайнд" className="h-9 w-auto" />
            <span>ВайбМайнд</span>
          </a>
          <ul className="hidden items-center gap-6 text-sm font-medium text-graphite/70 lg:flex">
            {NAV_LINKS.map((l) => (
              <li key={l.href}>
                <a href={l.href} className="transition-colors hover:text-teal">
                  {l.label}
                </a>
              </li>
            ))}
            <li>
              <Link
                href="/course"
                className="rounded-2xl px-5 py-2.5 font-semibold text-white shadow-teal transition-all hover:-translate-y-0.5"
                style={{ background: "linear-gradient(135deg, #00b1b4, #00d9a6)" }}
              >
                Корпоративный курс
              </Link>
            </li>
          </ul>
          <button
            className="flex flex-col gap-1.5 p-2 lg:hidden"
            aria-label="Меню"
            onClick={() => setMenuOpen((v) => !v)}
          >
            <span className="h-0.5 w-6 bg-graphite" />
            <span className="h-0.5 w-6 bg-graphite" />
            <span className="h-0.5 w-6 bg-graphite" />
          </button>
        </div>
        {menuOpen && (
          <ul className="border-t border-teal/10 bg-mist px-5 py-4 lg:hidden">
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
            <li className="pt-2">
              <Link href="/course" className="btn-teal w-full justify-center">
                Корпоративный курс →
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
            <div className="rounded-3xl bg-white p-6 shadow-2xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/vibemind-logo.jpg"
                alt="Логотип ВайбМайнд"
                className="h-56 w-auto"
              />
            </div>
          </div>
          <div>
            <p className="text-lg font-medium italic text-teal-emerald">
              Социально ответственный интеллектуальный белорусский бизнес
            </p>
            <h1 className="mt-4 text-4xl font-extrabold leading-tight md:text-5xl">
              Обучаем, консультируем и сопровождаем цифровую трансформацию рабочих процессов
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-white/80">
              Помогаем командам внедрять ИИ в реальную деятельность организации — от
              делегирования рутины до собственных виртуальных сотрудников.
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

      {/* ===== BENEFITS ===== */}
      <section id="benefits" className="py-20">
        <div className="mx-auto max-w-6xl px-5">
          <div className="text-center">
            <h2 className="vm-title">Чем мы полезны</h2>
            <div className="vm-underline" />
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {BENEFITS.map((b) => (
              <div key={b.title} className="vm-card">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal/10 text-2xl">
                  {b.emoji}
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
          <div className="mt-12 flex flex-col items-stretch gap-4 lg:flex-row lg:items-center">
            {PROCESS.map((s, i) => (
              <div key={s.n} className="flex flex-1 items-center gap-4 lg:flex-col lg:text-center">
                <div className="flex flex-1 flex-col rounded-3xl border border-teal/15 bg-mist p-6 lg:w-full">
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-full text-lg font-bold text-white lg:mx-auto"
                    style={{ background: "linear-gradient(135deg, #00b1b4, #00d9a6)" }}
                  >
                    {s.n}
                  </div>
                  <h3 className="mt-4 text-lg font-bold text-graphite">{s.title}</h3>
                  <p className="mt-2 text-sm text-graphite/70">{s.text}</p>
                </div>
                {i < PROCESS.length - 1 && (
                  <span className="hidden text-2xl text-teal lg:inline">→</span>
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
              <div key={f.title} className="vm-card">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal/10 text-2xl">
                  {f.emoji}
                </div>
                <h3 className="mt-4 text-lg font-bold text-graphite">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-graphite/70">{f.text}</p>
              </div>
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
            "linear-gradient(135deg, #0e1e1f 0%, #073d3d 60%, #00b1b4 140%)",
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
              <strong className="text-graphite">ВайбМайнд Лаб</strong> — социально
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
              {/* TODO: указать реальный Telegram ВайбМайнд (заглушка) */}
              <a href="#" className="mt-1 block text-graphite/80 hover:text-teal">
                @vibemind
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
              <img
                src="/images/vibemind-logo.jpg"
                alt="ВайбМайнд"
                className="h-8 w-auto rounded-lg bg-white p-1"
              />
              ВайбМайнд
            </div>
            <div className="flex flex-wrap justify-center gap-5">
              {NAV_LINKS.map((l) => (
                <a key={l.href} href={l.href} className="hover:text-teal">
                  {l.label}
                </a>
              ))}
              <Link href="/course" className="hover:text-teal">
                Курс
              </Link>
              <Link href="/privacy" className="hover:text-teal">
                Политика конфиденциальности
              </Link>
            </div>
          </div>
          <p className="mt-8 border-t border-white/10 pt-6 text-center">
            © 2025–2026 ВайбМайнд Лаб. Все права защищены.
          </p>
        </div>
      </footer>
    </main>
  );
}
