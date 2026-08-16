import { test, expect } from "@playwright/test";
import {
  calculateTrainingCost,
  pickPackage,
  MAX_AUTO_TOTAL,
  MAX_AUTO_TRACKS,
  MODULES,
  type ModuleCode,
} from "../src/lib/pricing";
import { selectProgram } from "../src/lib/moduleSelection";

/**
 * Проверка ценового протокола: расчёт не должен выходить за опубликованный
 * прайс. Браузер здесь не нужен — это чистая логика, поэтому на мобильном
 * проекте прогон пропускаем.
 */
test.beforeEach(({}, testInfo) => {
  test.skip(testInfo.project.name === "mobile", "чистая логика, от устройства не зависит");
});

test.describe("Протокол цен: типовые сборки", () => {
  const CASES: {
    name: string;
    modules: ModuleCode[];
    people: number;
    pkg: string;
    total: number;
  }[] = [
    { name: "Знакомство", modules: ["Б1"], people: 15, pkg: "Знакомство", total: 2400 },
    { name: "Безопасный старт", modules: ["Б1", "Б2"], people: 20, pkg: "Безопасный старт", total: 4500 },
    { name: "Профессиональный", modules: ["Б1", "Б2", "П3"], people: 20, pkg: "Профессиональный", total: 6500 },
    { name: "Углублённый", modules: ["Б1", "Б2", "П3", "П6"], people: 20, pkg: "Углублённый", total: 8400 },
    { name: "Для руководителей", modules: ["РУК"], people: 10, pkg: "Для руководителей", total: 2800 },
    { name: "Управление и внедрение", modules: ["П1", "РУК"], people: 12, pkg: "Управление и внедрение", total: 4900 },
  ];

  for (const c of CASES) {
    test(`«${c.name}» — ${c.total} BYN`, () => {
      const cost = calculateTrainingCost(c.modules, c.people);
      expect(cost.packageName).toBe(c.pkg);
      expect(cost.total).toBe(c.total);
      expect(cost.isEstimate).toBe(false);
      // Подготовка и итоговое заключение — внутри цены, отдельных строк нет
      expect(cost.lines).toHaveLength(1);
    });
  }
});

test("контур руководителей поверх обучения сотрудников — надбавка 2 800", () => {
  const cost = calculateTrainingCost(["Б1", "Б2", "П3", "РУК"], 20);
  expect(cost.packageName).toBe("Профессиональный");
  expect(cost.total).toBe(9300);
});

test("треки сверх пакета уходят в опции и в сумму не входят", () => {
  const cost = calculateTrainingCost(["Б1", "Б2", "П3", "П6", "П5"], 20);
  expect(cost.packageName).toBe("Углублённый");
  expect(cost.total).toBe(8400);
  expect(cost.options).toHaveLength(1);
  expect(cost.options[0].label).toContain("П5");
  expect(cost.options[0].amount).toBe(1900);
});

test("дополнительные потоки дешевле первого", () => {
  const cost = calculateTrainingCost(["Б1", "Б2", "П3"], 45);
  expect(cost.streams).toBe(3);
  expect(cost.lines.map((l) => l.amount)).toEqual([6500, 3900, 3600]);
  expect(cost.total).toBe(14000);
  expect(cost.isEstimate).toBe(false);
});

test("больше 60 человек — сумма превращается в «от»", () => {
  const cost = calculateTrainingCost(["Б1", "Б2", "П3", "П6"], 100);
  expect(cost.streams).toBe(5);
  expect(cost.isEstimate).toBe(true);
  expect(cost.total).toBe(18000);
  // Считаем не больше трёх потоков: остальное — индивидуальный расчёт
  expect(cost.lines).toHaveLength(3);
});

test("ни одна разумная комбинация не выходит за потолок протокола", () => {
  const tracks = MODULES.filter((m) => m.kind === "prof").map((m) => m.code);

  for (const people of [1, 20, 21, 40, 60]) {
    for (let i = 0; i < tracks.length; i++) {
      for (let j = i + 1; j < tracks.length; j++) {
        for (const withРУК of [false, true]) {
          const modules: ModuleCode[] = ["Б1", "Б2", tracks[i], tracks[j]];
          if (withРУК) modules.push("РУК");

          const cost = calculateTrainingCost(modules, people);
          expect(cost.total, `${modules.join("+")} × ${people} чел.`).toBeLessThanOrEqual(
            MAX_AUTO_TOTAL
          );
          // Пакет всегда один из протокола, а не выдуманная сборка
          expect(pickPackage(modules).pkg.price).toBeGreaterThan(0);
        }
      }
    }
  }
});

test("автоподбор не набирает треков больше потолка пакета", () => {
  // Анкета, задевающая сразу все ключевые слова
  const greedy =
    "договоры закупки отчёты таблицы данные переписка протоколы hr персонал " +
    "маркетинг продажи клиенты презентации графика видео образование исследования";

  for (const role of [
    "Руководители",
    "Документооборот / аналитики",
    "HR",
    "Продажи / коммерческий блок",
    "Универсальные специалисты",
  ]) {
    const selection = selectProgram(role, greedy, role === "Руководители");
    const chosenTracks = selection.modules.filter((c) => c.startsWith("П"));
    expect(chosenTracks.length, role).toBeLessThanOrEqual(MAX_AUTO_TRACKS);
    expect(selection.extraTracks.length, role).toBeGreaterThan(0);

    const cost = calculateTrainingCost(selection.modules, 20, selection.extraTracks);
    expect(cost.total, role).toBeLessThanOrEqual(MAX_AUTO_TOTAL);
  }
});
