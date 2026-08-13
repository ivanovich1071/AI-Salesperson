import { NextRequest, NextResponse } from "next/server";
import { transcribeAudio } from "@/lib/openrouter";

export const runtime = "nodejs";
export const maxDuration = 60;

/** Заголовку content-length верить нельзя — проверяем реальный размер файла. */
const MAX_AUDIO_BYTES = 5 * 1024 * 1024;

/**
 * POST /api/transcribe (multipart: audio)
 * Whisper Large V3 через OpenRouter. Возвращает «сырой» текст без постобработки.
 */
export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const audio = form.get("audio");
    if (!(audio instanceof Blob) || audio.size === 0) {
      return NextResponse.json(
        { error: "Аудиозапись не получена. Попробуйте ещё раз или введите текст вручную." },
        { status: 400 }
      );
    }

    if (audio.size > MAX_AUDIO_BYTES) {
      return NextResponse.json(
        { error: "Запись слишком длинная. Попробуйте сказать короче или введите текст вручную." },
        { status: 413 }
      );
    }

    const filename =
      audio instanceof File && audio.name ? audio.name : "recording.wav";
    const text = await transcribeAudio(audio, filename);

    return NextResponse.json({ text });
  } catch (e) {
    console.error("[transcribe]", e);
    return NextResponse.json(
      {
        error:
          "Не удалось распознать речь. Пожалуйста, введите текст вручную — это займёт минуту.",
      },
      { status: 502 }
    );
  }
}
