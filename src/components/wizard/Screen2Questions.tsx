"use client";

import { useState } from "react";
import { useWizardStore } from "@/store/wizardStore";
import MicButton from "./MicButton";

export default function Screen2Questions() {
  const s = useWizardStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const answered = s.answers.filter((a) => a && a.trim()).length;

  async function buildProposal() {
    if (loading) return;
    setLoading(true);
    setError("");
    s.pushChat("status", "🧩 Собираем персональную программу и считаем стоимость...");

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
          questions: s.diagnosticQuestions,
          answers: s.answers,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "AI недоступен");

      s.setField("proposal", data);
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

  return (
    <div className="fade-in-up">
      <h1 className="text-3xl font-bold text-brown-deep">Уточним вашу задачу</h1>
      <p className="mt-2 text-muted">
        AI изучил информацию. Осталось несколько вопросов, чтобы собрать программу точнее.
        Чем подробнее ответы — тем точнее программа (отвечать можно голосом).
      </p>

      <div className="mt-8 space-y-6">
        {s.diagnosticQuestions.map((q, i) => (
          <div key={i}>
            <label className="label-base">
              {String(i + 1).padStart(2, "0")}. {q}
            </label>
            <div className="relative">
              <textarea
                className="input-base pr-12"
                rows={3}
                placeholder="Ваш ответ..."
                value={s.answers[i] || ""}
                onChange={(e) => s.setAnswer(i, e.target.value)}
              />
              <div className="absolute right-2 top-2">
                <MicButton
                  onText={(t) =>
                    s.setAnswer(i, s.answers[i] ? `${s.answers[i]} ${t}` : t)
                  }
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {error && (
        <p className="mt-4 rounded-2xl bg-red-50 p-3 text-sm text-red-700">{error}</p>
      )}

      <div className="mt-8 flex items-center justify-between">
        <button className="btn-secondary" onClick={() => s.setStep(1)}>
          ← Назад
        </button>
        <button
          className="btn-primary"
          disabled={answered === 0 || loading}
          onClick={buildProposal}
        >
          {loading ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-brown-deep border-t-transparent" />
              Формируем...
            </>
          ) : (
            "Сформировать предложение →"
          )}
        </button>
      </div>
    </div>
  );
}
