// Общая логика генерации слотов календаря встреч — используется и ручным
// скриптом (seed-slots.mjs), и автоматическим ежемесячным (seed-current-month.mjs).

export const WORK_HOURS = [
  "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00",
];

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

function toIsoDate(d) {
  // Локальная дата: toISOString() даёт UTC и сдвигает день назад в поясах восточнее Гринвича
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/**
 * Создаёт слоты на будние дни в диапазоне [fromIso, toIso] (обе даты включительно),
 * рабочее время 9:00–17:00, случайные 4–6 слотов в день (upsert — без дублей).
 */
export async function generateSlots(prisma, fromIso, toIso) {
  let created = 0;
  for (const day of days(fromIso, toIso)) {
    const dow = day.getDay();
    if (dow === 0 || dow === 6) continue; // выходные пропускаем

    const iso = toIsoDate(day);
    const count = 4 + Math.floor(Math.random() * 3); // 4–6 слотов
    for (const time of pickRandom(WORK_HOURS, count)) {
      await prisma.timeSlot.upsert({
        where: { date_time: { date: iso, time } },
        update: {},
        create: { date: iso, time },
      });
      created++;
    }
  }
  return created;
}

/** Удаляет прошедшие незабронированные слоты (гигиена базы при ежемесячном запуске) */
export async function cleanupPastSlots(prisma) {
  const todayIso = toIsoDate(new Date());
  const { count } = await prisma.timeSlot.deleteMany({
    where: { isBooked: false, date: { lt: todayIso } },
  });
  return count;
}

export function firstAndLastDayOfMonth(date = new Date()) {
  const first = new Date(date.getFullYear(), date.getMonth(), 1);
  const last = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  return { from: toIsoDate(first), to: toIsoDate(last) };
}
