// Стартовый набор карточек «Лаборатории решений».
// Запуск: node scripts/seed-lab.mjs
//
// Заливает карточки из src/lib/lab/defaults.json, ТОЛЬКО если таблица пуста.
// Дальше карточки живут в базе и правятся в админке, поэтому повторный запуск
// (при каждом деплое) ничего не трогает.

import { readFileSync } from "node:fs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const count = await prisma.labSolution.count();
if (count > 0) {
  console.log(`Лаборатория решений: в базе уже ${count} карточек, сид не нужен.`);
} else {
  const defaults = JSON.parse(
    readFileSync(new URL("../src/lib/lab/defaults.json", import.meta.url), "utf8")
  );
  for (const [i, d] of defaults.entries()) {
    await prisma.labSolution.create({
      data: {
        name: d.name,
        role: d.role,
        task: d.task,
        abilities: JSON.stringify(d.abilities ?? []),
        tags: JSON.stringify(d.tags ?? []),
        status: d.status,
        tone: d.tone,
        liveUrl: d.liveUrl ?? null,
        liveLabel: d.liveLabel ?? null,
        note: d.note ?? null,
        icon: d.icon ?? "lab",
        photo: d.photo ?? null,
        sortOrder: i,
        updatedBy: "сид",
      },
    });
  }
  console.log(`Лаборатория решений: добавлено ${defaults.length} стартовых карточек.`);
}
await prisma.$disconnect();
