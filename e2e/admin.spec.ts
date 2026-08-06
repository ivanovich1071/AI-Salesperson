import { test, expect } from "@playwright/test";

/** Админ-панель: логин, брони, карты диагностики, слоты. */

const USER = "admin";
const PASSWORD = "demo2026";

async function login(page: import("@playwright/test").Page) {
  await page.goto("/admin");
  await page.getByLabel("Логин").fill(USER);
  await page.getByLabel("Пароль").fill(PASSWORD);
  await page.getByRole("button", { name: "Войти" }).click();
  await expect(page.getByRole("heading", { name: "Панель управления" })).toBeVisible();
}

test("неверный пароль не пускает", async ({ page }) => {
  await page.goto("/admin");
  await page.getByLabel("Логин").fill(USER);
  await page.getByLabel("Пароль").fill("неверный");
  await page.getByRole("button", { name: "Войти" }).click();

  await expect(page.getByText(/Неверный логин или пароль/i)).toBeVisible();
  await expect(page.getByRole("heading", { name: "Панель управления" })).toBeHidden();
});

test("верный пароль открывает дашборд", async ({ page }) => {
  await login(page);
  await expect(page.getByRole("heading", { name: "Забронированные встречи" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Карты диагностики" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Свободные слоты" })).toBeVisible();
});

test("слоты: добавление и удаление", async ({ page }) => {
  await login(page);

  const DATE = "2027-03-15";
  const added = page.locator("span").filter({ hasText: DATE });

  await page.locator('input[type="date"]').fill(DATE);
  await page.getByPlaceholder("10:00, 14:00, 16:00").fill("11:00, 12:00");
  await page.getByRole("button", { name: /Добавить/i }).click();

  await expect(page.getByText(/Добавлено слотов: 2/)).toBeVisible({ timeout: 10_000 });
  await expect(added).toHaveCount(2);

  // Удаляем один — второй остаётся
  await added.first().getByRole("button").click();
  await expect(added).toHaveCount(1, { timeout: 10_000 });
});

test("выход из админки", async ({ page }) => {
  await login(page);
  await page.getByRole("button", { name: "Выйти" }).click();
  await expect(page.getByRole("heading", { name: /Вход в админ-панель/i })).toBeVisible();
});
