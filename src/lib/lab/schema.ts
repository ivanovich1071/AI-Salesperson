import { z } from "zod";

/**
 * Карточка «Лаборатории решений» — общий тип для витрины, админки и SEO.
 * Файл без серверных зависимостей: его импортируют и клиентские компоненты.
 */

export const TONES = ["live", "partner", "ready", "github", "soon"] as const;
export type StatusTone = (typeof TONES)[number];

/** Подписи цветов плашки для выпадающего списка в админке */
export const TONE_LABELS: Record<StatusTone, string> = {
  live: "Зеленая — живое, работает",
  partner: "Золотая — внедрено у партнера",
  ready: "Янтарная — готово к внедрению",
  github: "Серая — исходники",
  soon: "Бледная — скоро",
};

export const STATUS_STYLES: Record<StatusTone, string> = {
  live: "bg-emerald-100 text-emerald-700",
  partner: "bg-gold-light text-brown-deep",
  ready: "bg-amber-100 text-amber-700",
  github: "bg-slate-100 text-slate-700",
  soon: "bg-line text-muted",
};

export interface LabSolution {
  id: string;
  name: string;
  role: string;
  task: string;
  abilities: string[];
  tags: string[];
  status: string;
  tone: StatusTone;
  liveUrl?: string;
  liveLabel?: string;
  note?: string;
  icon: string;
  photo?: string;
  sortOrder: number;
  isPublished: boolean;
  updatedBy: string;
  updatedAt: string;
}

/** Пустые строки из формы превращаем в «нет значения», а не в пустую ссылку */
const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .nullable()
    .transform((v) => (v ? v : null));

const lines = (maxItems: number) =>
  z
    .array(z.string().trim().max(300))
    .max(maxItems)
    .transform((a) => a.filter(Boolean));

/**
 * Что принимает API админки. Фото — только наши пути: из репозитория
 * (/images/lab/…) или загруженные через админку (/uploads/lab/…). Чужой адрес
 * в карточку не подставить.
 */
export const LabSolutionInput = z.object({
  name: z.string().trim().min(1, "Нужно название").max(80),
  role: z.string().trim().min(1, "Нужна роль").max(160),
  task: z.string().trim().min(1, "Нужна задача").max(600),
  abilities: lines(10),
  tags: lines(8),
  status: z.string().trim().min(1, "Нужен статус").max(40),
  tone: z.enum(TONES),
  liveUrl: optionalText(500).refine(
    (v) => v === null || /^https?:\/\//i.test(v),
    "Ссылка должна начинаться с http:// или https://"
  ),
  liveLabel: optionalText(40),
  note: optionalText(300),
  icon: z.string().trim().max(30).default("lab"),
  photo: optionalText(200).refine(
    (v) =>
      v === null ||
      /^\/images\/lab\/[\w.-]+$/.test(v) ||
      /^\/uploads\/lab\/[\w.-]+$/.test(v),
    "Фото — только загруженное через админку"
  ),
  isPublished: z.boolean().default(true),
});
export type LabSolutionInputT = z.infer<typeof LabSolutionInput>;
