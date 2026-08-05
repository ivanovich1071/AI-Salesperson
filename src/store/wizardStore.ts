"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface ChatMessage {
  id: string;
  kind: "ai" | "status" | "user";
  text: string;
}

export interface ProposalModule {
  code: string;
  title: string;
  hours: number;
  image: string;
  reason: string;
}

export interface CostBreakdown {
  lines: { label: string; amount: number }[];
  total: number;
  currency: string;
  streams: number;
}

export interface LabInfo {
  title: string;
  range: string; // "5 000–9 500 BYN"
  description: string;
}

export interface DesignDevInfo {
  title: string;
  note: string;
  description: string;
}

export interface ProposalData {
  summary: string;
  trainingModules: ProposalModule[];
  totalHours: number;
  assemblyName: string;
  trainingFormat: string;
  trainingCost: CostBreakdown;
  lab: LabInfo;
  designDevelopment: DesignDevInfo;
  nextSteps: string[];
  matchScore: number;
  chatComment: string;
}

export interface ObjectionResponseData {
  acknowledgement: string;
  answer: string;
  businessFocus: string;
  nextStep: string;
}

export interface BookingDetails {
  id: string;
  date: string;
  time: string;
  name: string;
  email: string;
}

export type WizardStep = 1 | 2 | 3 | 4 | 5 | 6;

interface WizardState {
  step: WizardStep;

  // Экран 1
  companyName: string;
  websiteUrl: string;
  parsedWebsiteText: string;
  userRole: string;
  participantCount: number;
  goals: string;

  // Экран 2 — структурные ответы чекбокс-анкеты: qid → выбранные + «Другое»
  diagnosticAnswers: Record<string, { selected: string[]; other: string }>;
  // Свободные ответы из диалога с ассистентом, не легшие в конкретный вопрос
  // (идут в предложение и в карту диагностики).
  diagnosticNotes: string;

  // Экран 3
  proposal: ProposalData | null;
  objection: string;

  // Экран 4
  objectionResponse: ObjectionResponseData | null;

  // Экран 5
  bookingDetails: BookingDetails | null;

  // Отпечаток данных Шага 1, для которых сгенерированы AI-блоки
  generatedForFingerprint: string;

  // Метка «чат попросил собрать предложение» (timestamp); слушает Screen2Questions
  proposalRequestedAt: number;

  // Текст, отправленный в чат из полей формы (кнопка «отправить ассистенту»)
  outboundChat: { text: string; at: number } | null;

  chat: ChatMessage[];

  // actions
  setField: <K extends keyof WizardState>(key: K, value: WizardState[K]) => void;
  setStep: (step: WizardStep) => void;
  pushChat: (kind: ChatMessage["kind"], text: string) => void;
  replaceLastStatus: (text: string) => void;
  toggleOption: (qid: string, option: string) => void; // чекбокс: добавить/убрать
  setSingle: (qid: string, option: string) => void; // radio (под-вопрос): заменить
  setOther: (qid: string, text: string) => void; // поле «Другое»
  appendDiagnosticNote: (text: string) => void; // свободный ответ из чата
  mergeDiagnostic: (qid: string, selected: string[], other?: string) => void; // авто-заполнение из чата
  requestProposal: () => void; // запрос из чата: собрать предложение и перейти на шаг 3
  sendToChat: (text: string) => void; // отправить текст из поля формы ассистенту
  fingerprint: () => string;
  markGenerated: () => void;
  needsRegeneration: () => boolean;
  reset: () => void;
}

const GREETING: ChatMessage = {
  id: "greeting",
  kind: "ai",
  text: "👋 Здравствуйте! Я AI-ассистент компании ВайбМайнд. Помогу подобрать идеальную программу корпоративного обучения по ИИ для вашей команды. Заполните форму справа — и начнём.",
};

