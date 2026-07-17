"use client";

import { useWizardStore } from "@/store/wizardStore";
import { formatMoney } from "@/lib/pricing";

const MONTHS = [
  "января", "февраля", "марта", "апреля", "мая", "июня",
  "июля", "августа", "сентября", "октября", "ноября", "декабря",
];

export default function Screen6Success() {
  const s = useWizardStore();
  const b = s.bookingDetails;

  const dateLabel = b
    ? (() => {
        const d = new Date(`${b.date}T00:00:00`);
        return `${d.getDate()} ${MONTHS[d.getMonth()]}, ${b.time} (МСК)`;
      })()
    : "";

  return (
    <div className="fade-in-up pt-6 text-center">
      <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-gold-light shadow-gold">
        <svg viewBox="0 0 24 24" className="h-12 w-12 fill-gold">
          <path d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z" />
        </svg>
      </div>
      <h1 className="mt-6 text-3xl font-bold text-brown-deep">Встреча забронирована!</h1>
      <p className="mx-auto mt-2 max-w-xl text-muted">
        Мы подготовим материалы по вашей компании и передадим эксперту результаты
        AI-диагностики до встречи.
      </p>

      {/* Карточка встречи */}
      <div className="card mx-auto mt-8 flex max-w-lg items-center gap-5 p-6 text-left">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/photo_2026-07-17_2.jpg"
          alt="Вероника Пунчик"
          className="h-24 w-24 shrink-0 rounded-full border-4 border-gold object-cover"
        />
        <div>
          <p className="text-sm text-muted">Ваш эксперт:</p>
          <p className="text-lg font-bold text-brown-deep">Вероника Пунчик</p>
          <p className="text-brown-light">{dateLabel}</p>
          <p className="mt-1 text-sm text-muted">
            📹 Онлайн (ссылка придёт на {b?.email || "ваш email"})
          </p>
        </div>
      </div>

      {/* Что уже получит эксперт */}
      <div className="mx-auto mt-6 max-w-lg rounded-2xl bg-gold-light p-5 text-left text-sm">
        <strong className="text-brown-deep">Что уже получит эксперт к встрече:</strong>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-brown-light">
          <li>
            Информация о компании «{s.companyName}» ({s.userRole},{" "}
            {s.participantCount} участников) и цели обучения
          </li>
          <li>Результаты AI-диагностики ({s.diagnosticQuestions.length} вопроса)</li>
          {s.proposal && (
            <>
              <li>
                Рекомендованные модули:{" "}
                {s.proposal.modules.map((m) => m.title).join("; ")}
              </li>
              <li>
                Предварительный расчёт стоимости: {formatMoney(s.proposal.cost.total)}
              </li>
            </>
          )}
          {s.objection && <li>Ваш вопрос: «{s.objection}»</li>}
        </ul>
      </div>

      <button className="btn-secondary mt-10" onClick={() => s.reset()}>
        Начать новую диагностику
      </button>
    </div>
  );
}
