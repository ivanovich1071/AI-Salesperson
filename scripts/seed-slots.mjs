// Генерация демо-слотов для календаря встреч.
// Запуск: node scripts/seed-slots.mjs [YYYY-MM-DD_от] [YYYY-MM-DD_до]
// По умолчанию: 2026-08-01 .. 2026-08-14, будние дни, 9:00–17:00,
// случайные 4–6 слотов в день с часовым интервалом (встреча 30 мин
// успевает завершиться до 17:30).

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const from = process.argv[2] || "2026-08-01";
const to = process.argv[3] || "2026-08-14";

const HOURS = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"];

function* days(fromIso, toIso) {
  const d = new Date(`${fromIso}T00:00:00`);
  const end = new Date(`${toIso}T00:00:00`);
  while (d <= end) {
    yield new Date(d);
    d.setDate(d.getDate() + 1);
  }
}

function pickRandom(arr, n) {
  const copy = [...arr];
  const out = [];
  while (out.length < n && copy.length) {
    out.push(copy.splice(Math.floor(Math.random() * copy.length), 1)[0]);
  }
  return out.sort();
}

let created = 0;
for (const day of days(from, to)) {
  const dow = day.getDay();
  if (dow === 0 || dow === 6) continue; // выходные пропускаем — рабочее время

  // Локальная дата (toISOString даёт UTC и сдвигает день назад в поясах восточнее Гринвича)
  const iso = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, "0")}-${String(day.getDate()).padStart(2, "0")}`;
  const count = 4 + Math.floor(Math.random() * 3); // 4–6 слотов в день
  for (const time of pickRandom(HOURS, count)) {
    await prisma.timeSlot.upsert({
      where: { date_time: { date: iso, time } },
      update: {},
      create: { date: iso, time },
    });
    created++;
  }
}

const total = await prisma.timeSlot.count({ where: { isBooked: false } });
console.log(`Создано/обновлено слотов: ${created}. Всего свободных: ${total}.`);
await prisma.$disconnect();
