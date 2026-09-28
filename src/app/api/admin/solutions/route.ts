import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { adminUser } from "@/lib/adminAuth";
import { LabSolutionInput } from "@/lib/lab/schema";
import { fromRow, revalidateLabPages } from "@/lib/lab/solutions";
import { unauthorized, validationError } from "@/lib/lab/api";

export const runtime = "nodejs";

/** GET /api/admin/solutions — все карточки, включая скрытые */
export async function GET() {
  if (!adminUser()) return unauthorized();
  const rows = await prisma.labSolution.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });
  return NextResponse.json({ solutions: rows.map(fromRow) });
}

/** POST /api/admin/solutions — новая карточка (встает в конец витрины) */
export async function POST(req: NextRequest) {
  const user = adminUser();
  if (!user) return unauthorized();

  let input;
  try {
    input = LabSolutionInput.parse(await req.json());
  } catch (e) {
    return validationError(e);
  }

  const last = await prisma.labSolution.aggregate({ _max: { sortOrder: true } });
  const row = await prisma.labSolution.create({
    data: {
      ...input,
      abilities: JSON.stringify(input.abilities),
      tags: JSON.stringify(input.tags),
      sortOrder: (last._max.sortOrder ?? -1) + 1,
      updatedBy: user,
    },
  });
  revalidateLabPages();
  return NextResponse.json({ solution: fromRow(row) });
}
