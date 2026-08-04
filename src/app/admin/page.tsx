"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { formatMoney } from "@/lib/pricing";

interface SlotRow {
  id: string;
  date: string;
  time: string;
  isBooked: boolean;
}

interface BookingRow {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  summary: string;
  totalCost: number;
  status: string;
  createdAt: string;
  slot: { date: string; time: string };
}

/** Шаблон сообщения для эксперта (копировать в Telegram/Email) */
function buildTemplate(b: BookingRow): string {
  let summary: Record<string, unknown> = {};
  try {
    summary = JSON.parse(b.summary);
  } catch {}
  const modules = Array.isArray(summary.modules) ? (summary.modules as string[]) : [];
  const lines = [
    "🔔 НОВАЯ ЗАЯВКА НА ВСТРЕЧУ",
    "",
    `📅 Дата: ${b.slot.date}, ${b.slot.time}`,
    `🏢 Компания: ${b.company}`,
    `👤 Контакт: ${b.name}, ${b.email}, ${b.phone}`,
    "",
    "📊 Краткая сводка диагностики:",
    `- Роль: ${summary.userRole ?? "—"}`,
    `- Участников: ${summary.participantCount ?? "—"}`,
    `- Цель: ${summary.goals ?? "—"}`,
    `- Рекомендуемые модули: ${modules.length ? modules.join("; ") : "—"}`,
    `- Расчетная стоимость: ${formatMoney(b.totalCost)}`,
  ];
  if (summary.objection) {
    lines.push(
      "",
      `⚠️ Возражение клиента: «${summary.objection}» (AI уже дал предварительный ответ).`
    );
  }
  return lines.join("\n");
}

interface DiagMapRow {
  id: string;
  companyName: string;
  userRole: string;
  participantCount: number;
  goals: string;
  data: string; // JSON-строка
  matchScore: number;
  createdAt: string;
}

