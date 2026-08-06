import { execSync } from "node:child_process";
import { existsSync, unlinkSync } from "node:fs";
import path from "node:path";

/**
 * Готовит ОТДЕЛЬНУЮ тестовую базу перед прогоном.
 * Рабочая prisma/dev.db не трогается — иначе в админке появлялись бы фейковые
 * заявки «ООО Тест» из автотестов (см. TESTING.md, раздел 4.2).
 */
const TEST_DB_URL = "file:./test.db";

export default function globalSetup() {
  const root = path.resolve(__dirname, "..");
  const dbFile = path.join(root, "prisma", "test.db");

  // Чистый старт: пересоздаём базу, чтобы прогоны не влияли друг на друга
  for (const f of [dbFile, `${dbFile}-journal`]) {
    if (existsSync(f)) unlinkSync(f);
  }

  const env = { ...process.env, DATABASE_URL: TEST_DB_URL };
  const run = (cmd: string) =>
    execSync(cmd, { cwd: root, env, stdio: "inherit" });

  run("npx prisma db push --skip-generate");

  // Слоты нужны для сценария брони — переиспользуем рабочий генератор
  const today = new Date();
  const iso = (d: Date) => d.toISOString().slice(0, 10);
  const from = iso(today);
  const to = iso(new Date(today.getTime() + 21 * 24 * 60 * 60 * 1000));
  run(`node scripts/seed-slots.mjs ${from} ${to}`);
}
