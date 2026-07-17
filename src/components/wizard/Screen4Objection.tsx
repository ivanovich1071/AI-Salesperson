"use client";

import { useWizardStore } from "@/store/wizardStore";

export default function Screen4Objection() {
  const s = useWizardStore();
  const r = s.objectionResponse;

  return (
    <div className="fade-in-up">
      <h1 className="text-3xl font-bold text-brown-deep">Давайте разберём этот вопрос</h1>

      <div className="mt-6 rounded-2xl border-l-4 border-l-gold bg-gold-light p-4">
        <strong className="text-brown-deep">Вы отметили:</strong>{" "}
        <span className="italic text-brown-light">«{s.objection}»</span>
      </div>

      {r ? (
        <div className="card mt-6 space-y-4 p-6 text-sm leading-relaxed text-brown-light">
          <p>
            <strong className="text-brown-deep">1. Понимаем вашу логику:</strong>{" "}
            {r.acknowledgement}
          </p>
          <p>
            <strong className="text-brown-deep">2. Конкретно для вашей компании:</strong>{" "}
            {r.answer}
          </p>
          <p>
            <strong className="text-brown-deep">3. Бизнес-контекст:</strong>{" "}
            {r.businessFocus}
          </p>
          <p>
            <strong className="text-brown-deep">4. Безопасный следующий шаг:</strong>{" "}
            {r.nextStep}
          </p>
        </div>
      ) : (
        <p className="mt-6 text-muted">
          Ответ не был подготовлен — эксперт разберёт ваш вопрос лично на встрече.
        </p>
      )}

      <div className="mt-8 flex items-center justify-between">
        <button className="btn-secondary" onClick={() => s.setStep(3)}>
          ← Назад к предложению
        </button>
        <button
          className="btn-primary"
          onClick={() => {
            s.pushChat("ai", "📅 Переходим к финалу. Выберите удобное время для 30-минутной встречи с Вероникой.");
            s.setStep(5);
          }}
        >
          Выбрать время встречи →
        </button>
      </div>
    </div>
  );
}