/** Текстовый шаблон карты диагностики (для копирования/пересылки эксперту) */
function buildDiagTemplate(m: DiagMapRow): string {
  let d: Record<string, unknown> = {};
  try {
    d = JSON.parse(m.data) as Record<string, unknown>;
  } catch {}
  const qa = (Array.isArray(d.qa) ? d.qa : []) as { question: string; answer: string }[];
  const p = (d.proposal ?? {}) as Record<string, unknown>;
  const modules = (Array.isArray(p.modules) ? p.modules : []) as string[];
  const lines = [
    "🧭 КАРТА ДИАГНОСТИКИ",
    "",
    `🏢 Компания: ${m.companyName}`,
    `👤 Роль: ${m.userRole} · участников: ${m.participantCount}`,
    `🎯 Задачи: ${m.goals || "—"}`,
    `📈 Соответствие: ${m.matchScore}%`,
    "",
    "📋 Ответы диагностики:",
    ...(qa.length ? qa.map((x) => `- ${x.question}: ${x.answer || "—"}`) : ["—"]),
  ];
  if (typeof d.notes === "string" && d.notes.trim()) {
    lines.push("", `🗒 Свободные ответы из чата: ${d.notes.trim()}`);
  }
  if (modules.length || p.assemblyName) {
    lines.push(
      "",
      "🎓 Предложение:",
      `- Сборка: ${(p.assemblyName as string) ?? "—"} (${(p.totalHours as number) ?? "?"} ч)`,
      `- Модули: ${modules.length ? modules.join("; ") : "—"}`,
      `- Стоимость обучения: ${(p.trainingCost as number) ?? "?"} ${(p.currency as string) ?? "BYN"}`
    );
  }
  return lines.join("\n");
}

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [user, setUser] = useState("admin");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [slots, setSlots] = useState<SlotRow[]>([]);
  const [newDate, setNewDate] = useState("");
  const [newTimes, setNewTimes] = useState("10:00, 14:00, 16:00");
  const [notice, setNotice] = useState("");
  const [selectedBooking, setSelectedBooking] = useState<BookingRow | null>(null);
  const [diagMaps, setDiagMaps] = useState<DiagMapRow[]>([]);
  const [selectedMap, setSelectedMap] = useState<DiagMapRow | null>(null);

  const loadData = useCallback(async () => {
    const [bRes, sRes, dRes] = await Promise.all([
      fetch("/api/bookings"),
      fetch("/api/slots"),
      fetch("/api/diagnostics"),
    ]);
    if (bRes.status === 401) {
      setAuthed(false);
      return;
    }
    const b = await bRes.json();
    const s = await sRes.json();
    const dm = await dRes.json();
    setBookings(b.bookings || []);
    // /api/slots отдаёт только свободные; для админки этого достаточно (занятые видны в бронях)
    setSlots(s.slots || []);
    setDiagMaps(dm.maps || []);
    setAuthed(true);
  }, []);

  // Пробуем загрузить данные — если cookie жива, логин не нужен
  useEffect(() => {
    loadData().catch(() => {});
  }, [loadData]);

  async function login() {
    setLoginError("");
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user, password }),
    });
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      setLoginError(d?.error || "Неверный логин или пароль.");
      return;
    }
    await loadData();
  }

  async function logout() {
    await fetch("/api/admin/login", { method: "DELETE" });
    setAuthed(false);
    setPassword("");
  }

  async function addSlots() {
    setNotice("");
    const times = newTimes
      .split(/[,;\s]+/)
      .map((t) => t.trim())
      .filter(Boolean);
    const res = await fetch("/api/slots", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date: newDate, times }),
    });
    const d = await res.json();
    if (!res.ok) {
      setNotice(d?.error || "Ошибка добавления слотов.");
      return;
    }
    setNotice(`Добавлено слотов: ${d.slots.length}`);
    await loadData();
  }

  async function deleteSlot(id: string) {
    await fetch(`/api/slots?id=${id}`, { method: "DELETE" });
    await loadData();
  }

  async function copyTemplate(b: BookingRow) {
    const text = buildTemplate(b);
    try {
      await navigator.clipboard.writeText(text);
      setNotice("Шаблон скопирован в буфер обмена ✓");
    } catch {
      setSelectedBooking(b);
    }
  }

  async function copyDiagTemplate(m: DiagMapRow) {
    try {
      await navigator.clipboard.writeText(buildDiagTemplate(m));
      setNotice("Карта диагностики скопирована ✓");
    } catch {
      setSelectedMap(m);
    }
  }

  /* ===== ЛОГИН ===== */
  if (!authed) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-milk px-5">
        <div className="card w-full max-w-sm p-8">
          <h1 className="text-2xl font-bold text-brown-deep">Вход в админ-панель</h1>
          <p className="mt-1 text-sm text-muted">Управление слотами и заявками</p>
          <div className="mt-6 space-y-4">
            <div>
              <label className="label-base">Логин</label>
              <input
                className="input-base"
                value={user}
                onChange={(e) => setUser(e.target.value)}
              />
            </div>
            <div>
              <label className="label-base">Пароль</label>
              <input
                className="input-base"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && login()}
              />
            </div>
          </div>
          {loginError && <p className="mt-3 text-sm text-red-600">{loginError}</p>}
          <button className="btn-primary mt-6 w-full justify-center" onClick={login}>
            Войти
          </button>
          <Link
            href="/"
            className="mt-3 block text-center text-sm text-muted hover:text-gold"
          >
            ← Вернуться на сайт
          </Link>
        </div>
      </main>
    );
  }

  /* ===== ДАШБОРД ===== */
  return (
    <main className="min-h-screen bg-milk px-5 py-10">
      <div className="mx-auto max-w-5xl">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-brown-deep">Панель управления</h1>
          <div className="flex gap-3">
            <Link href="/" className="btn-secondary !px-5 !py-2.5 text-sm">
              На сайт
            </Link>
            <button className="btn-secondary !px-5 !py-2.5 text-sm" onClick={logout}>
              Выйти
            </button>
          </div>
        </div>

        {notice && (
          <p className="mt-4 rounded-2xl bg-gold-light p-3 text-sm text-brown-deep">
            {notice}
          </p>
        )}

        {/* Брони */}
        <section className="card mt-8 p-6">
          <h2 className="text-lg font-bold text-brown-deep">Забронированные встречи</h2>
          {bookings.length === 0 ? (
            <p className="mt-4 text-sm text-muted">Пока нет ни одной заявки.</p>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-line text-left text-muted">
                    <th className="p-2">Дата/Время</th>
                    <th className="p-2">Компания</th>
                    <th className="p-2">Контакт</th>
                    <th className="p-2">Сумма</th>
                    <th className="p-2">Статус</th>
                    <th className="p-2" />
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((b) => (
                    <tr key={b.id} className="border-b border-line align-top">
                      <td className="p-2 font-medium text-brown-deep">
                        {b.slot.date}
                        <br />
                        {b.slot.time}
                      </td>
                      <td className="p-2">{b.company}</td>
                      <td className="p-2">
                        {b.name}
                        <br />
                        <span className="text-muted">{b.email}</span>
                        <br />
                        <span className="text-muted">{b.phone}</span>
                      </td>
                      <td className="p-2 font-semibold text-gold">
                        {formatMoney(b.totalCost)}
                      </td>
                      <td className="p-2">
                        <span className="rounded-full bg-gold-light px-3 py-1 text-xs font-semibold text-brown-deep">
                          {b.status === "booked" ? "Забронировано" : b.status}
                        </span>
                      </td>
                      <td className="p-2">
                        <button
                          className="rounded-2xl border border-line px-3 py-1.5 text-xs font-semibold text-brown-light hover:border-gold hover:text-gold"
                          onClick={() => copyTemplate(b)}
                        >
                          📋 Шаблон
                        </button>
                        <button
                          className="ml-1 rounded-2xl border border-line px-3 py-1.5 text-xs text-brown-light hover:border-gold"
                          onClick={() => setSelectedBooking(b)}
                        >
                          👁
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Шаблон сообщения */}
        {selectedBooking && (
          <section className="card mt-6 p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-brown-deep">
                Шаблон сообщения для эксперта
              </h2>
              <button
                className="text-sm text-muted hover:text-gold"
                onClick={() => setSelectedBooking(null)}
              >
                ✕ Закрыть
              </button>
            </div>
            <textarea
              readOnly
              rows={14}
              className="mt-4 w-full rounded-2xl border border-line bg-milk p-4 font-mono text-xs"
              value={buildTemplate(selectedBooking)}
            />
          </section>
        )}

        {/* Карты диагностики */}
        <section className="card mt-6 p-6">
          <h2 className="text-lg font-bold text-brown-deep">Карты диагностики</h2>
          <p className="mt-1 text-sm text-muted">
            Сохранённые заготовки по клиентам — создаются при формировании предложения (до брони).
          </p>
          {diagMaps.length === 0 ? (
            <p className="mt-4 text-sm text-muted">Пока нет сохранённых карт диагностики.</p>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-line text-left text-muted">
                    <th className="p-2">Дата</th>
                    <th className="p-2">Компания</th>
                    <th className="p-2">Роль / участники</th>
                    <th className="p-2">Задачи</th>
                    <th className="p-2">Соотв.</th>
                    <th className="p-2" />
                  </tr>
                </thead>
                <tbody>
                  {diagMaps.map((m) => (
                    <tr key={m.id} className="border-b border-line align-top">
                      <td className="whitespace-nowrap p-2 text-muted">
                        {new Date(m.createdAt).toLocaleString("ru-RU")}
                      </td>
                      <td className="p-2 font-medium text-brown-deep">{m.companyName}</td>
                      <td className="p-2">
                        {m.userRole}
                        <br />
                        <span className="text-muted">{m.participantCount} чел.</span>
                      </td>
                      <td className="max-w-[220px] truncate p-2" title={m.goals}>
                        {m.goals || "—"}
                      </td>
                      <td className="p-2 font-semibold text-gold">{m.matchScore}%</td>
                      <td className="p-2">
                        <button
                          className="rounded-2xl border border-line px-3 py-1.5 text-xs font-semibold text-brown-light hover:border-gold hover:text-gold"
                          onClick={() => copyDiagTemplate(m)}
                        >
                          📋 Шаблон
                        </button>
                        <button
                          className="ml-1 rounded-2xl border border-line px-3 py-1.5 text-xs text-brown-light hover:border-gold"
                          onClick={() => setSelectedMap(m)}
                        >
                          👁
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {selectedMap && (
          <section className="card mt-6 p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-brown-deep">
                Карта диагностики — {selectedMap.companyName}
              </h2>
              <button
                className="text-sm text-muted hover:text-gold"
                onClick={() => setSelectedMap(null)}
              >
                ✕ Закрыть
              </button>
            </div>
            <textarea
              readOnly
              rows={16}
              className="mt-4 w-full rounded-2xl border border-line bg-milk p-4 font-mono text-xs"
              value={buildDiagTemplate(selectedMap)}
            />
          </section>
        )}

        {/* Слоты */}
        <section className="card mt-6 p-6">
          <h2 className="text-lg font-bold text-brown-deep">Свободные слоты</h2>
          <div className="mt-4 flex flex-wrap items-end gap-3">
            <div>
              <label className="label-base">Дата</label>
              <input
                className="input-base"
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
              />
            </div>
            <div className="flex-1 min-w-[220px]">
              <label className="label-base">Время (через запятую)</label>
              <input
                className="input-base"
                placeholder="10:00, 14:00, 16:00"
                value={newTimes}
                onChange={(e) => setNewTimes(e.target.value)}
              />
            </div>
            <button
              className="btn-primary !px-6 !py-3"
              disabled={!newDate}
              onClick={addSlots}
            >
              + Добавить
            </button>
          </div>

          {slots.length === 0 ? (
            <p className="mt-4 text-sm text-muted">
              Свободных слотов нет — добавьте даты, чтобы клиенты могли записаться.
            </p>
          ) : (
            <div className="mt-5 flex flex-wrap gap-2">
              {slots.map((slot) => (
                <span
                  key={slot.id}
                  className="flex items-center gap-2 rounded-2xl border border-line bg-white px-4 py-2 text-sm"
                >
                  <strong className="text-brown-deep">{slot.date}</strong> {slot.time}
                  <button
                    className="text-red-500 hover:text-red-700"
                    title="Удалить слот"
                    onClick={() => deleteSlot(slot.id)}
                  >
                    ✕
                  </button>
                </span>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
