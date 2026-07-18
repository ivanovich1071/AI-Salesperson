import type { ModuleId } from "./pricing";

// ============================================================
// PROGRAM SELECTOR (системный промпт, раздел 4):
// детерминированный выбор модулей и занятий по роли.
// AI модули НЕ выбирает — он только объясняет выбор системы.
// ============================================================

export interface RolePlan {
  modules: ModuleId[];
  requiredLessons: number[];
  optionalLessons: number[];
}

const DEFAULT_PLAN: RolePlan = {
  modules: ["intro"],
  requiredLessons: [1, 2, 3],
  optionalLessons: [4, 5, 6],
};

export const ROLE_PLANS: Record<string, RolePlan> = {
  "Руководители": {
    modules: ["intro", "consulting"],
    requiredLessons: [1, 3],
    optionalLessons: [2, 4, 5, 6],
  },
  "Документооборот / аналитики": {
    modules: ["intro", "practice"],
    requiredLessons: [2, 3],
    optionalLessons: [1, 4, 5],
  },
  "HR": {
    modules: ["intro", "practice"],
    requiredLessons: [4],
    optionalLessons: [1, 2, 3, 6],
  },
  "Продажи / коммерческий блок": {
    modules: ["intro", "practice"],
    requiredLessons: [5],
    optionalLessons: [1, 2, 3, 4],
  },
  "Производство / инженеры": {
    modules: ["practice", "consulting"],
    requiredLessons: [6],
    optionalLessons: [1, 2, 3, 5],
  },
  "Универсальные специалисты": DEFAULT_PLAN,
};

const LESSON_TITLES: Record<number, string> = {
  1: "Применение ИИ на предприятии: возможности, ограничения и эффекты",
  2: "Инструменты ИИ и автоматизация работы с документами",
  3: "Работа с данными, отчетами и неструктурированной информацией",
  4: "Оптимизация работы сотрудников: HR, инструкции и обучение",
  5: "Применение ИИ в продажах, аналитике и работе с клиентами",
  6: "ИИ в производстве и автоматизация процессов",
};

export function selectProgram(role: string): RolePlan {
  return ROLE_PLANS[role] ?? DEFAULT_PLAN;
}

export function lessonTitle(n: number): string {
  return LESSON_TITLES[n] ? `Занятие ${n}. ${LESSON_TITLES[n]}` : `Занятие ${n}`;
}

/** Текстовое описание плана для передачи в промпт AI */
export function describePlan(plan: RolePlan): string {
  return [
    `Обязательные занятия: ${plan.requiredLessons.map(lessonTitle).join("; ")}.`,
    `Желательные занятия: ${plan.optionalLessons.map(lessonTitle).join("; ")}.`,
  ].join("\n");
}
