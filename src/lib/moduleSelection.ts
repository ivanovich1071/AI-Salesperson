import type { ModuleCode } from "./pricing";
import { getModule, MAX_AUTO_TRACKS } from "./pricing";

// ============================================================
// PROGRAM SELECTOR (Таблица 7) — детерминированный автоподбор
// учебных модулей по роли + сигналам из чекбокс-ответов.
// AI модули НЕ выбирает: получает готовый список и объясняет выбор.
// ============================================================

// Базовый план по роли (какие П-модули профильны для роли)
const ROLE_MODULES: Record<string, ModuleCode[]> = {
  "Руководители": ["П1"],
  "Документооборот / аналитики": ["П2", "П3"],
  "HR": ["П5"],
  "Продажи / коммерческий блок": ["П6"],
  "Производство / инженеры": [], // офисных П-модулей нет → только база
  "Универсальные специалисты": [],
};

// Ключевые слова из ответов → профессиональный модуль (Таблица 7)
const SIGNAL_MODULES: { module: ModuleCode; keywords: string[] }[] = [
  { module: "П2", keywords: ["переписк", "протокол", "письм", "ocr", "служебн", "регламент", "инструкц"] },
  { module: "П3", keywords: ["таблиц", "отчет", "отчёт", "данны", "аналит", "свод"] },
  { module: "П4", keywords: ["договор", "закупк", "коммерческ", "снабжен", "тендер"] },
  { module: "П5", keywords: ["hr", "персонал", "адаптац", "должностн", "обучен сотрудник", "кадров"] },
  { module: "П6", keywords: ["маркетинг", "продаж", "клиент", "конкурент"] },
  { module: "П7", keywords: ["образован", "исследован", "студент", "преподав", "учебн"] },
  { module: "П8", keywords: ["презентац", "график", "видео", "изображен", "визуал", "контент"] },
];

// Сигналы, требующие Б2 (документы / данные / регулирование)
const B2_KEYWORDS = [
  "документ", "данны", "таблиц", "договор", "регламент", "безопасн",
  "политик", "запрещ", "конфиденц", "персональн",
];

// Признак запрета публичных облачных ИИ-сервисов (Q05)
const PUBLIC_BAN_KEYWORDS = [
  "публичные облачные ии-сервисы запрещены",
  "только локальные",
  "нельзя загружать внутренние",
];

export interface SelectionResult {
  modules: ModuleCode[];
  requiredLessons: ModuleCode[];
  optionalLessons: ModuleCode[];
  /** Профильные треки сверх пакета — предлагаются опционально, в цену не входят */
  extraTracks: ModuleCode[];
  publicCloudRestricted: boolean;
}

/**
 * Подбор модулей.
 *
 * Треков в программу попадает не больше MAX_AUTO_TRACKS: это потолок протокола
 * цен (пакет «Углублённый»). Всё, что анкета нашла сверх — уходит в extraTracks
 * и предлагается отдельной опцией, иначе одна щедрая анкета собирает программу
 * на восемь модулей и смету, в которую никто не поверит.
 *
 * @param role         роль участников (экран 1)
 * @param answersText  объединённый текст всех чекбокс-ответов (нижний регистр не обязателен)
 * @param hasManagers  участвуют ли руководители (роль = Руководители)
 */
export function selectProgram(
  role: string,
  answersText: string,
  hasManagers: boolean
): SelectionResult {
  const text = (answersText || "").toLowerCase();
  const needsБ2 = B2_KEYWORDS.some((k) => text.includes(k));
  const managers = hasManagers || role === "Руководители";
  const publicCloudRestricted = PUBLIC_BAN_KEYWORDS.some((k) => text.includes(k));

  // Треки по приоритету: сначала профильные для роли, потом найденные по сигналам
  const ranked: ModuleCode[] = [];
  const addTrack = (code: ModuleCode) => {
    if (!ranked.includes(code)) ranked.push(code);
  };
  for (const code of ROLE_MODULES[role] ?? []) addTrack(code);
  for (const { module, keywords } of SIGNAL_MODULES) {
    if (keywords.some((k) => text.includes(k))) addTrack(module);
  }
  if (managers) addTrack("П1");

  // Чистая программа для руководителей: базовое обучение сотрудников не нужно,
  // это пакет «Управление и внедрение» из протокола цен.
  if (managers && !needsБ2 && ranked.length <= 1) {
    const ordered = orderModules(["П1", "РУК"]);
    return {
      modules: ordered,
      requiredLessons: [],
      optionalLessons: ordered,
      extraTracks: [],
      publicCloudRestricted,
    };
  }

  const tracks = ranked.slice(0, MAX_AUTO_TRACKS);
  const extraTracks = orderModules(ranked.slice(MAX_AUTO_TRACKS));

  const modules = new Set<ModuleCode>(["Б1"]);
  // Б2 — при сигналах документы/данные/политика (базовое обучение — норма)
  if (needsБ2 || role !== "Универсальные специалисты") modules.add("Б2");
  for (const code of tracks) modules.add(code);
  if (managers) modules.add("РУК");

  // Упорядочиваем: Б1, Б2, П* по номеру, РУК в конце
  const ordered = orderModules(Array.from(modules));
  const required: ModuleCode[] = ordered.filter((c) => c === "Б1" || c === "Б2");
  const optional: ModuleCode[] = ordered.filter((c) => c !== "Б1" && c !== "Б2");

  return {
    modules: ordered,
    requiredLessons: required,
    optionalLessons: optional,
    extraTracks,
    publicCloudRestricted,
  };
}

const ORDER: ModuleCode[] = ["Б1", "Б2", "П1", "П2", "П3", "П4", "П5", "П6", "П7", "П8", "РУК"];

function orderModules(codes: ModuleCode[]): ModuleCode[] {
  return ORDER.filter((c) => codes.includes(c));
}

/** Текстовое описание плана для промпта AI */
export function describeSelection(codes: ModuleCode[]): string {
  return codes
    .map((c) => {
      const m = getModule(c);
      return m ? `${c} — ${m.title} (${m.hours} ч)` : c;
    })
    .join("; ");
}
