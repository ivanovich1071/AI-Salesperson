"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useWizardStore } from "@/store/wizardStore";
import { questionsForRole, QUESTIONNAIRE_INTRO } from "@/lib/diagnosticQuestions";
import type { UserRole } from "@/lib/pricing";
import MicButton from "./MicButton";

const OTHER = "Другое";

export default function Screen2Questions() {
  const s = useWizardStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [otherOpen, setOtherOpen] = useState<Record<string, boolean>>({});
  const handledRequestRef = useRef(0);

  const questions = useMemo(
    () => questionsForRole((s.userRole as UserRole) || "Универсальные специалисты"),
    [s.userRole]
  );

  const ans = (qid: string) => s.diagnosticAnswers[qid] ?? { selected: [], other: "" };

  // Вопрос считается отвеченным: есть чекбокс или заполнено «Другое»
  const answered = (qid: string) => {
    const a = ans(qid);
    return a.selected.length > 0 || a.other.trim().length > 0;
  };
  const answeredCount = questions.filter((q) => answered(q.id)).length;
  const allAnswered = questions.every((q) => answered(q.id));
  // Кнопка активна уже при ≥1 отвеченном вопросе (чекбокс/«Другое»/через чат)
  // или если ассистент сохранил свободные ответы из чата.
  const canBuild = answeredCount >= 1 || s.diagnosticNotes.trim().length > 0;

  function toggleOther(qid: string) {
    setOtherOpen((prev) => {
      const open = !prev[qid];
      if (!open) s.setOther(qid, ""); // сняли «Другое» — чистим текст
      return { ...prev, [qid]: open };
    });
  }

  async function buildProposal() {
    if (loading || !canBuild) return;
    setLoading(true);
    setError("");
    s.pushChat("status", "🧩 Собираем персональную программу и считаем стоимость...");

    // Объединяем чекбоксы + «Другое» в один ответ на вопрос (+ под-вопросы отдельно)
    const qa: { question: string; answer: string }[] = [];
    for (const q of questions) {
      const a = ans(q.id);
      const parts = [...a.selected];
      if (a.other.trim()) parts.push(a.other.trim());
      qa.push({ question: q.text, answer: parts.join("; ") });
      if (q.sub) {
        const sa = ans(q.sub.id);
        if (sa.selected[0]) qa.push({ question: q.sub.text, answer: sa.selected[0] });
      }
    }
    // Свободные ответы, надиктованные/написанные в чат (не легли в конкретный вопрос)
    if (s.diagnosticNotes.trim()) {
      qa.push({ question: "Дополнительно из диалога с ассистентом", answer: s.diagnosticNotes.trim() });
    }

    try {
      const res = await fetch("/api/ai/proposal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company: {
            companyName: s.companyName,
            websiteUrl: s.websiteUrl,
            parsedWebsiteText: s.parsedWebsiteText,
            userRole: s.userRole,
            participantCount: s.participantCount,
            goals: s.goals,
          },
          qa,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "AI недоступен");

      s.setField("proposal", data);

      // Сохраняем карту диагностики (шаблон) в БД → доступна в админке. Не блокируем UI.
      void fetch("/api/diagnostics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName: s.companyName,
          userRole: s.userRole,
          participantCount: s.participantCount,
          goals: s.goals,
          matchScore: data.matchScore ?? 0,
          data: {
            answers: s.diagnosticAnswers,
            notes: s.diagnosticNotes,
            qa,
            proposal: {
              assemblyName: data.assemblyName,
              totalHours: data.totalHours,
              modules: (data.trainingModules ?? []).map(
                (m: { code: string; title: string }) => `${m.code}. ${m.title}`
              ),
              trainingCost: data.trainingCost?.total,
              currency: data.trainingCost?.currency,
              summary: data.summary,
            },
          },
        }),
      }).catch(() => {});

      s.replaceLastStatus("✨ Программа готова!");
      s.pushChat("ai", data.chatComment);
      s.setStep(3);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Не удалось сформировать предложение.";
      setError(msg);
      s.replaceLastStatus("⚠️ Не удалось сформировать предложение. Попробуйте ещё раз.");
    } finally {
      setLoading(false);
    }
  }

  // Чат попросил собрать предложение → запускаем тот же расчёт, что и кнопка
  useEffect(() => {
    if (s.proposalRequestedAt && s.proposalRequestedAt !== handledRequestRef.current) {
      handledRequestRef.current = s.proposalRequestedAt;
      void buildProposal();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [s.proposalRequestedAt]);

  return (
    <div className="fade-in-up">
      <h1 className="text-3xl font-bold text-brown-deep">Уточним вашу задачу</h1>
      <p className="mt-2 text-muted">{QUESTIONNAIRE_INTRO}</p>

      <div className="mt-8 space-y-8">
        {questions.map((q, i) => {
          const a = ans(q.id);
          const isOtherOpen = otherOpen[q.id] || a.other.length > 0;
          return (
            <div key={q.id}>
              <p className="font-semibold text-brown-deep">
                {String(i + 1).padStart(2, "0")}. {q.text}
              </p>
              <p className="mt-1 text-xs text-muted">Можно выбрать несколько вариантов:</p>

              <div className="mt-3 space-y-2">
                {q.options.map((opt) => (
                  <label
                    key={opt}
                    className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-3 text-sm transition-colors ${
                      a.selected.includes(opt)
                        ? "border-gold bg-gold-light/50 text-brown-deep"
                        : "border-line bg-white text-brown-light hover:border-gold"
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="mt-0.5 h-4 w-4 shrink-0 accent-gold"
                      checked={a.selected.includes(opt)}
                      onChange={() => s.toggleOption(q.id, opt)}
                    />
                    <span>{opt}</span>
                  </label>
                ))}

                {/* «Другое» — чекбокс, раскрывающий поле с микрофоном */}
                {q.hasOther && (
                  <div>
                    <label
                      className={`flex cursor-pointer items-center gap-3 rounded-2xl border p-3 text-sm transition-colors ${
                        isOtherOpen
                          ? "border-gold bg-gold-light/50 text-brown-deep"
                          : "border-line bg-white text-brown-light hover:border-gold"
                      }`}
                    >
                      <input
                        type="checkbox"
                        className="h-4 w-4 shrink-0 accent-gold"
                        checked={isOtherOpen}
                        onChange={() => toggleOther(q.id)}
                      />
                      <span>{OTHER}</span>
                    </label>
                    {isOtherOpen && (
                      <div className="relative mt-2">
                        <textarea
                          className="input-base pr-12"
                          rows={2}
                          placeholder="Напишите или продиктуйте свой вариант..."
                          value={a.other}
                          onChange={(e) => s.setOther(q.id, e.target.value)}
                        />
                        <div className="absolute right-2 top-2">
                          <MicButton
                            onText={(t) => s.setOther(q.id, a.other ? `${a.other} ${t}` : t)}
                          />
                        </div>
                        <div className="mt-2 flex justify-end">
                          <button
                            type="button"
                            disabled={!a.other.trim()}
                            onClick={() => s.sendToChat(`${q.text} — ${a.other.trim()}`)}
                            className="rounded-2xl border border-line px-4 py-1.5 text-xs font-semibold text-brown-light transition-colors hover:border-gold hover:text-gold disabled:opacity-40"
                            title="Отправить ответ AI-ассистенту в чат"
                          >
                            ➤ Отправить ассистенту
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Под-вопрос (single-select) */}
              {q.sub && (
                <div className="mt-4 rounded-2xl bg-milk p-4">
                  <p className="text-sm font-semibold text-brown-deep">{q.sub.text}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {q.sub.options.map((opt) => {
                      const selected = ans(q.sub!.id).selected[0] === opt;
                      return (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => s.setSingle(q.sub!.id, opt)}
                          className={`rounded-full border px-4 py-1.5 text-xs transition-colors ${
                            selected
                              ? "border-brown-deep bg-brown-deep font-semibold text-gold"
                              : "border-line bg-white text-brown-light hover:border-brown-deep"
                          }`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {error && (
        <p className="mt-4 rounded-2xl bg-red-50 p-3 text-sm text-red-700">{error}</p>
      )}

      <div className="mt-8 flex items-center justify-between">
        <button className="btn-secondary" onClick={() => s.setStep(1)}>
          ← Назад
        </button>
        <button className="btn-primary" disabled={!canBuild || loading} onClick={buildProposal}>
          {loading ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Формируем...
            </>
          ) : (
            "Сформировать предложение →"
          )}
        </button>
      </div>
      {!canBuild ? (
        <p className="mt-3 text-right text-xs text-muted">
          Ответьте хотя бы на один вопрос (вариант, «Другое» или через чат слева), чтобы
          сформировать предложение.
        </p>
      ) : !allAnswered ? (
        <p className="mt-3 text-right text-xs text-muted">
          Можно формировать предложение уже сейчас. Чем больше ответов — тем точнее подбор.
        </p>
      ) : null}
    </div>
  );
}