const initialData = {
  step: 1 as WizardStep,
  companyName: "",
  websiteUrl: "",
  parsedWebsiteText: "",
  userRole: "",
  participantCount: 10,
  goals: "",
  diagnosticAnswers: {} as Record<string, { selected: string[]; other: string }>,
  diagnosticNotes: "",
  proposal: null as ProposalData | null,
  objection: "",
  objectionResponse: null as ObjectionResponseData | null,
  bookingDetails: null as BookingDetails | null,
  generatedForFingerprint: "",
  proposalRequestedAt: 0,
  outboundChat: null as { text: string; at: number } | null,
  chat: [GREETING] as ChatMessage[],
};

let msgCounter = 0;

export const useWizardStore = create<WizardState>()(
  persist(
    (set, get) => ({
      ...initialData,

      setField: (key, value) => set({ [key]: value } as Partial<WizardState>),

      setStep: (step) => set({ step }),

      pushChat: (kind, text) =>
        set((s) => ({
          chat: [...s.chat, { id: `m${Date.now()}_${msgCounter++}`, kind, text }],
        })),

      replaceLastStatus: (text) =>
        set((s) => {
          const chat = [...s.chat];
          const idx = chat.map((m) => m.kind).lastIndexOf("status");
          if (idx >= 0) chat[idx] = { ...chat[idx], text };
          else chat.push({ id: `m${Date.now()}_${msgCounter++}`, kind: "status", text });
          return { chat };
        }),

      toggleOption: (qid, option) =>
        set((s) => {
          const cur = s.diagnosticAnswers[qid] ?? { selected: [], other: "" };
          const selected = cur.selected.includes(option)
            ? cur.selected.filter((o) => o !== option)
            : [...cur.selected, option];
          return { diagnosticAnswers: { ...s.diagnosticAnswers, [qid]: { ...cur, selected } } };
        }),

      setSingle: (qid, option) =>
        set((s) => {
          const cur = s.diagnosticAnswers[qid] ?? { selected: [], other: "" };
          return {
            diagnosticAnswers: { ...s.diagnosticAnswers, [qid]: { ...cur, selected: [option] } },
          };
        }),

      setOther: (qid, text) =>
        set((s) => {
          const cur = s.diagnosticAnswers[qid] ?? { selected: [], other: "" };
          return { diagnosticAnswers: { ...s.diagnosticAnswers, [qid]: { ...cur, other: text } } };
        }),

      appendDiagnosticNote: (text) =>
        set((s) => {
          const t = text.trim();
          if (!t) return {};
          return { diagnosticNotes: s.diagnosticNotes ? `${s.diagnosticNotes}\n${t}` : t };
        }),

      mergeDiagnostic: (qid, selected, other) =>
        set((s) => {
          const cur = s.diagnosticAnswers[qid] ?? { selected: [], other: "" };
          const merged = Array.from(new Set([...cur.selected, ...selected]));
          const nextOther =
            other && other.trim()
              ? cur.other
                ? `${cur.other} ${other.trim()}`
                : other.trim()
              : cur.other;
          return {
            diagnosticAnswers: {
              ...s.diagnosticAnswers,
              [qid]: { selected: merged, other: nextOther },
            },
          };
        }),

      requestProposal: () => set({ proposalRequestedAt: Date.now() }),

      sendToChat: (text) => {
        const t = text.trim();
        if (t) set({ outboundChat: { text: t, at: Date.now() } });
      },

      fingerprint: () => {
        const s = get();
        return JSON.stringify([
          s.companyName,
          s.websiteUrl,
          s.userRole,
          s.participantCount,
          s.goals,
        ]);
      },

      markGenerated: () => set({ generatedForFingerprint: get().fingerprint() }),

      needsRegeneration: () =>
        get().generatedForFingerprint !== "" &&
        get().generatedForFingerprint !== get().fingerprint(),

      reset: () => set({ ...initialData, chat: [GREETING] }),
    }),
    {
      name: "ai-salesperson-wizard",
      partialize: (s) => {
        // не сохраняем функции; chat сохраняем, чтобы шаг назад не терял историю
        const { setField, setStep, pushChat, replaceLastStatus, toggleOption, setSingle, setOther, appendDiagnosticNote, mergeDiagnostic, requestProposal, sendToChat, fingerprint, markGenerated, needsRegeneration, reset, ...data } = s;
        return data;
      },
    }
  )
);
