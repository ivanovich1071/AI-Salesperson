import path from "node:path";
import { test, expect, type Page } from "@playwright/test";

/**
 * Раздел «Лаборатория решений» в админке — полный цикл карточки глазами
 * второго пользователя (как вход Вероники на проде, см. ADMIN_USERS в
 * playwright.config.ts): создать с фото → видна на сайте → скрыть → удалить.
 */

const USER = "veronika";
const PASSWORD = "e2e-second-pass";
const PHOTO = path.join(__dirname, "..", "public", "images", "lab", "ivan.jpg");

async function login(page: Page) {
  await page.goto("/admin");
  await page.getByLabel("Логин").fill(USER);
  await page.getByLabel("Пароль").fill(PASSWORD);
  await page.getByRole("button", { name: "Войти" }).click();
  await expect(page.getByText(`Вы вошли как ${USER}`)).toBeVisible();
  await page.getByRole("tab", { name: "Лаборатория решений" }).click();
}

// Тесты файла пишут в одну таблицу SQLite — параллельные записи мешают друг другу
test.describe.configure({ mode: "serial" });

test.beforeEach(({}, testInfo) => {
  // Одна и та же база на оба проекта — хватит одного прогона цикла
  test.skip(testInfo.project.name === "mobile", "проверяется на десктопе");
});

test("карточка: создать с фото → на сайте → скрыть → удалить", async ({ page }) => {
  const name = `Тестовый помощник ${Date.now()}`;
  await login(page);

  await page.getByRole("button", { name: "+ Новая карточка" }).click();
  await page.getByLabel("Название *").fill(name);
  await page.getByLabel("Роль (подзаголовок карточки) *").fill("Виртуальный тестировщик");
  await page.getByLabel("Какую задачу решает *").fill("Проверяет, что админка работает.");
  await page.getByLabel("Что умеет (пункт на строку)").fill("Создает карточки\nУдаляет карточки");
  await page.getByLabel("Ссылка (демо, сайт, GitHub)").fill("https://example.com/demo");
  await page.getByLabel("Надпись на кнопке").fill("Открыть демо");

  // Фото: браузер ужимает и загружает, предпросмотр показывает загруженный файл
  await page.getByTestId("lab-photo-input").setInputFiles(PHOTO);
  const previewImg = page.getByTestId("lab-preview").locator("img");
  await expect(previewImg).toHaveAttribute("src", /\/uploads\/lab\/[a-f0-9]{24}\.jpg/);
  const photoUrl = (await previewImg.getAttribute("src"))!;

  await page.getByRole("button", { name: "Сохранить" }).click();
  await expect(page.getByText(`Карточка «${name}» добавлена и уже на сайте ✓`)).toBeVisible();

  const row = page.getByTestId("lab-row").filter({ hasText: name });
  await expect(row).toContainText(`правил(а): ${USER}`);

  // Фото отдается сайтом
  const img = await page.request.get(photoUrl);
  expect(img.status()).toBe(200);
  expect(img.headers()["content-type"]).toBe("image/jpeg");

  // На витрине — с фото, модалкой и ссылкой
  const site = await page.context().newPage();
  await site.goto("/solutions");
  const card = site.locator("#solutions button").filter({ hasText: name });
  await expect(card).toBeVisible();
  await expect(card.locator("img")).toHaveAttribute("src", photoUrl);
  await card.click();
  await expect(site.getByRole("link", { name: "Открыть демо" })).toHaveAttribute(
    "href",
    "https://example.com/demo"
  );

  // Скрыть — пропала с сайта, но осталась в админке
  await row.getByRole("button", { name: "Скрыть" }).click();
  await expect(page.getByText(`«${name}» скрыта с сайта.`)).toBeVisible();
  await site.reload();
  await expect(site.locator("#solutions button").filter({ hasText: name })).toHaveCount(0);

  // Удалить — вместе с загруженным фото
  page.once("dialog", (d) => d.accept());
  await row.getByRole("button", { name: "Удалить" }).click();
  await expect(page.getByText(`Карточка «${name}» удалена.`)).toBeVisible();
  await expect(row).toHaveCount(0);
  expect((await page.request.get(photoUrl)).status()).toBe(404);
});

test("порядок меняется стрелками", async ({ page }) => {
  await login(page);

  // Свои СКРЫТЫЕ карточки: витрину и тизер на главной, которые параллельно
  // проверяют другие тесты, перестановка не трогает
  const stamp = Date.now();
  const [a, b] = [`Порядок А ${stamp}`, `Порядок Б ${stamp}`];
  const ids: string[] = [];
  for (const name of [a, b]) {
    const res = await page.request.post("/api/admin/solutions", {
      data: { name, role: "r", task: "t", abilities: [], tags: [], status: "s", tone: "soon", isPublished: false },
    });
    expect(res.ok()).toBe(true);
    ids.push((await res.json()).solution.id);
  }
  await page.reload();
  await page.getByRole("tab", { name: "Лаборатория решений" }).click();
  await expect(page.getByTestId("lab-row").filter({ hasText: b })).toBeVisible();

  const names = () => page.getByTestId("lab-row").locator("p.font-semibold").allInnerTexts();
  const pos = async (name: string) => (await names()).findIndex((t) => t.includes(name));
  expect(await pos(a)).toBeLessThan(await pos(b));

  // Строки переставляются на экране сразу — ждем, пока порядок сохранит сервер
  const saved = page.waitForResponse((r) => r.url().endsWith("/api/admin/solutions/reorder"));
  await page.getByRole("button", { name: `Поднять «${b}»` }).click();
  expect((await saved).ok()).toBe(true);
  await expect.poll(async () => (await pos(b)) < (await pos(a))).toBe(true);

  // Порядок сохранился на сервере, а не только на экране
  await page.reload();
  await page.getByRole("tab", { name: "Лаборатория решений" }).click();
  await expect(page.getByTestId("lab-row").filter({ hasText: b })).toBeVisible();
  await expect.poll(async () => (await pos(b)) < (await pos(a))).toBe(true);

  for (const id of ids) {
    expect((await page.request.delete(`/api/admin/solutions/${id}`)).ok()).toBe(true);
  }
});

test("форма не принимает ссылку не на http(s)", async ({ page }) => {
  await login(page);
  const res = await page.request.post("/api/admin/solutions", {
    data: {
      name: "X",
      role: "X",
      task: "X",
      abilities: [],
      tags: [],
      status: "X",
      tone: "ready",
      liveUrl: "javascript:alert(1)",
    },
  });
  expect(res.status()).toBe(400);
  expect((await res.json()).error).toMatch(/http/);
});

test("без входа API карточек закрыт", async ({ playwright }) => {
  const anon = await playwright.request.newContext({ baseURL: "http://127.0.0.1:3100" });
  expect((await anon.get("/api/admin/solutions")).status()).toBe(401);
  expect(
    (await anon.post("/api/admin/solutions", { data: { name: "взлом" } })).status()
  ).toBe(401);
  expect(
    (
      await anon.post("/api/admin/solutions/upload", {
        multipart: { file: { name: "a.jpg", mimeType: "image/jpeg", buffer: Buffer.from("x") } },
      })
    ).status()
  ).toBe(401);
  await anon.dispose();
});

test("отдача фото не выпускает за каталог загрузок", async ({ request }) => {
  for (const bad of ["..%2F..%2F.env", "passwd", "abc.jpg"]) {
    expect((await request.get(`/uploads/lab/${bad}`)).status()).toBe(404);
  }
});
