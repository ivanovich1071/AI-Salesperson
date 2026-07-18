"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useWizardStore } from "@/store/wizardStore";
import ChatPanel from "@/components/wizard/ChatPanel";
import Screen1Company from "@/components/wizard/Screen1Company";
import Screen2Questions from "@/components/wizard/Screen2Questions";
import Screen3Proposal from "@/components/wizard/Screen3Proposal";
import Screen4Objection from "@/components/wizard/Screen4Objection";
import Screen5Booking from "@/components/wizard/Screen5Booking";
import Screen6Success from "@/components/wizard/Screen6Success";

const STEP_TITLES: Record<number, string> = {
  1: "Компания",
  2: "Диагностика",
  3: "Программа",
  4: "Вопросы",
  5: "Встреча",
  6: "Готово",
};

/**
 * Двухколоночный макет визарда (скорректированное ТЗ, раздел 2):
 * слева ~25% — AI-чат (75% высоты) + футер (25%), справа ~75% — активная панель визарда.
 * На мобильных: вертикальный стек, чат сворачивается в нижний лист (bottom sheet).
 */
export default function WizardPage() {
  const step = useWizardStore((s) => s.step);
  const [mounted, setMounted] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);

  // zustand persist → рендерим после монтирования, чтобы избежать hydration mismatch.
  // Переход с лендинга (?new=1) начинает диагностику с чистого листа для нового клиента.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("new") === "1") {
      useWizardStore.getState().reset();
      window.history.replaceState({}, "", "/app");
    }
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex h-screen items-center justify-center bg-milk">
        <span className="h-8 w-8 animate-spin rounded-full border-[3px] border-gold border-t-transparent" />
      </div>
    );
  }

  const screen =
    step === 1 ? <Screen1Company /> :
    step === 2 ? <Screen2Questions /> :
    step === 3 ? <Screen3Proposal /> :
    step === 4 ? <Screen4Objection /> :
    step === 5 ? <Screen5Booking /> :
    <Screen6Success />;

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-milk lg:flex-row">
      {/* Левая колонка: чат + футер (десктоп) */}
      <aside className="hidden w-1/4 min-w-[300px] lg:block">
        <ChatPanel />
      </aside>

      {/* Правая колонка: визард */}
      <main className="relative flex-1 overflow-y-auto">
        {/* Верхняя полоса: назад на лендинг + прогресс */}
        <div className="sticky top-0 z-20 border-b border-line bg-milk/90 px-5 py-3 backdrop-blur">
          <div className="mx-auto flex max-w-3xl items-center justify-between gap-4">
            <Link
              href="/"
              className="text-sm font-semibold text-brown-light hover:text-gold"
            >
              ← На главную
            </Link>
            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4, 5].map((n) => (
                <div key={n} className="flex items-center gap-1.5">
                  <div
                    className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                      step > n || step === 6
                        ? "bg-gold text-brown-deep"
                        : step === n
                          ? "border-2 border-gold bg-white text-brown-deep"
                          : "border border-line bg-white text-muted"
                    }`}
                    title={STEP_TITLES[n]}
                  >
                    {step > n || step === 6 ? "✓" : n}
                  </div>
                  {n < 5 && <div className="h-px w-4 bg-line" />}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-3xl px-5 py-10 pb-28 lg:pb-10">{screen}</div>
      </main>

      {/* Мобильный чат: плавающая кнопка + bottom sheet */}
      <button
        className="fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-gold text-2xl shadow-gold lg:hidden"
        onClick={() => setChatOpen((v) => !v)}
        aria-label="AI-чат"
      >
        {chatOpen ? "✕" : "💬"}
      </button>
      {chatOpen && (
        <div className="fixed inset-x-0 bottom-0 z-30 h-[70vh] overflow-hidden rounded-t-3xl border-t border-line shadow-soft lg:hidden">
          <ChatPanel />
        </div>
      )}
    </div>
  );
}
