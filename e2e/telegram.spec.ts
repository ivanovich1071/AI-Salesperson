import { test, expect } from "@playwright/test";
import {
  diagnosticsNotifyEnabled,
  formatBookingMessage,
  formatDiagnosticMessage,
  isTelegramConfigured,
  sendTelegramMessage,
} from "../src/lib/telegram";

/**
 * Уведомления в Telegram. Браузер не нужен — это чистая логика,
 * поэтому на мобильном проекте прогон пропускаем. Живой Bot API не дёргаем.
 */
test.beforeEach(({}, testInfo) => {
  test.skip(testInfo.project.name === "mobile", "чистая логика, от устройства не зависит");
});

const BOOKING = {
  name: "Иван Петров",
  company: "ООО «Ромашка»",
  email: "ivan@romashka.by",
  phone: "+375291234567",
  date: "2026-09-01",
  time: "10:00",
  totalCost: 6500,
  role: "Руководитель отдела",
  participants: 20,
  modules: ["Б1. Основы ИИ", "П3. Аналитика"],
};

test.describe("Текст уведомлений", () => {
  test("в заявке на встречу есть всё, что нужно для звонка клиенту", () => {
    const msg = formatBookingMessage(BOOKING);
    for (const part of ["2026-09-01", "10:00", "Ромашка", "Иван Петров", "+375291234567", "ivan@romashka.by"]) {
      expect(msg, `в уведомлении нет «${part}»`).toContain(part);
    }
    expect(msg).toContain("6 500 BYN");
    expect(msg).toContain("/admin");
  });

  test("угловые скобки в данных клиента не ломают разметку", () => {
    const msg = formatBookingMessage({ ...BOOKING, company: "<script>alert(1)</script> & Co" });
    expect(msg).not.toContain("<script>");
    expect(msg).toContain("&lt;script&gt;");
    expect(msg).toContain("&amp; Co");
  });

  test("нулевая стоимость не выводится строкой «0 BYN»", () => {
    expect(formatBookingMessage({ ...BOOKING, totalCost: 0 })).not.toContain("BYN");
  });

  test("уведомление о диагностике помечено как «встречи ещё нет»", () => {
    const msg = formatDiagnosticMessage({
      companyName: "ООО «Ромашка»",
      userRole: "HR",
      participantCount: 15,
      matchScore: 82,
      totalCost: 4500,
    });
    expect(msg).toContain("82%");
    expect(msg).toContain("4 500 BYN");
    expect(msg).toContain("не забронирована");
  });
});

test.describe("Поведение без настроек", () => {
  test("без токена отправка молча возвращает ноль, а не падает", async () => {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chat = process.env.TELEGRAM_CHAT_ID;
    delete process.env.TELEGRAM_BOT_TOKEN;
    delete process.env.TELEGRAM_CHAT_ID;
    try {
      expect(isTelegramConfigured()).toBe(false);
      expect(await sendTelegramMessage("проверка")).toBe(0);
    } finally {
      if (token) process.env.TELEGRAM_BOT_TOKEN = token;
      if (chat) process.env.TELEGRAM_CHAT_ID = chat;
    }
  });

  test("уведомления о диагностике выключаются флагом", () => {
    const prev = process.env.TELEGRAM_NOTIFY_DIAGNOSTICS;
    try {
      delete process.env.TELEGRAM_NOTIFY_DIAGNOSTICS;
      expect(diagnosticsNotifyEnabled()).toBe(true);
      process.env.TELEGRAM_NOTIFY_DIAGNOSTICS = "off";
      expect(diagnosticsNotifyEnabled()).toBe(false);
    } finally {
      if (prev === undefined) delete process.env.TELEGRAM_NOTIFY_DIAGNOSTICS;
      else process.env.TELEGRAM_NOTIFY_DIAGNOSTICS = prev;
    }
  });
});
