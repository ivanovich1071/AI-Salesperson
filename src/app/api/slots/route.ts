import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { isAdminRequest } from "@/lib/adminAuth";

export const runtime = "nodejs";

/** GET /api/slots — свободные слоты (для календаря визарда) */
export async function GET() {
  try {
    const slots = await prisma.timeSlot.findMany({
      where: { isBooked: false },
      orderBy: [{ date: "asc" }, { time: "asc" }],
    });
    return NextResponse.json({ slots });
  } catch (e) {
    console.error("[slots GET]", e);
    return NextResponse.json(
      { error: "Не удалось загрузить свободные слоты." },
      { status: 500 }
    );
  }
}

const AddSlotsSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  times: z.array(z.string().regex(/^\d{2}:\d{2}$/)).min(1),
});

/** POST /api/slots — добавить слоты (только админ): { date, times: ["10:00","14:00"] } */
export async function POST(req: NextRequest) {
  if (!isAdminRequest()) {
    return NextResponse.json({ error: "Требуется вход в админку." }, { status: 401 });
  }
  try {
    const { date, times } = AddSlotsSchema.parse(await req.json());
    const created = [];
    for (const time of times) {
      const slot = await prisma.timeSlot.upsert({
        where: { date_time: { date, time } },
        update: {},
        create: { date, time },
      });
      created.push(slot);
    }
    return NextResponse.json({ slots: created });
  } catch (e) {
    console.error("[slots POST]", e);
    return NextResponse.json(
      { error: "Не удалось добавить слоты. Формат: дата YYYY-MM-DD, время HH:MM." },
      { status: 400 }
    );
  }
}

/** DELETE /api/slots?id=... — удалить слот (только админ) */
export async function DELETE(req: NextRequest) {
  if (!isAdminRequest()) {
    return NextResponse.json({ error: "Требуется вход в админку." }, { status: 401 });
  }
  try {
    const id = req.nextUrl.searchParams.get("id");
    if (!id) throw new Error("no id");
    await prisma.timeSlot.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[slots DELETE]", e);
    return NextResponse.json(
      { error: "Не удалось удалить слот." },
      { status: 400 }
    );
  }
}
