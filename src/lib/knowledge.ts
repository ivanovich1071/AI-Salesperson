import fs from "fs";
import path from "path";

// Мягкий лимит на суммарный объём базы знаний в промпте.
// При росте БЗ старшие файлы обрезаются с предупреждением в консоль.
const MAX_KNOWLEDGE_CHARS = 60_000;

let cached: { text: string; loadedAt: number } | null = null;
const CACHE_TTL_MS = 60_000; // в dev перечитываем не чаще раза в минуту

/**
 * Загружает все .md-файлы из папки knowledge/ (в алфавитном порядке)
 * и склеивает их в единый RAG-контекст для системного промпта.
 */
export function loadKnowledgeBase(): string {
  if (cached && Date.now() - cached.loadedAt < CACHE_TTL_MS) {
    return cached.text;
  }

  const dir = path.join(process.cwd(), "knowledge");
  let text = "";
  try {
    const files = fs
      .readdirSync(dir)
      .filter((f) => f.endsWith(".md") && f.toLowerCase() !== "readme.md")
      .sort();

    const parts: string[] = [];
    for (const f of files) {
      const content = fs.readFileSync(path.join(dir, f), "utf8");
      parts.push(`\n\n===== ФАЙЛ БАЗЫ ЗНАНИЙ: ${f} =====\n\n${content}`);
    }
    text = parts.join("");

    if (text.length > MAX_KNOWLEDGE_CHARS) {
      console.warn(
        `[knowledge] База знаний превышает лимит ${MAX_KNOWLEDGE_CHARS} символов (сейчас ${text.length}) — обрезаю. Увеличьте MAX_KNOWLEDGE_CHARS или сократите файлы.`
      );
      text = text.slice(0, MAX_KNOWLEDGE_CHARS);
    }
  } catch (e) {
    console.error("[knowledge] Не удалось загрузить базу знаний:", e);
  }

  cached = { text, loadedAt: Date.now() };
  return text;
}

/** Системный промпт из prompts/assistant-system.md + база знаний */
export function buildSystemPrompt(): string {
  let prompt = "";
  try {
    prompt = fs.readFileSync(
      path.join(process.cwd(), "prompts", "assistant-system.md"),
      "utf8"
    );
  } catch {
    prompt =
      "Ты — AI-продажник корпоративного обучения Вероники Пунчик. Отвечай на русском.";
  }
  return `${prompt}\n\n========== БАЗА ЗНАНИЙ ==========\n${loadKnowledgeBase()}`;
}
