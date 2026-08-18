import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { isAdminRequest } from "@/lib/adminAuth";
import {
  diagnosticsNotifyEnabled,
  formatDiagnosticMessage,
  notifyTelegram,
} from "@/lib/telegram";

export const runtime = "nodejs";

/**
 * Карты диагностики (шаблоны-заготовки клиента).
 * POST — публичный, вызывается визардом в момент формирования предложения.
 * GET — только админ, список для дашборда.
 */
const InputSchema = z.object({
  companyName: z.string().min(1),
  userRole: z.string().min(1),
  participantCount: z.number().int().nonnegative().optional().default(0),
  goals: z.string().optional().default(""),
  data: z.record(z.unknown()).optional().default({}),
  matchScore: z.number().int().min(0).max(100).optional().default(0),
});

export async function POST(req: NextRequest) {
  try {
    const input = InputSchema.parse(await req.json());
    const map = await prisma.diagnosticMap.create({
      data: {
        companyName: input.companyName,
        userRole: input.userRole,
        participantCount: input.participantCount,
        goals: input.goals,
        data: JSON.stringify(input.data),
        matchScore: input.matchScore,
      },
    });
    if (diagnosticsNotifyEnabled()) {
      const proposal = (input.data as { proposal?: { trainingCost?: number } })?.proposal;
      notifyTelegram(
        formatDiagnosticMessage({
          companyName: input.companyName,
          userRole: input.userRole,
          participantCount: input.participantCount,
          matchScore: input.matchScore,
          totalCost: proposal?.trainingCost,
        })
      );
    }

    return NextResponse.json({ id: map.id });
  } catch (e) {
    console.error("[diagnostics POST]", e);
    return NextResponse.json(
      { error: "Не удалось сохранить карту диагностики." },
      { status: 400 }
    );
  }
}

export async function GET() {
  if (!isAdminRequest()) {
    return NextResponse.json({ error: "Требуется вход в админку." }, { status: 401 });
  }
  try {
    const maps = await prisma.diagnosticMap.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ maps });
  } catch (e) {
    console.error("[diagnostics GET]", e);
    return NextResponse.json(
      { error: "Не удалось загрузить карты диагностики." },
      { status: 500 }
    );
  }
}
