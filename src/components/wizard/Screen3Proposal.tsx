"use client";

import { useState } from "react";
import { useWizardStore } from "@/store/wizardStore";
import { formatMoney } from "@/lib/pricing";
import MicButton from "./MicButton";

export default function Screen3Proposal() {
  const s = useWizardStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const p = s.proposal;

  if (!p) {
    return (
      <div className="fade-in-up">
        <h1 className="text-3xl font-bold text-brown-deep">Персональная программа</h1>
        <p className="mt-4 text-muted">
          Предложение ещё не сформировано. Вернитесь к диагностике.
        </p>
        <button className="btn-secondary mt-6" onClick={() => s.setStep(2)}>
          ← К вопросам
        </button>
      </div>
    );
  }

  async function next() {
    if (loading) return;
    setError("");

    if (!s.objection.trim()) {
      s.pushChat("ai", "📅 Отлично! Переходим к выбору времени встречи с Вероникой.");
      s.setStep(5);
      return;
    }

    setLoading(true);
    s.pushChat("status", "💡 Работаем с вашим вопросом...");
    try {
      const res = await fetch("/api/ai/objection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          objection: s.objection,
          companyName: s.companyName,
          userRole: s.userRole,
          participantCount: s.participantCount,
          goals: s.goals,
          recommendedModules: p!.trainingModules.map((m) => `${m.code}. ${m.title}`),
          totalCost: p!.trainingCost.total,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "AI недоступен");
      s.setField("objectionResponse", data);
      s.replaceLastStatus(
        "💡 Я подготовил аргументированный ответ, основанный на специфике вашего бизнеса."
      );
      s.setStep(4);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Не удалось подготовить ответ.";
      setError(msg);
      s.replaceLastStatus("⚠️ Не удалось разобрать вопрос. Можно сразу выбрать время встречи.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fade-in-up">
      <h1 className="text-3xl font-bold text-brown-deep">
        Персональная программа для вашей компании
      </h1>
      <p className="mt-2 text-muted">
        Сформирована на основе задач команды «{s.companyName}» и результатов диагностики.
      </p>

      {/* Блок 1: Что мы увидели */}
      <div className="card mt-8 border-l-4 border-l-gold p-6">
        <h3 className="font-bold text-brown-deep">Что мы увидели</h3>
        <p className="mt-2 text-sm leading-relaxed text-brown-light">{p.summary}</p>
      </div>

      {/* Блок 2: Рекомендуемые учебные модули */}
      <div className="mt-8 flex items-baseline justify-between">
        <h3 className="font-bold text-brown-deep">Рекомендуемые учебные модули</h3>
        <span className="text-sm font-semibold text-gold">
          Пакет «{p.assemblyName}» · {p.totalHours} ч
        </span>
      </div>
      <div className="mt-3 space-y-4">
        {p.trainingModules.map((m) => (
          <div key={m.code} className="card flex flex-col overflow-hidden sm:flex-row">
            <div className="relative h-36 shrink-0 sm:h-auto sm:w-44">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={m.image} alt={m.title} className="h-full w-full object-cover" />
              <span className="absolute left-3 top-3 rounded-2xl bg-gold px-3 py-1 text-sm font-bold text-brown-deep shadow-gold">
                {m.code}
              </span>
            </div>
            <div className="flex-1 p-5">
              <h4 className="font-bold text-brown-deep">{m.title}</h4>
              <p className="mt-0.5 text-xs font-semibold text-gold">{m.hours} ак. часа</p>
              <p className="mt-2 text-sm leading-relaxed text-muted">{m.reason}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Блок 3: Как будет проходить обучение */}
      <div className="card mt-6 p-6">
        <h3 className="font-bold text-brown-deep">Как будет проходить обучение</h3>
        <p className="mt-2 text-sm leading-relaxed text-brown-light">{p.trainingFormat}</p>
      </div>

      {/* Блок 4: Стоимость по протоколу пакетов */}
      <div className="mt-6 rounded-3xl bg-brown-deep p-6 text-milk">
        <h3 className="font-bold text-gold">
          Пакет «{p.trainingCost.packageName}»
        </h3>
        <p className="mt-1 text-xs text-milk/60">
          {p.trainingCost.packageComposition}. Цена зависит от числа потоков, а не от
          числа участников напрямую.
          {p.trainingCost.streams > 1 && ` Потоков: ${p.trainingCost.streams}.`}
        </p>
        <div className="mt-3 space-y-2 text-sm">
          {p.trainingCost.lines.map((l, i) => (
            <div key={i} className="flex justify-between gap-4">
              <span className="text-milk/85">{l.label}</span>
              <span className="shrink-0">
                {l.amount.toLocaleString("ru-RU")} {p.trainingCost.currency}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-4 flex justify-between border-t border-milk/20 pt-3 text-lg font-bold text-gold">
          <span>Стоимость обучения</span>
          <span>
            {p.trainingCost.isEstimate && "от "}
            {formatMoney(p.trainingCost.total)}
          </span>
        </div>

        {p.trainingCost.included.length > 0 && (
          <p className="mt-3 text-xs text-milk/70">
            <span className="font-semibold text-milk/90">В цену уже входит:</span>{" "}
            {p.trainingCost.included.join(", ")}.
          </p>
        )}

        {p.trainingCost.isEstimate && (
          <p className="mt-2 text-xs font-semibold text-milk/80">
            Программа такого масштаба собирается индивидуально — точную сумму
            зафиксируем на встрече.
          </p>
        )}

        <p className="mt-2 text-xs text-milk/60">
          Командировочные, аренда и платные аккаунты — отдельно. Финальные условия — на
          встрече с экспертом.
        </p>
      </div>

      {/* Треки сверх пакета: предлагаются отдельно и в сумму не входят */}
      {p.trainingCost.options.length > 0 && (
        <div className="card mt-6 p-6">
          <h3 className="font-bold text-brown-deep">Можно добавить к программе</h3>
          <p className="mt-1 text-xs text-muted">
            Эти направления тоже подходят вашим задачам. В стоимость выше они не входят —
            добавляются по решению компании.
          </p>
          <div className="mt-3 space-y-2 text-sm">
            {p.trainingCost.options.map((o, i) => (
              <div key={i} className="flex justify-between gap-4">
                <span className="text-brown-light">{o.label}</span>
                <span className="shrink-0 font-semibold text-gold">
                  + {formatMoney(o.amount)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Отдельный продукт: Лаборатория AI-кейсов */}
      <div className="card mt-6 border-l-4 border-l-gold p-6">
        <div className="flex items-baseline justify-between gap-4">
          <h3 className="font-bold text-brown-deep">{p.lab.title}</h3>
          <span className="shrink-0 text-sm font-bold text-gold">{p.lab.range}</span>
        </div>
        <p className="mt-2 text-sm leading-relaxed text-muted">{p.lab.description}</p>
        <p className="mt-2 text-xs font-semibold text-brown-light">
          Предлагается отдельно, не входит в стоимость обучения.
        </p>
      </div>

      {/* Проектирование и разработка */}
      <div className="card mt-6 p-6">
        <div className="flex items-baseline justify-between gap-4">
          <h3 className="font-bold text-brown-deep">{p.designDevelopment.title}</h3>
          <span className="shrink-0 text-sm font-semibold text-gold">
            {p.designDevelopment.note}
          </span>
        </div>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          {p.designDevelopment.description}
        </p>
      </div>

      {/* Что дальше — лестница продуктов */}
      <div className="mt-6 rounded-3xl bg-gold-light p-6">
        <h3 className="font-bold text-brown-deep">Что дальше</h3>
        <ol className="mt-3 space-y-2">
          {p.nextSteps.map((step, i) => (
            <li key={i} className="flex gap-3 text-sm text-brown-light">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gold text-xs font-bold text-brown-deep">
                {i + 1}
              </span>
              {step}
            </li>
          ))}
        </ol>
      </div>

      {/* Блок 5: Оценка и сомнения */}
      <div className="card mt-6 p-6">
        <div className="flex items-center justify-between gap-4">
          <h3 className="font-bold text-brown-deep">Соответствие вашим задачам</h3>
          <span className="text-2xl font-extrabold text-gold">{p.matchScore}%</span>
        </div>
        <div className="mt-2 h-3 overflow-hidden rounded-full bg-gold-light">
          <div
            className="h-full rounded-full bg-gold transition-all"
            style={{ width: `${Math.min(100, Math.max(0, p.matchScore))}%` }}
          />
        </div>
        <label className="label-base mt-5">
          Что вызывает вопросы или сомнения? (Необязательно)
        </label>
        <div className="relative">
          <textarea
            className="input-base pr-12"
            rows={3}
            placeholder="Стоимость, формат, сроки — расскажите, что хотелось бы уточнить..."
            value={s.objection}
            onChange={(e) => s.setField("objection", e.target.value)}
          />
          <div className="absolute right-2 top-2">
            <MicButton
              onText={(t) => s.setField("objection", s.objection ? `${s.objection} ${t}` : t)}
            />
          </div>
        </div>
      </div>

      {error && (
        <p className="mt-4 rounded-2xl bg-red-50 p-3 text-sm text-red-700">{error}</p>
      )}

      <div className="mt-8 flex items-center justify-between">
        <button className="btn-secondary" onClick={() => s.setStep(2)}>
          ← Назад
        </button>
        <button className="btn-primary" disabled={loading} onClick={next}>
          {loading ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-brown-deep border-t-transparent" />
              Анализируем...
            </>
          ) : s.objection.trim() ? (
            "Обсудить сомнения →"
          ) : (
            "Выбрать время встречи →"
          )}
        </button>
      </div>
    </div>
  );
}
