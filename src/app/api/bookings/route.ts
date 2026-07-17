import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { BookingInputSchema } from "@/lib/schemas";
import { isAdminRequest } from "@/lib/adminAuth";

export const runtime = "nodejs";

/** POST /api/bookings — создать бронь (публичный, из визарда) */
export async function POST(req: NextRequest) {
  try {
    const input = BookingInputSchema.parse(await req.json());

    const slot = await prisma.timeSlot.findUnique({ where: { id: input.slotId } });
    if (!slot || slot.isBooked) {
      return NextResponse.json(
        { error: "Этот слот уже занят. Пожалуйста, выберите другое время." },
        { status: 409 }
      );
    }

    const [, booking] = await prisma.$transaction([
      prisma.timeSlot.update({
        where: { id: input.slotId },
        data: { isBooked: true },
      }),
      prisma.booking.create({
        data: {
          slotId: input.slotId,
          name: input.name,
          company: input.company,
          email: input.email,
          phone: input.phone,
          summary: JSON.stringify(input.summary),
          totalCost: input.totalCost,
        },
      }),
    ]);

    return NextResponse.json({
      booking: { id: booking.id, date: slot.date, time: slot.time },
    });
  } catch (e) {
    console.error("[bookings POST]", e);
    return NextResponse.json(
      { error: "Не удалось забронировать встречу. Проверьте данные и попробуйте ещё раз." },
      { status: 400 }
    );
  }
}

/** GET /api/bookings — список броней (только админ) */
export async function GET() {
  if (!isAdminRequest()) {
    return NextResponse.json({ error: "Требуется вход в админку." }, { status: 401 });
  }
  try {
    const bookings = await prisma.booking.findMany({
      include: { slot: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ bookings });
  } catch (e) {
    console.error("[bookings GET]", e);
    return NextResponse.json(
      { error: "Не удалось загрузить брони." },
      { status: 500 }
    );
  }
}
