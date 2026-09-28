import Link from "next/link";

/** Блок «Контакты» (#contacts) — на главной и на /solutions: туда ведет «Запросить демо» */
export default function ContactsSection() {
  return (
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
  );
}
