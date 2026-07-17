import { z } from "zod";

// === Zod-схемы для строгой валидации JSON-ответов Qwen (по ТЗ, раздел 12) ===

/** Экран 2: диагностические вопросы */
export const DiagnosticQuestionsSchema = z.object({
  chatIntro: z.string().min(1),
  questions: z.array(z.string().min(5)).min(3).max(4),
});
export type DiagnosticQuestions = z.infer<typeof DiagnosticQuestionsSchema>;

/** Экран 3: персональное предложение */
export const ProposalSchema = z.object({
  summary: z.string().min(1), // Блок 1: «Что мы увидели»
  recommendedModules: z
    .array(
      z.object({
        id: z.enum(["intro", "practice", "consulting"]),
        reason: z.string().min(1), // почему подходит этой роли/компании
      })
    )
    .min(1)
    .max(3),
  trainingFormat: z.string().min(1), // Блок 3: «Как будет проходить обучение»
  matchScore: z.number().min(0).max(100), // шкала соответствия
  chatComment: z.string().min(1), // комментарий AI в чат
});
export type Proposal = z.infer<typeof ProposalSchema>;

/** Экран 4: обработка возражения */
export const ObjectionResponseSchema = z.object({
  acknowledgement: z.string().min(1), // 1. признание логики сомнения
  answer: z.string().min(1), // 2. конкретный ответ с привязкой к контексту
  businessFocus: z.string().min(1), // 3. возврат к бизнес-задаче
  nextStep: z.string().min(1), // 4. безопасный следующий шаг (встреча)
});
export type ObjectionResponse = z.infer<typeof ObjectionResponseSchema>;

// === Схемы входных данных API ===

export const CompanyInfoSchema = z.object({
  companyName: z.string().min(1),
  websiteUrl: z.string().optional().default(""),
  parsedWebsiteText: z.string().optional().default(""),
  userRole: z.string().min(1),
  participantCount: z.number().int().positive(),
  goals: z.string().min(1),
});
export type CompanyInfo = z.infer<typeof CompanyInfoSchema>;

export const BookingInputSchema = z.object({
  slotId: z.string().min(1),
  name: z.string().min(1),
  company: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(5),
  summary: z.record(z.unknown()).optional().default({}),
  totalCost: z.number().int().nonnegative().optional().default(0),
});
export type BookingInput = z.infer<typeof BookingInputSchema>;
