import { defineConfig, devices } from "@playwright/test";

/**
 * Конфигурация E2E-тестов (см. TESTING.md).
 *
 * Ключевое:
 * - webServer поднимает dev-сервер сам и гасит после прогона;
 * - DATABASE_URL указывает на ОТДЕЛЬНУЮ тестовую базу — рабочая dev.db не трогается;
 * - тесты с тегом @live (живой OpenRouter) исключены из обычного прогона.
 */
const PORT = 3100;
const BASE_URL = `http://127.0.0.1:${PORT}`;

export default defineConfig({
  testDir: "./e2e",
  globalSetup: "./e2e/global-setup.ts",

  // Живой AI — платно и медленно, только через `npm run test:e2e:live`
  grepInvert: process.env.LIVE_AI ? undefined : /@live/,

  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  workers: process.env.CI ? 1 : undefined,
  timeout: 45_000,
  expect: {
    timeout: 10_000,
    // Небольшой допуск: сглаживание шрифтов даёт микроразличия между прогонами
    toHaveScreenshot: { maxDiffPixelRatio: 0.02, animations: "disabled" },
  },

  reporter: [["html", { open: "never" }], ["list"]],

  use: {
    baseURL: BASE_URL,
    trace: "retain-on-failure",
    video: "retain-on-failure",
    screenshot: "only-on-failure",
    locale: "ru-RU",
    timezoneId: "Europe/Minsk",
  },

  projects: [
    {
      name: "desktop",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1280, height: 900 },
        launchOptions: {
          // Фейковый микрофон: реального устройства в тестовом браузере нет
          args: [
            "--use-fake-ui-for-media-stream",
            "--use-fake-device-for-media-stream",
          ],
        },
        permissions: ["microphone"],
      },
    },
    {
      name: "mobile",
      use: {
        ...devices["Pixel 5"],
        launchOptions: {
          args: [
            "--use-fake-ui-for-media-stream",
            "--use-fake-device-for-media-stream",
          ],
        },
        permissions: ["microphone"],
      },
    },
  ],

  webServer: {
    command: "npm run dev",
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: {
      // Отдельная база: брони и карты диагностики из тестов не попадут в рабочую
      DATABASE_URL: "file:./test.db",
      // Тесты дёргают роуты очередями — боевые лимиты частоты их уронят
      RATE_LIMIT_DISABLED: "1",
      ADMIN_USER: "admin",
      ADMIN_PASSWORD: "demo2026",
      ADMIN_SESSION_SECRET: "e2e-test-secret",
    },
  },
});
