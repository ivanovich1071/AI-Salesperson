// Генерация демо-слотов для календаря встреч на заданный диапазон дат.
// Запуск: node scripts/seed-slots.mjs [YYYY-MM-DD_от] [YYYY-MM-DD_до]
// По умолчанию: 2026-08-01 .. 2026-08-14, будние дни, 9:00–17:00,
// случайные 4–6 слотов в день (встреча 30 мин успевает завершиться до 17:30).
//
// Для автоматического ежемесячного обновления см. seed-current-month.mjs.

import { PrismaClient } from "@prisma/client";
import { generateSlots } from "./lib/slotGenerator.mjs";

const prisma = new PrismaClient();

const from = process.argv[2] || "2026-08-01";
const to = process.argv[3] || "2026-08-14";

const created = await generateSlots(prisma, from, to);
const total = await prisma.timeSlot.count({ where: { isBooked: false } });
console.log(`Создано/обновлено слотов: ${created}. Всего свободных: ${total}.`);
await prisma.$disconnect();
