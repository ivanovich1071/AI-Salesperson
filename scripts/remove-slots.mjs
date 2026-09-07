// Удаление свободных слотов в диапазоне дат (обе даты включительно).
// Забронированные слоты не трогаются — они выводятся списком, чтобы
// связаться с клиентами вручную.
// Запуск: node scripts/remove-slots.mjs [YYYY-MM-DD_от] [YYYY-MM-DD_до]
// Пример: node scripts/remove-slots.mjs 2026-10-06 2026-10-28

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const from = process.argv[2];
const to = process.argv[3];

if (!from || !to) {
  console.error("Использование: node scripts/remove-slots.mjs [от YYYY-MM-DD] [до YYYY-MM-DD]");
  process.exit(1);
}

const booked = await prisma.timeSlot.findMany({
  where: { isBooked: true, date: { gte: from, lte: to } },
  orderBy: [{ date: "asc" }, { time: "asc" }],
  include: { booking: { select: { name: true, company: true } } },
});

if (booked.length) {
  console.log(`Забронированные слоты в диапазоне (${booked.length}) — НЕ удалены:`);
  for (const s of booked) {
    console.log(`  ${s.date} ${s.time} — ${s.booking?.company ?? "?"} (${s.booking?.name ?? "?"})`);
  }
}

const { count } = await prisma.timeSlot.deleteMany({
  where: { isBooked: false, date: { gte: from, lte: to } },
});

const total = await prisma.timeSlot.count({ where: { isBooked: false } });
console.log(`Удалено свободных слотов: ${count}. Осталось свободных всего: ${total}.`);
await prisma.$disconnect();
