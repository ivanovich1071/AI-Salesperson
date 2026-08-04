import { buildSystemPrompt } from "./knowledge";

const OPENROUTER_BASE = "https://openrouter.ai/api/v1";

function apiKey(): string {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key || key.includes("xxxx")) {
    throw new Error("OPENROUTER_API_KEY не настроен в .env");
  }
  return key;
}

export function textModel(): string {
  return process.env.OPENROUTER_MODEL || "qwen/qwen3-235b-a22b-2507";
}

export function whisperModel(): string {
  return process.env.OPENROUTER_WHISPER_MODEL || "openai/whisper-large-v3";
}

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

/**
 * Запрос к текстовой модели (Qwen) через OpenRouter.
 * Системный промпт (prompts/assistant-system.md) + база знаний (knowledge/)
 * добавляются автоматически.
 */
export async function chatCompletion(
  userMessages: ChatMessage[],
  opts: { json?: boolean; temperature?: number; system?: string } = {}
): Promise<string> {
  // По умолчанию — системный промпт AI-продажника + база знаний.
  // Для технических задач (напр. извлечение анкеты) можно передать свой system.
  const messages: ChatMessage[] = [
    { role: "system", content: opts.system ?? buildSystemPrompt() },
    ...userMessages,
  ];

  const res = await fetch(`${OPENROUTER_BASE}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey()}`,
      "Content-Type": "application/json",
      "HTTP-Referer":
        process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3100",
      "X-Title": "AI Salesperson - Veronika Punchik",
    },
    body: JSON.stringify({
      model: textModel(),
      messages,
      temperature: opts.temperature ?? 0.4,
      ...(opts.json ? { response_format: { type: "json_object" } } : {}),
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`OpenRouter ${res.status}: ${body.slice(0, 500)}`);
  }

  const data = await res.json();
  const content: string | undefined = data?.choices?.[0]?.message?.content;
  if (!content) throw new Error("OpenRouter вернул пустой ответ");
  return content;
}

/** Вырезает JSON из ответа модели (на случай markdown-обёртки или reasoning-префикса) */
export function extractJson(raw: string): string {
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
  const candidate = fenced ? fenced[1] : raw;
  const start = candidate.search(/[{[]/);
  if (start === -1) return candidate.trim();
  return candidate.slice(start).trim();
}

/**
 * Запрос JSON с валидацией через переданный парсер (zod .parse).
 * При ошибке парсинга — один повторный запрос с указанием на ошибку (по ТЗ).
 */
export async function chatJson<T>(
  userMessages: ChatMessage[],
  parse: (data: unknown) => T,
  opts: { system?: string; temperature?: number } = {}
): Promise<T> {
  const first = await chatCompletion(userMessages, {
    json: true,
    system: opts.system,
    temperature: opts.temperature,
  });
  try {
    return parse(JSON.parse(extractJson(first)));
  } catch (e) {
    const retry = await chatCompletion(
      [
        ...userMessages,
        { role: "assistant", content: first },
        {
          role: "user",
          content: `Твой предыдущий ответ не прошёл валидацию JSON-схемы: ${String(
            e
          ).slice(
            0,
            300
          )}. Верни ТОЛЬКО исправленный валидный JSON без каких-либо пояснений.`,
        },
      ],
      { json: true, temperature: 0.2, system: opts.system }
    );
    return parse(JSON.parse(extractJson(retry)));
  }
}

/**
 * Типичные «галлюцинации» Whisper на тишине/шуме/слишком коротком аудио.
 * На таком входе модель выдаёт заученные фразы из титров роликов — их нужно
 * отсекать, иначе в поле попадает мусор вроде «Продолжение следует...».
 */
const WHISPER_HALLUCINATIONS = [
  "продолжение следует",
  "спасибо за просмотр",
  "спасибо за внимание",
  "подписывайтесь на канал",
  "подписывайтесь",
  "субтитры",
  "редактор субтитров",
  "корректор",
  "продолжение в следующей серии",
  "не забудьте поставить лайк",
  "ставьте лайки",
  "всем пока",
  "до новых встреч",
  "dimatorzok",
];

/** Пустой результат, если распознан только мусор-галлюцинация (короткий и совпал со стоп-фразой). */
function cleanTranscript(raw: string): string {
  const text = (raw ?? "").trim();
  if (!text) return "";
  const norm = text.toLowerCase().replace(/[.,!?…"'«»\-–—]/g, " ").replace(/\s+/g, " ").trim();
  if (norm.length <= 40 && WHISPER_HALLUCINATIONS.some((h) => norm.includes(h))) {
    return "";
  }
  return text;
}

/**
 * Транскрибация аудио через OpenRouter (Whisper Large V3).
 * OpenAI-совместимый endpoint /audio/transcriptions.
 * Фильтрует типичные галлюцинации Whisper на тишине (иначе в поле летит мусор).
 */
export async function transcribeAudio(
  audio: Blob,
  filename: string
): Promise<string> {
  const form = new FormData();
  form.append("file", audio, filename);
  form.append("model", whisperModel());
  form.append("language", "ru");
  form.append("temperature", "0"); // меньше «фантазий» на неоднозначном аудио

  const res = await fetch(`${OPENROUTER_BASE}/audio/transcriptions`, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey()}` },
    body: form,
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Whisper ${res.status}: ${body.slice(0, 500)}`);
  }

  const data = await res.json();
  return cleanTranscript(data?.text ?? "");
}
