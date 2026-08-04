"use client";

import { useEffect, useRef, useState } from "react";
import { useWizardStore } from "@/store/wizardStore";
import { questionsForRole } from "@/lib/diagnosticQuestions";
import type { UserRole } from "@/lib/pricing";
import MicButton from "./MicButton";

/**
 * Левая колонка (~25% ширины): интерактивный AI-чат на всю высоту.
 * Показывает реплики ассистента и статусы + принимает сообщения пользователя
 * (текст и голос). Ассистент отвечает с учётом контекста визарда (/api/ai/chat).
 */
export default function ChatPanel() {
  const chat = useWizardStore((s) => s.chat);
  const pushChat = useWizardStore((s) => s.pushChat);
  const step = useWizardStore((s) => s.step);
  const userRole = useWizardStore((s) => s.userRole);
  const diagnosticAnswers = useWizardStore((s) => s.diagnosticAnswers);
  const diagnosticNotes = useWizardStore((s) => s.diagnosticNotes);
  const requestProposal = useWizardStore((s) => s.requestProposal);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);

  // Сколько вопросов анкеты уже закрыто — нужно и ассистенту, и кнопке перехода
  const questions = userRole
    ? questionsForRole(userRole as UserRole)
    : [];
  const answeredCount = questions.filter((q) => {
    const a = diagnosticAnswers[q.id];
    return !!a && (a.selected.length > 0 || a.other.trim().length > 0);
  }).length;
  const pendingQuestions = questions
    .filter((q) => {
      const a = diagnosticAnswers[q.id];
      return !a || (a.selected.length === 0 && !a.other.trim());
    })
    .map((q) => q.text);
  const canBuildFromChat =
    step === 2 && (answeredCount >= 1 || diagnosticNotes.trim().length > 0);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [chat.length, sending]);

  // Текст, отправленный ассистенту кнопкой из полей формы (Шаг 1 / «Другое»)
  const outboundChat = useWizardStore((s) => s.outboundChat);
  const handledOutboundRef = useRef(0);
  useEffect(() => {
    if (outboundChat && outboundChat.at !== handledOutboundRef.current) {
      handledOutboundRef.current = outboundChat.at;
      void send(outboundChat.text);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [outboundChat]);

  // Разбор ответа из чата → авто-заполнение анкеты + свободные заметки (шаг 2)
  async function applyDiagnosticsFromChat(text: string, role: string) {
    try {
      const res = await fetch("/api/ai/extract-diagnostics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role, message: text }),
      });
      if (!res.ok) return;
      const data = (await res.json()) as {
        matches?: { qid: string; options: string[]; other: string; single: boolean }[];
        notes?: string;
      };
      const st = useWizardStore.getState();
      let filled = 0;
      for (const m of data.matches ?? []) {
        if (m.single) {
          if (m.options[0]) {
            st.setSingle(m.qid, m.options[0]);
            filled++;
          }
        } else {
          st.mergeDiagnostic(m.qid, m.options ?? [], m.other ?? "");
          if ((m.options?.length ?? 0) > 0 || (m.other ?? "").trim()) filled++;
        }
      }
      const notes = (data.notes ?? "").trim();
      if (notes) st.appendDiagnosticNote(notes);
      if (filled > 0 || notes) {
        pushChat(
          "ai",
          `📝 Отметил ваши ответы в анкете справа${filled ? ` (пунктов: ${filled})` : ""}. Можно сразу нажать «Сформировать предложение» или добавить ещё.`
        );
      }
    } catch {
      /* извлечение не должно ломать чат — тихо игнорируем */
    }
  }

  // Разбор сообщения на шаге 1 → подстановка в поля формы «о компании»
  async function applyCompanyFromChat(text: string) {
    try {
      const res = await fetch("/api/ai/extract-company", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });
      if (!res.ok) return;
      const d = (await res.json()) as {
        companyName?: string;
        userRole?: string;
        participantCount?: number | null;
        goals?: string;
      };
      const st = useWizardStore.getState();
      const filled: string[] = [];
      if (d.companyName && !st.companyName.trim()) {
        st.setField("companyName", d.companyName);
        filled.push("название компании");
      }
      if (d.userRole && !st.userRole) {
        st.setField("userRole", d.userRole);
        filled.push("роль участников");
      }
      if (typeof d.participantCount === "number" && d.participantCount > 0) {
        st.setField("participantCount", d.participantCount);
        filled.push("количество сотрудников");
      }
      if (d.goals && !st.goals.trim()) {
        st.setField("goals", d.goals);
        filled.push("задачи");
      }
      if (filled.length > 0) {
        pushChat(
          "ai",
          `📝 Заполнил в форме справа: ${filled.join(", ")}. Проверьте и нажмите «Начать AI-диагностику».`
        );
      }
    } catch {
      /* автозаполнение не должно ломать чат */
    }
  }

  async function send(preset?: string) {
    const text = (preset ?? input).trim();
    if (!text || sending) return;
    if (!preset) setInput("");
    pushChat("user", text);
    setSending(true);

    // История для модели: только реплики ai/user (без статусов), последние 12
    const s = useWizardStore.getState();
    // Параллельно разбираем сообщение: шаг 1 → в форму, шаг 2 → в анкету/заметки
    if (s.step === 1) {
      void applyCompanyFromChat(text);
    } else if (s.step === 2 && s.userRole) {
      void applyDiagnosticsFromChat(text, s.userRole);
    }
    const history = [...s.chat, { id: "tmp", kind: "user" as const, text }]
      .filter((m) => m.kind === "ai" || m.kind === "user")
      .slice(-12)
      .map((m) => ({ role: m.kind === "ai" ? ("assistant" as const) : ("user" as const), content: m.text }));

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: history,
          context: {
            companyName: s.companyName,
            userRole: s.userRole,
            participantCount: s.participantCount,
            goals: s.goals,
            step: s.step,
            answeredCount,
            totalQuestions: questions.length,
            pendingQuestions: pendingQuestions.slice(0, 3),
            missingCompanyFields: [
              s.companyName.trim() ? "" : "название компании",
              s.userRole ? "" : "кто будет учиться (роль)",
              s.participantCount > 0 ? "" : "количество сотрудников",
              s.goals.trim() ? "" : "какие задачи хотите решить",
            ].filter(Boolean),
            proposal: s.proposal
              ? {
                  assemblyName: s.proposal.assemblyName,
                  totalHours: s.proposal.totalHours,
                  modules: s.proposal.trainingModules.map((m) => `${m.code}. ${m.title}`),
                  trainingTotal: s.proposal.trainingCost.total,
                  currency: s.proposal.trainingCost.currency,
                }
              : null,
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "AI недоступен");
      pushChat("ai", data.reply);
    } catch (e) {
      pushChat(
        "ai",
        e instanceof Error && e.message.length < 160
          ? e.message
          : "Не удалось получить ответ. Попробуйте ещё раз или продолжите заполнение формы."
      );
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex h-full flex-col border-r border-line bg-white">
      {/* Лента сообщений */}
      <div ref={scrollRef} className="flex flex-1 flex-col gap-3 overflow-y-auto p-5">
        {chat.map((m) => (
          <div
            key={m.id}
            className={`fade-in-up rounded-2xl border p-4 text-sm leading-relaxed ${
              m.kind === "status"
                ? "border-gold-light bg-gold-light/40 text-brown-light italic"
                : m.kind === "user"
                  ? "self-end border-line bg-white text-ink"
                  : "border-line border-l-[3px] border-l-gold bg-milk text-ink"
            }`}
          >
            {m.text}
          </div>
        ))}
        {sending && (
          <div className="fade-in-up flex items-center gap-2 rounded-2xl border border-line border-l-[3px] border-l-gold bg-milk p-4 text-sm text-muted">
            <span className="h-3 w-3 animate-spin rounded-full border-2 border-gold border-t-transparent" />
            Ассистент печатает...
          </div>
        )}
      </div>

      {/* Быстрый переход к предложению, когда ответов уже достаточно */}
      {canBuildFromChat && (
        <div className="border-t border-line bg-gold-light/40 p-3">
          <button
            type="button"
            onClick={requestProposal}
            className="btn-primary w-full justify-center !py-3 !text-sm"
          >
            ✨ Сформировать предложение →
          </button>
          <p className="mt-1 text-center text-[11px] text-muted">
            Отвечено вопросов: {answeredCount} из {questions.length}. Можно продолжить диалог —
            предложение станет точнее.
          </p>
        </div>
      )}

      {/* Поле ввода: текст + голос + отправка */}
      <div className="border-t border-line bg-white p-3">
        <div className="flex items-end gap-2 rounded-2xl border border-line bg-milk p-2 focus-within:border-gold">
          <textarea
            className="max-h-28 flex-1 resize-none bg-transparent px-2 py-1 text-sm text-ink outline-none"
            rows={1}
            placeholder="Спросите ассистента или напишите комментарий..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
          />
          <MicButton onText={(t) => setInput((prev) => (prev ? `${prev} ${t}` : t))} />
          <button
            type="button"
            onClick={() => send()}
            disabled={!input.trim() || sending}
            aria-label="Отправить"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold text-brown-deep transition-colors hover:bg-gold-hover disabled:opacity-40"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
              <path d="M2.01 21 23 12 2.01 3 2 10l15 2-15 2z" />
            </svg>
          </button>
        </div>
        <p className="mt-1 px-1 text-[11px] text-muted">
          Enter — отправить, Shift+Enter — новая строка. Можно диктовать голосом 🎙️
        </p>
      </div>
    </div>
  );
}
