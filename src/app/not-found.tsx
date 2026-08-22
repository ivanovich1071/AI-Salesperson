import type { Metadata } from "next";
import Link from "next/link";

/**
 * Страница 404.
 *
 * Дефолтная страница Next — чёрный текст на белом фоне без единой ссылки:
 * посетитель, пришедший по устаревшему адресу, просто закрывает вкладку.
 * `noindex` обязателен, иначе поисковики держат в индексе пустые адреса.
 */
export const metadata: Metadata = {
  title: "Страница не найдена | ВайбМайнд",
  robots: { index: false, follow: true },
};

const LINKS = [
  { href: "/", label: "Главная" },
  { href: "/course", label: "Корпоративный курс" },
  { href: "/faq", label: "Вопросы и ответы" },
  { href: "/app?new=1", label: "AI-диагностика" },
];

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-mist px-5 py-16 text-graphite">
      <div className="w-full max-w-lg text-center">
        <p className="text-6xl font-bold text-teal-dark">404</p>
        <h1 className="mt-4 text-2xl font-bold text-graphite md:text-3xl">
          Такой страницы нет
        </h1>
        <p className="mt-4 leading-relaxed text-graphite/75">
          Возможно, адрес устарел или в ссылке опечатка. Вот куда можно перейти:
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-2xl border border-teal/20 bg-white/80 px-5 py-3 font-semibold text-teal-dark transition-colors hover:bg-white"
            >
              {l.label}
            </Link>
          ))}
        </div>

        <p className="mt-10 text-sm text-graphite/60">
          Не нашли нужное — позвоните{" "}
          <a href="tel:+375297200700" className="font-semibold text-teal-dark hover:underline">
            +375 29 7-200-700
          </a>
        </p>
      </div>
    </main>
  );
}
