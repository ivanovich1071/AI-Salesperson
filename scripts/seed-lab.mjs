// Стартовый набор карточек «Лаборатории решений».
// Запуск: node scripts/seed-lab.mjs
//
// Заливает карточки из src/lib/lab/defaults.json, если таблица пуста.
// При обновлении существующей базы один раз добавляет новую первую карточку
// «Корпоративный календарь» или обновляет ее исходную версию. Остальные
// карточки и последующие ручные правки живут в базе и не перезаписываются.

import { readFileSync } from "node:fs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const defaults = JSON.parse(
  readFileSync(new URL("../src/lib/lab/defaults.json", import.meta.url), "utf8")
);

function cardData(d, sortOrder) {
  return {
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
    sortOrder,
    updatedBy: "сид",
  };
}

const count = await prisma.labSolution.count();
if (count > 0) {
  const calendar = defaults[0];
  const existingCalendar = await prisma.labSolution.findFirst({
    where: { name: calendar.name },
  });

  if (existingCalendar) {
    // Первая версия календаря была добавлена этим сидом с updatedBy="сид".
    // Обновляем только ее: карточку, которую уже правил человек в админке,
    // автоматический деплой трогать не должен.
    if (existingCalendar.updatedBy === "сид") {
      await prisma.labSolution.update({
        where: { id: existingCalendar.id },
        data: {
          ...cardData(calendar, existingCalendar.sortOrder),
          updatedBy: "обновление карточки календаря",
        },
      });
      console.log("Лаборатория решений: обновлена карточка «Корпоративный календарь».");
    } else {
      console.log(`Лаборатория решений: в базе уже ${count} карточек, сид не нужен.`);
    }
  } else {
    await prisma.$transaction([
      prisma.labSolution.updateMany({ data: { sortOrder: { increment: 1 } } }),
      prisma.labSolution.create({ data: cardData(calendar, 0) }),
    ]);
    console.log("Лаборатория решений: добавлена карточка «Корпоративный календарь».");
  }
} else {
  for (const [i, d] of defaults.entries()) {
    await prisma.labSolution.create({ data: cardData(d, i) });
  }
  console.log(`Лаборатория решений: добавлено ${defaults.length} стартовых карточек.`);
}
await prisma.$disconnect();
