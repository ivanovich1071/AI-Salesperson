import Link from "next/link";

/** Блок «Контакты» (#contacts) — на главной и на /solutions: туда ведет «Запросить демо» */
export default function ContactsSection({ consultation = false }: { consultation?: boolean }) {
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
          {consultation && (
            <>
              <h3 className="text-xl font-bold text-graphite">
                ИИ-диагностика Вайб-консультантом
              </h3>
              <p className="mx-auto mt-2 max-w-2xl text-graphite/70">
                Если пока непонятно, какой формат нужен, начните с разговора о вашей задаче
              </p>
            </>
          )}
          <Link href="/app?new=1" className={consultation ? "btn-teal mt-6" : "btn-teal"}>
            {consultation
              ? "Обсудить свою задачу с нашим Вайб-консультантом"
              : "✨ Пройти AI-диагностику →"}
          </Link>
        </div>
      </div>
    </section>
  );
}
