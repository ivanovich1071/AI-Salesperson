import { test, expect } from "@playwright/test";
import { mockAi } from "./helpers/mockAi";
import {
  openWizard,
  fillCompanyStep,
  answerFirstQuestion,
  buildProposal,
} from "./helpers/wizard";

/**
 * Визуальные эталоны ключевых экранов — ловят «поехавшую» вёрстку
 * (например, стрелки, уехавшие под карточки).
 *
 * После НАМЕРЕННЫХ правок дизайна обновить: npm run test:e2e:update
 */

test.beforeEach(async ({ page }) => {
  await mockAi(page);
  // Анимации появления (.fade-in-up) иначе дают разный кадр от прогона к прогону
  await page.addStyleTag({
    content: `*, *::before, *::after { animation: none !important; transition: none !important; }`,
  });
});

test("главная целиком", async ({ page }) => {
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  await expect(page).toHaveScreenshot("landing.png", { fullPage: true });
});

test("блок «Как мы работаем» (стрелки между карточками)", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("#process")).toHaveScreenshot("process.png");
});

test("витрина «Лаборатория решений»", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("#solutions")).toHaveScreenshot("solutions.png");
});

test("страница курса целиком", async ({ page }) => {
  await page.goto("/course");
  await page.waitForLoadState("networkidle");
  await expect(page).toHaveScreenshot("course.png", { fullPage: true });
});

test("визард: шаг 1", async ({ page }) => {
  await openWizard(page);
  await expect(page).toHaveScreenshot("wizard-step1.png", { fullPage: true });
});

test("визард: шаг 2 (анкета)", async ({ page }) => {
  await openWizard(page);
  await fillCompanyStep(page);
  await expect(page).toHaveScreenshot("wizard-step2.png", { fullPage: true });
});

test("визард: шаг 3 (предложение и цена пакета)", async ({ page }) => {
  await openWizard(page);
  await fillCompanyStep(page);
  await answerFirstQuestion(page);
  await buildProposal(page);
  await expect(page).toHaveScreenshot("wizard-step3.png", { fullPage: true });
});
