import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { adminUser } from "@/lib/adminAuth";
import { LabSolutionInput } from "@/lib/lab/schema";
import { fromRow, revalidateLabPages } from "@/lib/lab/solutions";
import { removeUploadedPhoto } from "@/lib/lab/uploads";
import { notFound, unauthorized, validationError } from "@/lib/lab/api";

export const runtime = "nodejs";

/**
 * PATCH /api/admin/solutions/:id — правка карточки.
 * Можно прислать только часть полей (например, `{ isPublished: false }` для скрытия).
 */
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const user = adminUser();
  if (!user) return unauthorized();

  const current = await prisma.labSolution.findUnique({ where: { id: params.id } });
  if (!current) return notFound();

  let input;
  try {
    input = LabSolutionInput.partial().parse(await req.json());
  } catch (e) {
    return validationError(e);
  }

  const { abilities, tags, ...rest } = input;
  const row = await prisma.labSolution.update({
    where: { id: params.id },
    data: {
      ...rest,
      ...(abilities ? { abilities: JSON.stringify(abilities) } : {}),
      ...(tags ? { tags: JSON.stringify(tags) } : {}),
      updatedBy: user,
    },
  });

  // Заменили или убрали загруженное фото — старый файл больше никому не нужен
  if (input.photo !== undefined && current.photo && current.photo !== row.photo) {
    await removeUploadedPhoto(current.photo);
  }

  revalidateLabPages();
  return NextResponse.json({ solution: fromRow(row) });
}

/** DELETE /api/admin/solutions/:id — удалить карточку вместе с загруженным фото */
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  if (!adminUser()) return unauthorized();

  const current = await prisma.labSolution.findUnique({ where: { id: params.id } });
  if (!current) return notFound();

  await prisma.labSolution.delete({ where: { id: params.id } });
  if (current.photo) await removeUploadedPhoto(current.photo);

  revalidateLabPages();
  return NextResponse.json({ ok: true });
}
