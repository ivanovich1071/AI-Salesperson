// Автоматическое обновление календаря слотов: генерирует слоты на ТЕКУЩИЙ
// месяц (по дате сервера) и удаляет прошедшие незабронированные слоты.
// Предназначен для запуска по cron 1-го числа каждого месяца:
//
//   0 3 1 * * cd /opt/ai-salesperson && /usr/bin/node scripts/seed-current-month.mjs >> /var/log/ai-salesperson-slots.log 2>&1
//
// Прототип: диапазон и рабочие часы — в scripts/lib/slotGenerator.mjs.

import { PrismaClient } from "@prisma/client";
import { generateSlots, cleanupPastSlots, firstAndLastDayOfMonth } from "./lib/slotGenerator.mjs";

const prisma = new PrismaClient();

const { from, to } = firstAndLastDayOfMonth();
const removed = await cleanupPastSlots(prisma);
const created = await generateSlots(prisma, from, to);
const total = await prisma.timeSlot.count({ where: { isBooked: false } });

console.log(
  `[${new Date().toISOString()}] Месяц ${from}..${to}: создано/обновлено ${created}, удалено прошедших ${removed}, всего свободных ${total}.`
);
await prisma.$disconnect();
