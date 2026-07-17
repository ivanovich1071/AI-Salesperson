"use client";

import { useState } from "react";
import { useWizardStore } from "@/store/wizardStore";
import { USER_ROLES } from "@/lib/pricing";
import MicButton from "./MicButton";

export default function Screen1Company() {
  const s = useWizardStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const canSubmit =
    s.companyName.trim() && s.userRole && s.participantCount > 0 && s.goals.trim();

  async function startDiagnostics() {
    if (!canSubmit || loading) return;
    setLoading(true);
    setError("");

    // При изменении данных Шага 1 зависимые AI-блоки регенерируются (ТЗ, раздел 13)
    if (s.needsRegeneration()) {
      s.setField("diagnosticQuestions", []);
      s.setField("answers", []);
      s.setField("proposal", null);
      s.setField("objectionResponse", null);
    } else if (s.diagnosticQuestions.length > 0) {
      // данные не менялись — просто вернуться к вопросам
      s.setStep(2);
      setLoading(false);
      return;
    }

    s.pushChat("status", "🔍 Изучаем специфику вашей отрасли...");

    // 1. Парсинг сайта (мягкий фолбэк при ошибке)
    let parsedText = "";
    if (s.websiteUrl.trim()) {
      try {
        const res = await fetch("/api/parse-site", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: s.websiteUrl.trim() }),
        });
        const data = await res.json();
        if (data.ok) {
          parsedText = data.text;
        } else {
          s.pushChat(
            "ai",
            "Не удалось автоматически проанализировать сайт. AI будет опираться на ваше текстовое описание."
          );
        }
      } catch {
        s.pushChat(
          "ai",
          "Не удалось автоматически проанализировать сайт. AI будет опираться на ваше текстовое описание."
        );
      }
    }
    s.setField("parsedWebsiteText", parsedText);

    s.replaceLastStatus("🧭 Анализируем матрицу направленности...");

    // 2. Генерация диагностических вопросов
    try {
      const res = await fetch("/api/ai/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName: s.companyName,
          websiteUrl: s.websiteUrl,
          parsedWebsiteText: parsedText,
          userRole: s.userRole,
          participantCount: s.participantCount,
          goals: s.goals,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "AI недоступен");

      s.setField("diagnosticQuestions", data.questions);
      s.setField("answers", new Array(data.questions.length).fill(""));
      s.markGenerated();
      s.replaceLastStatus("✅ Диагностика подготовлена.");
      s.pushChat("ai", data.chatIntro);
      s.setStep(2);
    } catch (e) {
      const msg =
        e instanceof Error ? e.message : "AI временно недоступен. Попробуйте ещё раз.";
      setError(msg);
      s.replaceLastStatus("⚠️ Не получилось запустить диагностику. Попробуйте ещё раз.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fade-in-up">
      <h1 className="text-3xl font-bold text-brown-deep">Расскажите о вашей компании</h1>
      <p className="mt-2 text-muted">
        За несколько минут AI изучит вашу задачу и подготовит персональную программу
        корпоративного обучения.
      </p>

      {/* Блок эксперта */}
      <div className="mt-8 flex items-center gap-5 rounded-3xl border border-gold-light bg-gradient-to-br from-[#FFFDF5] to-[#FFF9E6] p-5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/photo_2026-07-17_2.jpg"
          alt="Вероника Пунчик"
          className="h-24 w-24 shrink-0 rounded-full border-4 border-gold object-cover shadow-gold"
        />
        <div>
          <h3 className="font-bold text-brown-deep">Вероника Пунчик</h3>
          <p className="text-sm font-semibold text-gold">К.п.н., доцент, бизнес-аналитик</p>
          <p className="mt-1 text-xs leading-relaxed text-muted">
            Автор программы «Нейросервисы и системы ИИ». 25 лет педагогической
            деятельности. Внедрено: БелАЗ, МГИРО, ЭЛТИ-КУДИЦ и другие организации.
          </p>
        </div>
      </div>

      <div className="mt-6 space-y-5">
        <div>
          <label className="label-base">Название компании *</label>
          <input
            className="input-base"
            placeholder="Например, Брестский мясокомбинат"
            value={s.companyName}
            onChange={(e) => s.setField("companyName", e.target.value)}
          />
        </div>
        <div>
          <label className="label-base">Сайт компании</label>
          <input
            className="input-base"
            type="url"
            placeholder="https://company.by"
            value={s.websiteUrl}
            onChange={(e) => s.setField("websiteUrl", e.target.value)}
          />
        </div>
        <div>
          <label className="label-base">Кто будет учиться? (Выберите роль) *</label>
          <select
            className="input-base"
            value={s.userRole}
            onChange={(e) => s.setField("userRole", e.target.value)}
          >
            <option value="">— Выберите категорию —</option>
            {USER_ROLES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label-base">Сколько сотрудников планируете обучить? *</label>
          <input
            className="input-base"
            type="number"
            min={1}
            value={s.participantCount || ""}
            onChange={(e) => s.setField("participantCount", Number(e.target.value))}
          />
        </div>
        <div>
          <label className="label-base">Какие задачи хотите решить? *</label>
          <div className="relative">
            <textarea
              className="input-base pr-12"
              rows={4}
              placeholder="Например: проекты регулярно выходят за сроки, хотим создать единый стандарт работы с документами..."
              value={s.goals}
              onChange={(e) => s.setField("goals", e.target.value)}
            />
            <div className="absolute right-2 top-2">
              <MicButton onText={(t) => s.setField("goals", s.goals ? `${s.goals} ${t}` : t)} />
            </div>
          </div>
        </div>
      </div>

      {error && (
        <p className="mt-4 rounded-2xl bg-red-50 p-3 text-sm text-red-700">{error}</p>
      )}

      <div className="mt-8 flex justify-end">
        <button className="btn-primary" disabled={!canSubmit || loading} onClick={startDiagnostics}>
          {loading ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-brown-deep border-t-transparent" />
              Анализируем...
            </>
          ) : (
            "Начать AI-диагностику →"
          )}
        </button>
      </div>
    </div>
  );
}
