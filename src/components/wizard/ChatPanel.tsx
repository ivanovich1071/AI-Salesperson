"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { useWizardStore } from "@/store/wizardStore";

/**
 * Левая колонка (~25% ширины): верхние ~75% — AI-чат, нижние ~25% — футер.
 * «Голос» AI-продажника: приветствия, пояснения, статусы загрузки.
 */
export default function ChatPanel() {
  const chat = useWizardStore((s) => s.chat);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [chat.length]);

  return (
    <div className="flex h-full flex-col border-r border-line bg-[#FFFDF9]">
      {/* Чат — верхние ~75% */}
      <div ref={scrollRef} className="flex flex-[3] flex-col gap-3 overflow-y-auto p-5">
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

      {/* Футер — нижние ~25% (ТЗ, раздел 2) */}
      <div className="flex flex-1 flex-col justify-center gap-1.5 bg-brown-deep p-5 text-xs text-gold-light">
        <div className="text-sm font-bold">Вероника Пунчик</div>
        <a href="mailto:pvnvna@yandex.by" className="text-gold hover:underline">
          📧 pvnvna@yandex.by
        </a>
        <a
          href="https://t.me/IInovatorsD"
          target="_blank"
          rel="noopener noreferrer"
          className="text-gold hover:underline"
        >
          ✈️ Telegram: ДоцентыИИноваторы
        </a>
        <a
          href="https://github.com/PedFund"
          target="_blank"
          rel="noopener noreferrer"
          className="text-gold hover:underline"
        >
          💻 GitHub
        </a>
        <div className="mt-2 opacity-70">
          <Link href="/privacy" className="hover:underline">
            Политика конфиденциальности
          </Link>
          <br />© 2026 Вероника Пунчик. Все права защищены.
        </div>
      </div>
    </div>
  );
}
