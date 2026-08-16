import { test, expect } from "@playwright/test";

/** Главная страница ВайбМайнд: навигация, витрина решений, адаптив. */

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

test("грузится без ошибок в консоли", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  page.on("pageerror", (e) => errors.push(e.message));
  await page.reload();
  await expect(page).toHaveTitle(/ВайбМайнд/);
  expect(errors).toEqual([]);
});

test("логотип и брендинг", async ({ page }) => {
  // Прозрачный знак, а не старый jpg с белым фоном
  const logos = page.locator('header img, nav img');
  await expect(logos.first()).toHaveAttribute("src", /vibemind-logo-light\.png|vibemind-icon\.png/);
  // «Лаб» из названия убрано по правке заказчика
  await expect(page.locator("body")).not.toContainText("ВайбМайнд Лаб");
});

test("якорная навигация ведёт к секциям", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === "mobile", "на мобильном меню в бургере — проверяется отдельным тестом");
  for (const [label, id] of [
    ["Преимущества", "benefits"],
    ["Как мы работаем", "process"],
    ["Решения", "solutions"],
    ["О компании", "about"],
  ] as const) {
    await page.locator("nav").getByRole("link", { name: label, exact: true }).click();
    await expect(page.locator(`#${id}`)).toBeInViewport({ timeout: 5000 });
  }
});

test("CTA ведут на курс и в визард", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === "mobile", "на мобильном CTA в бургер-меню");
  await page.locator("nav").getByRole("link", { name: "AI-диагностика" }).click();
  await expect(page).toHaveURL(/\/app/);
  await page.goBack();

  await page.getByRole("link", { name: "Корпоративный курс", exact: true }).first().click();
  await expect(page).toHaveURL(/\/course/);
});

test.describe("Ролик о компании", () => {
  test("до прокрутки видео не грузится — только постер", async ({ page }) => {
    const video = page.locator("#video video");
    await expect(video).toHaveAttribute("preload", "none");
    await expect(video).toHaveAttribute("poster", "/images/video-poster.jpg");
    // readyState 0 = ни байта видео ещё не запрошено
    expect(await video.evaluate((v: HTMLVideoElement) => v.readyState)).toBe(0);
  });

  test("на десктопе стартует сам и без звука, на мобильном ждёт тапа", async ({
    page,
  }, testInfo) => {
    const video = page.locator("#video video");
    await page.locator("#video").scrollIntoViewIfNeeded();

    if (testInfo.project.name === "mobile") {
      // Мобильный трафик не тратим без спроса
      await page.waitForTimeout(1500);
      expect(await video.evaluate((v: HTMLVideoElement) => v.paused)).toBe(true);
      return;
    }

    await expect
      .poll(async () => video.evaluate((v: HTMLVideoElement) => v.paused), { timeout: 8000 })
      .toBe(false);
    expect(await video.evaluate((v: HTMLVideoElement) => v.muted)).toBe(true);

    // Уехали со секции — ролик встал, чтобы не крутиться вхолостую
    await page.locator("#contacts").scrollIntoViewIfNeeded();
    await expect
      .poll(async () => video.evaluate((v: HTMLVideoElement) => v.paused), { timeout: 5000 })
      .toBe(true);
  });
});

test.describe("Лаборатория решений", () => {
  test("показывает 7 карточек", async ({ page }) => {
    await expect(page.locator("#solutions button")).toHaveCount(7);
  });

  test("карточка открывает модалку и закрывается", async ({ page }) => {
    // Модалка — оверлей на всю страницу; имя «Иван» есть и в карточке, поэтому ищем внутри неё
    const modal = page.locator("div.fixed.inset-0.z-50");

    await page.locator("#solutions button").first().click();
    await expect(modal).toBeVisible();
    await expect(modal.getByRole("heading", { name: "Иван" })).toBeVisible();
    await expect(modal.getByText("Что умеет")).toBeVisible();

    // Крестик
    await modal.getByRole("button", { name: "Закрыть" }).click();
    await expect(modal).toBeHidden();

    // Клик по фону (в угол оверлея, мимо белой карточки)
    await page.locator("#solutions button").first().click();
    await expect(modal).toBeVisible();
    await modal.click({ position: { x: 5, y: 5 } });
    await expect(modal).toBeHidden();
  });

  test("ссылки на ботов ведут наружу", async ({ page }) => {
    const modal = page.locator("div.fixed.inset-0.z-50");
    await page.locator("#solutions button").first().click();
    const live = modal.getByRole("link", { name: /Потыкать в Telegram/i });
    await expect(live).toHaveAttribute("href", "https://t.me/ELTIKBot");
    await expect(live).toHaveAttribute("target", "_blank");
  });
});

test("контакты: телефон и телеграм компании", async ({ page }) => {
  await expect(page.getByRole("link", { name: /\+375 29 7-200-700/ })).toHaveAttribute(
    "href",
    "tel:+375297200700"
  );
  await expect(page.getByRole("link", { name: "@vibemindpro" })).toHaveAttribute(
    "href",
    "https://t.me/vibemindpro"
  );
});

test.describe("блок «Как мы работаем»", () => {
  test("на десктопе стрелки СТОЯТ МЕЖДУ карточками", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name === "mobile", "на мобильном стрелки скрыты");

    const arrows = page.locator("#process div[aria-hidden]").filter({ hasText: "→" });
    await expect(arrows).toHaveCount(3);

    // Регрессия, которую ловим: из-за lg:flex-col стрелка падала ПОД карточку
    const card = await page.locator("#process .rounded-3xl").first().boundingBox();
    const arrow = await arrows.first().boundingBox();
    expect(arrow!.x).toBeGreaterThan(card!.x + card!.width - 5); // правее карточки
    expect(arrow!.y).toBeGreaterThan(card!.y); // и на её высоте, а не под ней
    expect(arrow!.y).toBeLessThan(card!.y + card!.height);
  });

  test("карточки одной высоты", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name === "mobile", "на мобильном карточки в столбик, высоты разные");
    const boxes = await page.locator("#process .rounded-3xl").all();
    const heights = await Promise.all(
      boxes.map(async (b) => Math.round((await b.boundingBox())!.height))
    );
    expect(new Set(heights).size).toBe(1);
  });
});

test("нет горизонтального скролла", async ({ page }) => {
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth + 1
  );
  expect(overflow).toBe(false);
});

test("навбар не ломается на узком десктопе (~950px)", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === "mobile", "проверка для десктопа");
  await page.setViewportSize({ width: 950, height: 800 });

  // Регрессия: «ВайбМайндПреимущества» наезжали друг на друга
  await expect(page.getByRole("button", { name: "Меню" })).toBeVisible();
  const desktopMenu = page.locator("nav ul").first();
  await expect(desktopMenu).toBeHidden();
});

test("мобильное бургер-меню открывается и ведёт по ссылке", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === "desktop", "проверка для мобильного");

  const burger = page.getByRole("button", { name: "Меню" });
  await expect(burger).toBeVisible();
  await burger.click();
  const menuLink = page.locator("nav ul").getByRole("link", { name: "Решения" });
  await expect(menuLink).toBeVisible();
  await menuLink.click();
  await expect(page.locator("#solutions")).toBeInViewport();
});
