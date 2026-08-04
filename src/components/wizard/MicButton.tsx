"use client";

import { useEffect, useRef, useState } from "react";

type MicState = "idle" | "recording" | "transcribing";

/**
 * Голосовой ввод (ТЗ, раздел 6):
 * 1) иконка микрофона → старт записи (MediaRecorder);
 * 2) красная кнопка «■ Стоп» + мигающий индикатор + таймер, запись до ручного стопа;
 * 3) «Распознаём речь...» → Whisper → текст вставляется в поле.
 * Текстовый фолбэк всегда доступен: это просто кнопка рядом с textarea.
 */
export default function MicButton({
  onText,
  className = "",
}: {
  onText: (text: string) => void;
  className?: string;
}) {
  const [state, setState] = useState<MicState>("idle");
  const [seconds, setSeconds] = useState(0);
  const [error, setError] = useState("");
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef(0);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      recorderRef.current?.stream.getTracks().forEach((t) => t.stop());
    };
  }, []);

  async function startRecording() {
    setError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Пытаемся писать WAV (по ТЗ); браузеры чаще поддерживают webm — используем фолбэк
      const mime = MediaRecorder.isTypeSupported("audio/wav")
        ? "audio/wav"
        : MediaRecorder.isTypeSupported("audio/webm")
          ? "audio/webm"
          : "";
      const rec = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
      chunksRef.current = [];
      rec.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      rec.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const durationMs = Date.now() - startTimeRef.current;
        const type = rec.mimeType || "audio/webm";
        const blob = new Blob(chunksRef.current, { type });
        // Слишком короткое/пустое аудио → Whisper галлюцинирует. Просим повторить.
        if (durationMs < 900 || blob.size < 1200) {
          setError("Слишком коротко — говорите чуть дольше и повторите.");
          setState("idle");
          return;
        }
        await transcribe(blob, type.includes("wav") ? "recording.wav" : "recording.webm");
      };
      recorderRef.current = rec;
      rec.start();
      startTimeRef.current = Date.now();
      setState("recording");
      setSeconds(0);
      timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    } catch {
      setError("Микрофон недоступен — введите текст вручную.");
      setState("idle");
    }
  }

  function stopRecording() {
    if (timerRef.current) clearInterval(timerRef.current);
    setState("transcribing");
    recorderRef.current?.stop();
  }

  async function transcribe(blob: Blob, filename: string) {
    try {
      const form = new FormData();
      form.append("audio", blob, filename);
      const res = await fetch("/api/transcribe", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "transcribe failed");
      if (data.text) onText(data.text);
      else setError("Речь не распознана — попробуйте ещё раз или введите текст.");
    } catch (e) {
      setError(
        e instanceof Error && e.message.length < 120
          ? e.message
          : "Не удалось распознать речь — введите текст вручную."
      );
    } finally {
      setState("idle");
    }
  }

  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {state === "idle" && (
        <button
          type="button"
          onClick={startRecording}
          title="Голосовой ввод"
          className="rounded-full p-2 text-brown-light transition-colors hover:bg-gold-light"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
            <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
            <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
          </svg>
        </button>
      )}
      {state === "recording" && (
        <button
          type="button"
          onClick={stopRecording}
          className="flex items-center gap-2 rounded-2xl bg-red-600 px-3 py-1.5 text-xs font-bold text-white"
        >
          <span className="rec-pulse inline-block h-2 w-2 rounded-full bg-white" />
          ■ Стоп {mm}:{ss}
        </button>
      )}
      {state === "transcribing" && (
        <span className="flex items-center gap-2 text-xs font-medium text-gold">
          <span className="h-3 w-3 animate-spin rounded-full border-2 border-gold border-t-transparent" />
          Распознаём речь...
        </span>
      )}
      {error && <span className="text-xs text-red-600">{error}</span>}
    </div>
  );
}
