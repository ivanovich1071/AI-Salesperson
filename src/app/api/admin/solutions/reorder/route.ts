import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { adminUser } from "@/lib/adminAuth";
import { unauthorized, validationError } from "@/lib/lab/api";
import { revalidateLabPages } from "@/lib/lab/solutions";

export const runtime = "nodejs";

const ReorderSchema = z.object({ ids: z.array(z.string().min(1)).min(1).max(200) });

/** POST /api/admin/solutions/reorder { ids } — порядок карточек на витрине */
export async function POST(req: NextRequest) {
  if (!adminUser()) return unauthorized();

  let ids: string[];
  try {
    ids = ReorderSchema.parse(await req.json()).ids;
  } catch (e) {
    return validationError(e);
  }

  try {
    await prisma.$transaction(
      ids.map((id, i) =>
        prisma.labSolution.updateMany({ where: { id }, data: { sortOrder: i } })
      )
    );
  } catch (e) {
    console.error("[admin/solutions/reorder]", e);
    return NextResponse.json(
      { error: "Не удалось сохранить порядок — обновите страницу и попробуйте еще раз." },
      { status: 409 }
    );
  }
  revalidateLabPages();
  return NextResponse.json({ ok: true });
}
