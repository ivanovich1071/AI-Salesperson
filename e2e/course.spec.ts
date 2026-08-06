import { test, expect } from "@playwright/test";

/** Лендинг корпоративного курса /course. */

test.beforeEach(async ({ page }) => {
  await page.goto("/course");
});

test("грузится без ошибок в консоли", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  page.on("pageerror", (e) => errors.push(e.message));
  await page.reload();
  await expect(page).toHaveTitle(/Корпоративный курс/);
  expect(errors).toEqual([]);
});

test("личных контактов эксперта нет (правка заказчика)", async ({ page }) => {
  const body = page.locator("body");
  await expect(body).not.toContainText("pvnvna@yandex.by");
  await expect(body).not.toContainText("PedFund");
  await expect(body).not.toContainText("ДоцентыИИноваторы");
  // Вместо них — контакты компании
  await expect(page.getByRole("link", { name: "@vibemindpro" })).toBeVisible();
});

test("«Ключевой спикер» стоит перед именем автора", async ({ page }) => {
  await expect(page.getByText("Ключевой спикер", { exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: /Вероника Николаевна Пунчик/ })).toBeVisible();
});

test("обновлённый список «Внедрено»", async ({ page }) => {
  // SMAIPL есть и в партнёрах, и во внедрениях — берём блок «Внедрено» целиком
  const block = page.locator("#author div").filter({ hasText: "Внедрено:" }).last();
  for (const brand of [
    "БелАЗ",
    "АО ЭЛТИ-КУДИЦ",
    "LLC Newm-Limited",
    "SMAIPL",
    "Клуб Правильного Питания",
  ]) {
    await expect(block).toContainText(brand);
  }
  await expect(block).toContainText(/Руководство проектной работой/);
});

test("тизер «Лаборатории» ведёт на главную", async ({ page }) => {
  const link = page.locator("#solutions").getByRole("link", { name: /Смотреть решения/i });
  await expect(link).toHaveAttribute("href", "/#solutions");
  // Витрина карточек живёт на главной, здесь их быть не должно
  await expect(page.locator("#solutions button")).toHaveCount(0);
});

test("модалка сертификата открывается", async ({ page }) => {
  await page.locator("#author button").first().click();
  const modal = page.locator("div.fixed.inset-0.z-50");
  await expect(modal).toBeVisible();
  await expect(modal.locator("img")).toBeVisible();
  await modal.click({ position: { x: 5, y: 5 } });
  await expect(modal).toBeHidden();
});

test("логотип в шапке ведёт на главную ВайбМайнд", async ({ page }) => {
  await page.locator("nav").getByRole("link").first().click();
  await expect(page).toHaveURL(/\/$/);
});

test("CTA ведёт в визард", async ({ page }) => {
  await page.getByRole("link", { name: /Пройти AI-диагностику/i }).first().click();
  await expect(page).toHaveURL(/\/app/);
});

test("нет горизонтального скролла", async ({ page }) => {
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth + 1
  );
  expect(overflow).toBe(false);
});
