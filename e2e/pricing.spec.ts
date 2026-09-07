import { test, expect } from "@playwright/test";
import {
  calculateTrainingCost,
  hourlyRate,
  pickPackage,
  STREAM_SIZE,
  MAX_AUTO_STREAMS,
  MODULES,
  type ModuleCode,
} from "../src/lib/pricing";
import { selectProgram } from "../src/lib/moduleSelection";

/**
 * Проверка почасовой ценовой модели: до 8 ак. часов включительно — 350 BYN/ч,
 * больше — 250 BYN/ч, за группу до 25 человек. Браузер здесь не нужен —
 * это чистая логика, поэтому на мобильном проекте прогон пропускаем.
 */
test.beforeEach(({}, testInfo) => {
  test.skip(testInfo.project.name === "mobile", "чистая логика, от устройства не зависит");
});

test.describe("Типовые сборки (одна группа)", () => {
  const CASES: {
    name: string;
    modules: ModuleCode[];
    hours: number;
    rate: number;
    pkg: string;
    total: number;
  }[] = [
    { name: "Знакомство", modules: ["Б1"], hours: 4, rate: 350, pkg: "Знакомство", total: 1400 },
    { name: "Безопасный старт", modules: ["Б1", "Б2"], hours: 8, rate: 350, pkg: "Безопасный старт", total: 2800 },
    { name: "Профессиональный", modules: ["Б1", "Б2", "П3"], hours: 12, rate: 250, pkg: "Профессиональный", total: 3000 },
    { name: "Углубленный", modules: ["Б1", "Б2", "П3", "П6"], hours: 16, rate: 250, pkg: "Углубленный", total: 4000 },
    { name: "Расширенная программа", modules: ["Б1", "Б2", "П3", "П6", "П5"], hours: 20, rate: 250, pkg: "Расширенная корпоративная программа", total: 5000 },
    { name: "Для руководителей", modules: ["РУК"], hours: 4, rate: 350, pkg: "Для руководителей", total: 1400 },
    { name: "Управление и внедрение", modules: ["П1", "РУК"], hours: 8, rate: 350, pkg: "Управление и внедрение", total: 2800 },
  ];

  for (const c of CASES) {
    test(`«${c.name}» — ${c.hours} ч × ${c.rate} = ${c.total} BYN`, () => {
      const cost = calculateTrainingCost(c.modules, 10);
      expect(cost.packageName).toBe(c.pkg);
      expect(cost.hours).toBe(c.hours);
      expect(cost.rate).toBe(c.rate);
      expect(cost.total).toBe(c.total);
      expect(cost.isEstimate).toBe(false);
      // Подготовка и итоговое заключение — внутри цены, отдельных строк нет
      expect(cost.lines).toHaveLength(1);
    });
  }
});

test("порог ставки: 8 часов включительно — 350, больше — 250", () => {
  expect(hourlyRate(4)).toBe(350);
  expect(hourlyRate(8)).toBe(350);
  expect(hourlyRate(12)).toBe(250);
  expect(hourlyRate(16)).toBe(250);
});

test("контур руководителей добавляет часы в общий объем, а не надбавку", () => {
  const cost = calculateTrainingCost(["Б1", "Б2", "П3", "РУК"], 20);
  expect(cost.packageName).toBe("Профессиональный");
  expect(cost.hours).toBe(16);
  expect(cost.total).toBe(16 * 250);
  expect(cost.lines).toHaveLength(1);
});

test("все треки входят в сумму — блока опций больше нет", () => {
  const cost = calculateTrainingCost(["Б1", "Б2", "П3", "П6", "П5"], 20);
  expect(cost.packageName).toBe("Расширенная корпоративная программа");
  expect(cost.hours).toBe(20);
  expect(cost.total).toBe(5000);
  expect(cost.lines).toHaveLength(1);
});

test.describe("группы (потоки)", () => {
  test("до 25 человек — одна группа, 26 — уже две", () => {
    const base = calculateTrainingCost(["Б1", "Б2", "П3"], 25);
    expect(base.streams).toBe(1);
    expect(base.total).toBe(3000);

    const two = calculateTrainingCost(["Б1", "Б2", "П3"], 26);
    expect(two.streams).toBe(2);
    // Каждая группа — тот же объем программы по той же ставке
    expect(two.lines.map((l) => l.amount)).toEqual([3000, 3000]);
    expect(two.total).toBe(6000);
  });

  test("больше 3 групп — сумма превращается в «от»", () => {
    const cost = calculateTrainingCost(["Б1", "Б2", "П3"], 100);
    expect(cost.streams).toBe(Math.ceil(100 / STREAM_SIZE));
    expect(cost.isEstimate).toBe(true);
    // Считаем не больше MAX_AUTO_STREAMS групп: остальное — индивидуальный расчёт
    expect(cost.lines).toHaveLength(MAX_AUTO_STREAMS);
    expect(cost.total).toBe(3000 * MAX_AUTO_STREAMS);
  });
});

test("расчет всегда согласован: total = часы × ставка × посчитанные группы", () => {
  const tracks = MODULES.filter((m) => m.kind === "prof").map((m) => m.code);

  for (const people of [1, 25, 26, 50, 76]) {
    for (let i = 0; i < tracks.length; i++) {
      for (let j = i + 1; j < tracks.length; j++) {
        for (const withРУК of [false, true]) {
          const modules: ModuleCode[] = ["Б1", "Б2", tracks[i], tracks[j]];
          if (withРУК) modules.push("РУК");

          const cost = calculateTrainingCost(modules, people);
          const counted = Math.min(cost.streams, MAX_AUTO_STREAMS);
          expect(
            cost.total,
            `${modules.join("+")} × ${people} чел.`
          ).toBe(cost.hours * cost.rate * counted);
          expect(cost.rate, `${cost.hours} ч`).toBe(hourlyRate(cost.hours));
          // Сборка всегда известна системе, а не выдумана на лету
          expect(pickPackage(modules).name.length, "").toBeGreaterThan(0);
        }
      }
    }
  }
});

test("жадная анкета набирает все профильные треки — и все входят в цену", () => {
  // Анкета, задевающая сразу все ключевые слова
  const greedy =
    "договоры закупки отчеты таблицы данные переписка протоколы hr персонал " +
    "маркетинг продажи клиенты презентации графика видео образование исследования";

  for (const role of [
    "Руководители",
    "Документооборот / аналитики",
    "HR",
    "Продажи / коммерческий блок",
    "Универсальные специалисты",
  ]) {
    const selection = selectProgram(role, greedy, role === "Руководители");
    const cost = calculateTrainingCost(selection.modules, 20);

    // Никаких «опций сверх пакета»: все найденные треки в программе и в сумме
    expect(cost.hours, role).toBe(selection.modules.length * 4);
    expect(cost.total, role).toBe(cost.hours * cost.rate);
    expect(cost.lines, role).toHaveLength(1);
  }
});
