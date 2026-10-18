import { test, expect } from "@playwright/test";

/**
 * /solutions — витрина «Лаборатории решений». Карточки приходят из базы
 * (сид scripts/seed-lab.mjs). Соседний admin-solutions.spec.ts параллельно
 * добавляет свои карточки, поэтому считаем «не меньше восьми», а не ровно.
 */

test.beforeEach(async ({ page }) => {
  await page.goto("/solutions");
});

test("стартовые карточки на месте, по порядку", async ({ page }) => {
  await expect(page.getByRole("heading", { level: 1, name: "Лаборатория решений" })).toBeVisible();
  const cards = page.locator("#solutions button");
  expect(await cards.count()).toBeGreaterThanOrEqual(8);
  await expect(cards.first()).toContainText("Корпоративный календарь");
  for (const name of ["Бот SMAIPL", "Рецензент", "Илона", "Retail Scout", "AI Business Auditor"]) {
    await expect(page.locator("#solutions").getByRole("heading", { name, exact: true })).toBeVisible();
  }
});

test("карточка открывает модалку, ссылка ведёт наружу, крестик закрывает", async ({ page }) => {
  const modal = page.locator("div.fixed.inset-0.z-50");
  await page.locator("#solutions button").first().click();
  await expect(modal.getByRole("heading", { name: "Корпоративный календарь" })).toBeVisible();
  await expect(modal.getByText("Что умеет")).toBeVisible();

  const live = modal.getByRole("link", { name: "Открыть демо" });
  await expect(live).toHaveAttribute(
    "href",
    "https://vibemind.by/calendar/demo.html?demo=1"
  );
  await expect(live).toHaveAttribute("target", "_blank");

  await modal.getByRole("button", { name: "Закрыть" }).click();
  await expect(modal).toBeHidden();
});

test("«Запросить демо» ведёт к контактам на этой же странице", async ({ page }) => {
  const modal = page.locator("div.fixed.inset-0.z-50");
  await page.locator("#solutions button").first().click();
  await modal.getByRole("link", { name: "Запросить демо" }).click();
  await expect(modal).toBeHidden();
  await expect(page.locator("#contacts")).toBeInViewport();
});

test("карточка без фото показывает иконку", async ({ page }) => {
  // Retail Scout в сиде — без обложки
  const card = page.locator("#solutions button").filter({ hasText: "Retail Scout" });
  await expect(card.locator("svg")).toBeVisible();
  await expect(card.locator("img")).toHaveCount(0);
});

test("шапка ведёт обратно на главную", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === "mobile", "на мобильном меню в бургере");
  await page.locator("nav").getByRole("link", { name: "О компании" }).click();
  await expect(page).toHaveURL(/\/#about$/);
  await expect(page.locator("#about")).toBeInViewport();
});
