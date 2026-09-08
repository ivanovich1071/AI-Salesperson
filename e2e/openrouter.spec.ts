import { test, expect } from "@playwright/test";
import { chatCompletion, chatJson } from "../src/lib/openrouter";

/**
 * Лимит длины ответа в запросах к OpenRouter. Браузер не нужен — это чистая
 * логика, поэтому на мобильном проекте прогон пропускаем. Живой OpenRouter не
 * дёргаем: fetch подменяется заглушкой.
 *
 * Зачем этот тест. Без max_tokens часть провайдеров модели подставляет под ответ
 * весь контекст (131072 токена), и запрос падает с 400 «token count exceeds the
 * model's maximum context length» — даже на входе в триста токенов. 8 сентября
 * 2026 это уронило все пять AI-роутов сразу, а выглядело как «падает диагностика».
 * Существующие e2e такое не ловят: e2e/helpers/mockAi.ts перехватывает сами роуты,
 * и до OpenRouter-клиента дело не доходит.
 */

/** Контекст qwen3-235b — тот самый потолок, в который упирался запрос */
const MODEL_CONTEXT = 131072;

interface CapturedBody {
  max_tokens?: number;
  messages: { role: string; content: string }[];
}

/** Подменяет fetch и копит тела запросов; возвращает функцию возврата как было */
function stubFetch(replies: string[]) {
  const bodies: CapturedBody[] = [];
  const original = globalThis.fetch;
  let call = 0;

  globalThis.fetch = (async (_url: unknown, init: { body: string }) => {
    bodies.push(JSON.parse(init.body) as CapturedBody);
    const content = replies[Math.min(call++, replies.length - 1)];
    return { ok: true, json: async () => ({ choices: [{ message: { content } }] }) };
  }) as unknown as typeof fetch;

  return { bodies, restore: () => void (globalThis.fetch = original) };
}

test.beforeEach(({}, testInfo) => {
  test.skip(testInfo.project.name === "mobile", "чистая логика, от устройства не зависит");
  process.env.OPENROUTER_API_KEY = "test-key-not-used";
});

test.describe("Запрос к OpenRouter", () => {
  test("всегда несёт max_tokens, и он оставляет место под входные токены", async () => {
    const stub = stubFetch(["Готово."]);
    try {
      await chatCompletion([{ role: "user", content: "Привет" }]);
    } finally {
      stub.restore();
    }

    expect(stub.bodies).toHaveLength(1);
    const limit = stub.bodies[0].max_tokens;
    expect(limit, "max_tokens не задан — провайдер подставит весь контекст").toBeDefined();
    expect(limit!).toBeGreaterThan(0);
    expect(limit!, "лимит съедает контекст целиком").toBeLessThan(MODEL_CONTEXT / 2);
  });

  test("лимит из вызова роута перекрывает значение по умолчанию", async () => {
    const stub = stubFetch(["Готово."]);
    try {
      await chatCompletion([{ role: "user", content: "Привет" }], { maxTokens: 3000 });
    } finally {
      stub.restore();
    }

    expect(stub.bodies[0].max_tokens).toBe(3000);
  });

  test("повторный запрос за валидным JSON тоже с лимитом", async () => {
    // Первый ответ не проходит проверку — chatJson делает второй запрос.
    const stub = stubFetch(['{"ok":false}', '{"ok":true}']);
    try {
      const result = await chatJson<{ ok: boolean }>(
        [{ role: "user", content: "Верни JSON" }],
        (d) => {
          const v = d as { ok?: boolean };
          if (!v.ok) throw new Error("невалидно");
          return { ok: true };
        },
        { maxTokens: 1500 }
      );
      expect(result.ok).toBe(true);
    } finally {
      stub.restore();
    }

    expect(stub.bodies, "повтора не было — тест ничего не проверил").toHaveLength(2);
    for (const body of stub.bodies) {
      expect(body.max_tokens).toBe(1500);
    }
  });
});
