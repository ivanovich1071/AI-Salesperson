"use client";

import { useEffect, useMemo, useState } from "react";
import { useWizardStore } from "@/store/wizardStore";

interface Slot {
  id: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
}

const WEEKDAYS = ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"];
const MONTHS = [
  "января", "февраля", "марта", "апреля", "мая", "июня",
  "июля", "августа", "сентября", "октября", "ноября", "декабря",
];

function formatDate(iso: string): { day: string; weekday: string } {
  const d = new Date(`${iso}T00:00:00`);
  return {
    day: `${d.getDate()} ${MONTHS[d.getMonth()]}`,
    weekday: WEEKDAYS[d.getDay()],
  };
}

export default function Screen5Booking() {
  const s = useWizardStore();
  const [slots, setSlots] = useState<Slot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlotId, setSelectedSlotId] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/slots")
      .then((r) => r.json())
      .then((d) => setSlots(d.slots || []))
      .catch(() => setSlots([]))
      .finally(() => setSlotsLoading(false));
  }, []);

  const dates = useMemo(
    () => Array.from(new Set(slots.map((x) => x.date))).sort(),
    [slots]
  );
  const timesForDate = useMemo(
    () => slots.filter((x) => x.date === selectedDate),
    [slots, selectedDate]
  );

  const canConfirm =
    selectedSlotId && name.trim() && email.trim() && phone.trim() && !submitting;

  async function confirm() {
    if (!canConfirm) return;
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slotId: selectedSlotId,
          name,
          company: s.companyName,
          email,
          phone,
          totalCost: s.proposal?.trainingCost.total ?? 0,
          summary: {
            userRole: s.userRole,
            participantCount: s.participantCount,
            goals: s.goals,
            answers: s.diagnosticAnswers,
            modules: s.proposal?.trainingModules.map((m) => `${m.code}. ${m.title}`) ?? [],
            assembly: s.proposal?.assemblyName ?? null,
            totalHours: s.proposal?.totalHours ?? null,
            matchScore: s.proposal?.matchScore ?? null,
            objection: s.objection || null,
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Не удалось забронировать.");

      s.setField("bookingDetails", {
        id: data.booking.id,
        date: data.booking.date,
        time: data.booking.time,
        name,
        email,
      });
      s.pushChat(
        "ai",
        "🎉 Встреча подтверждена! Я передал все материалы эксперту. До связи на встрече!"
      );
      s.setStep(6);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Не удалось забронировать встречу.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fade-in-up">
      <h1 className="text-3xl font-bold text-brown-deep">Обсудим программу с экспертом</h1>
      <p className="mt-2 text-muted">
        30 минут. Без обязательств. Разберём вашу задачу и уточним программу под структуру
        команды.
      </p>

      {slotsLoading ? (
        <div className="mt-10 flex items-center gap-3 text-muted">
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-gold border-t-transparent" />
          Загружаем доступные слоты...
        </div>
      ) : dates.length === 0 ? (
        <div className="card mt-8 p-6 text-brown-light">
          Свободных слотов сейчас нет. Напишите нам напрямую:{" "}
          <a href="mailto:pvnvna@yandex.by" className="font-semibold text-gold">
            pvnvna@yandex.by
          </a>{" "}
          — и мы подберём время вручную.
        </div>
      ) : (
        <>
          <label className="label-base mt-8">Выберите дату:</label>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-5">
            {dates.map((d) => {
              const f = formatDate(d);
              const active = selectedDate === d;
              return (
                <button
                  key={d}
                  className={`rounded-2xl border p-3 text-center text-sm transition-all ${
                    active
                      ? "border-gold bg-gold font-semibold text-brown-deep"
                      : "border-line bg-white hover:border-gold"
                  }`}
                  onClick={() => {
                    setSelectedDate(d);
                    setSelectedSlotId("");
                  }}
                >
                  {f.day}
                  <br />
                  <small className="opacity-70">{f.weekday}</small>
                </button>
              );
            })}
          </div>

          {selectedDate && (
            <>
              <label className="label-base mt-6">Доступное время (МСК):</label>
              <div className="flex flex-wrap gap-3">
                {timesForDate.map((slot) => (
                  <button
                    key={slot.id}
                    className={`rounded-full border px-5 py-2 text-sm transition-all ${
                      selectedSlotId === slot.id
                        ? "border-brown-deep bg-brown-deep font-semibold text-gold"
                        : "border-line bg-white hover:border-brown-deep"
                    }`}
                    onClick={() => setSelectedSlotId(slot.id)}
                  >
                    {slot.time}
                  </button>
                ))}
              </div>
            </>
          )}
        </>
      )}

      <div className="mt-8 space-y-5">
        <div>
          <label className="label-base">Ваше имя *</label>
          <input
            className="input-base"
            placeholder="Иван Иванов"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div>
          <label className="label-base">Компания</label>
          <input className="input-base bg-milk" value={s.companyName} readOnly />
        </div>
        <div>
          <label className="label-base">Email *</label>
          <input
            className="input-base"
            type="email"
            placeholder="ivan@company.by"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <label className="label-base">Телефон *</label>
          <input
            className="input-base"
            type="tel"
            placeholder="+375 (XX) XXX-XX-XX"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>
        <p className="text-xs text-muted">
          Нажимая «Подтвердить встречу», вы соглашаетесь с{" "}
          <a href="/privacy" target="_blank" className="text-gold hover:underline">
            политикой конфиденциальности
          </a>
          .
        </p>
      </div>

      {error && (
        <p className="mt-4 rounded-2xl bg-red-50 p-3 text-sm text-red-700">{error}</p>
      )}

      {!canConfirm && !submitting && (
        <p className="mt-4 text-right text-xs text-muted">
          {!selectedSlotId
            ? "Чтобы подтвердить встречу, выберите дату и время выше."
            : "Заполните имя, email и телефон — и кнопка станет активной."}
        </p>
      )}

      <div className="mt-8 flex items-center justify-between">
        <button
          className="btn-secondary"
          onClick={() => s.setStep(s.objectionResponse ? 4 : 3)}
        >
          ← Назад
        </button>
        <button className="btn-primary" disabled={!canConfirm} onClick={confirm}>
          {submitting ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-brown-deep border-t-transparent" />
              Бронируем...
            </>
          ) : (
            "Подтвердить встречу ✓"
          )}
        </button>
      </div>
    </div>
  );
}
