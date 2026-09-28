import { revalidatePath } from "next/cache";
import type { LabSolution as Row } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import defaults from "./defaults.json";
import { TONES, type LabSolution, type StatusTone } from "./schema";

function parseList(json: string): string[] {
  try {
    const v = JSON.parse(json);
    return Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];
  } catch {
    return [];
  }
}

function toTone(v: string): StatusTone {
  return (TONES as readonly string[]).includes(v) ? (v as StatusTone) : "ready";
}

export function fromRow(r: Row): LabSolution {
  return {
    id: r.id,
    name: r.name,
    role: r.role,
    task: r.task,
    abilities: parseList(r.abilities),
    tags: parseList(r.tags),
    status: r.status,
    tone: toTone(r.tone),
    liveUrl: r.liveUrl ?? undefined,
    liveLabel: r.liveLabel ?? undefined,
    note: r.note ?? undefined,
    icon: r.icon,
    photo: r.photo ?? undefined,
    sortOrder: r.sortOrder,
    isPublished: r.isPublished,
    updatedBy: r.updatedBy,
    updatedAt: r.updatedAt.toISOString(),
  };
}

/** Стартовый набор в виде карточек — запасной вариант, если база недоступна */
function fallback(): LabSolution[] {
  return defaults.map((d, i) => ({
    id: `default-${i}`,
    ...d,
    tone: toTone(d.tone),
    sortOrder: i,
    isPublished: true,
    updatedBy: "",
    updatedAt: new Date(0).toISOString(),
  }));
}

/**
 * Карточки витрины по порядку. Если база не отвечает (например, при сборке
 * без файла базы), отдаем стартовый набор: витрина не должна пустеть, а сборка — падать.
 */
export async function getLabSolutions(
  opts: { publishedOnly?: boolean; limit?: number } = {}
): Promise<LabSolution[]> {
  const publishedOnly = opts.publishedOnly ?? true;
  try {
    const rows = await prisma.labSolution.findMany({
      where: publishedOnly ? { isPublished: true } : undefined,
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      take: opts.limit,
    });
    return rows.map(fromRow);
  } catch (e) {
    console.error("[lab] база недоступна, показываем стартовый набор:", e);
    const list = fallback();
    return opts.limit ? list.slice(0, opts.limit) : list;
  }
}

/** Страницы, где видны карточки: сбрасываем кэш после каждой правки в админке */
export function revalidateLabPages() {
  for (const p of ["/", "/solutions", "/llms.txt", "/llms-full.txt"]) {
    revalidatePath(p);
  }
}
