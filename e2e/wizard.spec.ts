import { test, expect } from "@playwright/test";
import { mockAi, mockAiFailure } from "./helpers/mockAi";
import {
  openWizard,
  fillCompanyStep,
  answerFirstQuestion,
  buildProposal,
  sendChat,
  openChat,
  proposalBtnInForm,
} from "./helpers/wizard";

/**
 * Визард AI-диагностики: 6 экранов.
 * AI везде замокан (см. helpers/mockAi.ts) — иначе тесты были бы медленными,
 * платными и «мигающими».
 */

test.beforeEach(async ({ page }) => {
  await mockAi(page);
});

test("ассистент представляется от лица компании", async ({ page }) => {
  await openWizard(page);
  const chat = await openChat(page);
  await expect(chat.getByText(/AI-ассистент компании ВайбМайнд/)).toBeVisible();
  await expect(page.locator("body")).not.toContainText("AI-ассистент Вероники Пунчик");
});

test("кнопка диагностики неактивна без обязательных полей", async ({ page }) => {
  await openWizard(page);
  const btn = page.getByRole("button", { name: /Начать AI-диагностику/i });
  await expect(btn).toBeDisabled();

  await page.getByPlaceholder(/Брестский мясокомбинат/i).fill("ООО Тест");
  await expect(btn).toBeDisabled(); // роли и задач всё ещё нет

  await page.getByRole("combobox").selectOption("Руководители");
  await page.getByPlaceholder(/проекты регулярно выходят за сроки/i).fill("Автоматизировать отчёты");
  await expect(btn).toBeEnabled();
});

test("сквозной путь: компания → анкета → предложение → бронь → успех", async ({ page }) => {
  await openWizard(page);
  await fillCompanyStep(page);
  await answerFirstQuestion(page);
  await buildProposal(page);

  // Шаг 3: предложение с расчётом
  await expect(page.getByText("84%")).toBeVisible();
  await expect(page.getByText(/Базовая сборка/)).toBeVisible();

  // Шаг 5: выбор слота и контакты
  await page.getByRole("button", { name: /Выбрать время встречи/i }).click();
  await expect(page.getByRole("heading", { name: /Обсудим программу с экспертом/i })).toBeVisible();

  // Сначала дата, только потом появляется список времени
  await page.locator("main .grid button").first().click();
  await page.locator("main button").filter({ hasText: /^\d{2}:\d{2}$/ }).first().click();

  await page.getByPlaceholder("Иван Иванов").fill("Иван Тестов");
  await page.getByPlaceholder("ivan@company.by").fill("test@example.com");
  await page.getByPlaceholder(/\+375/).fill("+375291234567");

  await page.getByRole("button", { name: /Подтвердить встречу/i }).click();

  // Шаг 6: подтверждение
  await expect(page.getByRole("heading", { name: /Встреча забронирована/i })).toBeVisible({
    timeout: 15_000,
  });
});

test("ветка возражения: шаг 3 → 4 → 5", async ({ page }) => {
  await openWizard(page);
  await fillCompanyStep(page);
  await answerFirstQuestion(page);
  await buildProposal(page);

  await page.getByPlaceholder(/Стоимость, формат, сроки/i).fill("Дорого для нас");
  // При заполненном возражении кнопка меняет текст на «Обсудить сомнения»
  await page.getByRole("button", { name: /Обсудить сомнения/i }).click();

  // Шаг 4: ответ на возражение из 4 частей
  await expect(page.getByText(/Понимаю, бюджет/)).toBeVisible({ timeout: 15_000 });
  await page.getByRole("button", { name: /Выбрать время встречи/i }).click();
  await expect(page.getByRole("heading", { name: /Обсудим программу с экспертом/i })).toBeVisible();
});

test.describe("степпер", () => {
  test("назад свободно, вперёд — только по готовности", async ({ page }) => {
    await openWizard(page);

    // На шаге 1 идти некуда
    const steps = page.locator('button[title*="Перейти"], button[title*="недоступно"]');
    await expect(steps).toHaveCount(5);
    for (const s of await steps.all()) await expect(s).toBeDisabled();

    await fillCompanyStep(page);

    // Теперь шаг 1 доступен «назад», а шаг 3 ещё нет — предложения не собрано
    await expect(page.locator('button[title*="Перейти"]').first()).toBeEnabled();
    await expect(page.locator('button[title*="Программа — пока недоступно"]')).toBeDisabled();

    await answerFirstQuestion(page);
    await buildProposal(page);

    // После расчёта можно вернуться назад: пройденные шаги показывают «✓»,
    // поэтому ищем по подсказке, а не по номеру
    await page.locator('button[title="Перейти: Диагностика"]').click();
    await expect(page.getByRole("heading", { name: /Уточним вашу задачу/i })).toBeVisible();
  });
});

test.describe("чат ассистента", () => {
  // На мобильном чат живёт в нижнем листе поверх формы — сценарии проверяем на десктопе
  test.skip(({ isMobile }) => !!isMobile, "чат проверяется на десктопе");
  test("заполняет форму шага 1 из сообщения", async ({ page }) => {
    await openWizard(page);
    await sendChat(page, "ООО Ромашка, 8 продажников, ускорить подготовку КП");

    await expect(page.getByPlaceholder(/Брестский мясокомбинат/i)).toHaveValue("ООО Ромашка", {
      timeout: 15_000,
    });
    await expect(page.getByRole("combobox")).toHaveValue("Продажи / коммерческий блок");
    await expect(page.locator('input[type="number"]')).toHaveValue("8");
    await expect(page.getByRole("button", { name: /Начать AI-диагностику/i })).toBeEnabled();
  });

  test("отмечает варианты анкеты и активирует кнопку предложения", async ({ page }) => {
    await openWizard(page);
    await fillCompanyStep(page);

    // До ответов кнопка заблокирована
    await expect(proposalBtnInForm(page)).toBeDisabled();

    await sendChat(page, "готовим КП и письма, ИИ пока не используем");

    await expect(page.getByText(/Отметил ваши ответы в анкете/)).toBeVisible({ timeout: 15_000 });
    await expect(page.locator('input[type="checkbox"]:checked')).not.toHaveCount(0);
    await expect(proposalBtnInForm(page)).toBeEnabled();
  });

  test("не показывает служебный JSON", async ({ page }) => {
    await openWizard(page);
    await sendChat(page, "что входит в программу?");
    const chat = await openChat(page);
    await expect(chat).not.toContainText('"step"');
    await expect(chat).not.toContainText("program_selection");
  });
});

test("голосовой ввод: запись → распознавание → текст в поле", async ({ page }) => {
  await openWizard(page);

  const goals = page.getByPlaceholder(/проекты регулярно выходят за сроки/i);
  await page.getByRole("button", { name: "Голосовой ввод" }).last().click();

  const stop = page.getByRole("button", { name: /Стоп/ });
  await expect(stop).toBeVisible();
  await page.waitForTimeout(1200); // короче — сработает защита от «слишком коротко»
  await stop.click();

  await expect(goals).toHaveValue(/автоматизировать подготовку отчётов/i, { timeout: 20_000 });
});

test("дружелюбная ошибка при сбое AI", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === "mobile", "проверяется на десктопе");
  await openWizard(page);
  await fillCompanyStep(page);
  await answerFirstQuestion(page);

  await mockAiFailure(page); // /api/ai/proposal → 502
  await proposalBtnInForm(page).click();

  const err = page.getByText(/Не удалось сформировать предложение/i).first();
  await expect(err).toBeVisible({ timeout: 15_000 });
  // Никаких stack trace пользователю
  await expect(page.locator("body")).not.toContainText("Error:");
});
