import { expect, type Page } from "@playwright/test";

/**
 * Хелперы визарда. Состояние живёт в localStorage (zustand persist, ключ
 * `ai-salesperson-wizard`), поэтому каждый тест обязан стартовать с чистого листа —
 * иначе прогоны «заражают» друг друга (см. TESTING.md, раздел 4).
 */

/** Открывает визард с нуля: ?new=1 сбрасывает стор. */
export async function openWizard(page: Page) {
  await page.goto("/app?new=1");
  await expect(page.getByRole("heading", { name: /Расскажите о вашей компании/i })).toBeVisible();
}

/** Заполняет шаг 1 и переходит к анкете. */
export async function fillCompanyStep(
  page: Page,
  data: { company?: string; role?: string; count?: string; goals?: string } = {}
) {
  const {
    company = "ООО Тестовая Компания",
    role = "Продажи / коммерческий блок",
    count = "8",
    goals = "Ускорить подготовку коммерческих предложений и писем",
  } = data;

  await page.getByPlaceholder(/Брестский мясокомбинат/i).fill(company);
  await page.getByRole("combobox").selectOption(role);
  await page.locator('input[type="number"]').fill(count);
  await page.getByPlaceholder(/проекты регулярно выходят за сроки/i).fill(goals);

  await page.getByRole("button", { name: /Начать AI-диагностику/i }).click();
  await expect(page.getByRole("heading", { name: /Уточним вашу задачу/i })).toBeVisible();
}

/** Отмечает первый вариант в первом вопросе анкеты. */
export async function answerFirstQuestion(page: Page) {
  await page.locator('input[type="checkbox"]').first().check();
}

/**
 * Кнопка «Сформировать предложение» есть в двух местах: в анкете (main) и в чате (aside).
 * Эти хелперы явно выбирают нужную, иначе Playwright не поймёт, куда кликать.
 */
export const proposalBtnInForm = (page: Page) =>
  page.locator("main").getByRole("button", { name: /Сформировать предложение/i });

export const proposalBtnInChat = (page: Page) =>
  page.locator("aside").getByRole("button", { name: /Сформировать предложение/i });

/** Собирает предложение из анкеты и ждёт третий экран. */
export async function buildProposal(page: Page) {
  await proposalBtnInForm(page).click();
  await expect(page.getByText(/Соответствие вашим задачам/i)).toBeVisible({ timeout: 20_000 });
}

/**
 * Отправляет сообщение в чат ассистента.
 * Кнопку ищем внутри панели чата: в форме есть «Отправить ассистенту», и без
 * уточнения области Playwright не поймёт, какая из двух нужна.
 */
export async function sendChat(page: Page, text: string) {
  const chat = await openChat(page);
  await chat.getByPlaceholder(/Спросите ассистента/i).fill(text);
  await chat.getByRole("button", { name: "Отправить", exact: true }).click();
}

/**
 * Возвращает панель чата. На мобильном она свёрнута в нижний лист —
 * сначала жмём плавающую кнопку 💬, иначе поля ввода не существует.
 */
export async function openChat(page: Page) {
  const aside = page.locator("aside");
  if (!(await aside.isVisible())) {
    await page.getByRole("button", { name: "AI-чат" }).click();
    const sheet = page.locator("div.fixed.inset-x-0.bottom-0");
    await expect(sheet).toBeVisible();
    return sheet;
  }
  return aside;
}
