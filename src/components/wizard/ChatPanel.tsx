"use client";

import { useEffect, useRef } from "react";
import { useWizardStore } from "@/store/wizardStore";

/**
 * Левая колонка (~25% ширины): AI-чат на всю высоту.
 * «Голос» AI-продажника: приветствия, пояснения, статусы загрузки.
 * Футер на диалоговых/диагностических страницах убран по требованию заказчика —
 * контакты остаются на лендинге.
 */
export default function ChatPanel() {
  const chat = useWizardStore((s) => s.chat);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [chat.length]);

  return (
    <div className="flex h-full flex-col border-r border-line bg-[#FFFDF9]">
      <div ref={scrollRef} className="flex flex-1 flex-col gap-3 overflow-y-auto p-5">
        {chat.map((m) => (
          <div
            key={m.id}
            className={`fade-in-up rounded-2xl border p-4 text-sm leading-relaxed ${
              m.kind === "status"
                ? "border-gold-light bg-gold-light/40 text-brown-light italic"
                : m.kind === "user"
                  ? "border-line bg-white text-ink"
                  : "border-line border-l-[3px] border-l-gold bg-milk text-ink"
            }`}
          >
            {m.text}
          </div>
        ))}
      </div>

    </div>
  );
}
