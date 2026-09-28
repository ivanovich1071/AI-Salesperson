"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import SolutionCard from "@/components/lab/SolutionCard";
import SolutionModal from "@/components/lab/SolutionModal";
import { LAB_ICONS } from "@/components/lab/icons";
import {
  STATUS_STYLES,
  TONES,
  TONE_LABELS,
  type LabSolution,
  type StatusTone,
} from "@/lib/lab/schema";

/** Черновик формы: списки — текстом, по пункту на строку */
interface Draft {
  id?: string;
  name: string;
  role: string;
  task: string;
  abilities: string;
  tags: string;
  status: string;
  tone: StatusTone;
  liveUrl: string;
  liveLabel: string;
  note: string;
  icon: string;
  photo: string;
  isPublished: boolean;
}

const EMPTY: Draft = {
  name: "",
  role: "",
  task: "",
  abilities: "",
  tags: "",
  status: "Готов к внедрению",
  tone: "ready",
  liveUrl: "",
  liveLabel: "",
  note: "",
  icon: "lab",
  photo: "",
  isPublished: true,
};

const toDraft = (s: LabSolution): Draft => ({
  id: s.id,
  name: s.name,
  role: s.role,
  task: s.task,
  abilities: s.abilities.join("\n"),
  tags: s.tags.join("\n"),
  status: s.status,
  tone: s.tone,
  liveUrl: s.liveUrl ?? "",
  liveLabel: s.liveLabel ?? "",
  note: s.note ?? "",
  icon: s.icon,
  photo: s.photo ?? "",
  isPublished: s.isPublished,
});

const splitLines = (t: string) =>
  t
    .split("\n")
    .map((x) => x.trim())
    .filter(Boolean);

const toPayload = (d: Draft) => ({
  name: d.name,
  role: d.role,
  task: d.task,
  abilities: splitLines(d.abilities),
  tags: splitLines(d.tags),
  status: d.status,
  tone: d.tone,
  liveUrl: d.liveUrl,
  liveLabel: d.liveLabel,
  note: d.note,
  icon: d.icon,
  photo: d.photo || null,
  isPublished: d.isPublished,
});

/** Карточка для предпросмотра — в том виде, в каком ее увидит посетитель */
const toPreview = (d: Draft): LabSolution => ({
  id: d.id ?? "preview",
  ...toPayload(d),
  name: d.name || "Название решения",
  role: d.role || "Роль: кто это и для чего",
  task: d.task || "Какую задачу решает.",
  status: d.status || "Статус",
  liveUrl: d.liveUrl || undefined,
  liveLabel: d.liveLabel || undefined,
  note: d.note || undefined,
  photo: d.photo || undefined,
  sortOrder: 0,
  updatedBy: "",
  updatedAt: "",
});

/**
 * Ужимаем фото в браузере до 1600 px по длинной стороне (JPEG). Так загрузка
 * укладывается в лимит nginx (1 МБ) и витрина не тянет многомегабайтные снимки
 * с телефона.
 */
async function compressImage(file: File): Promise<Blob> {
  const MAX = 1600;
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const ctx = canvas.getContext("2d")!;
  // Прозрачный PNG в JPEG без подложки стал бы черным
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("toBlob"))), "image/jpeg", 0.85)
  );
}

async function readError(res: Response, fallback: string): Promise<string> {
  const d = await res.json().catch(() => ({}));
  return (d as { error?: string })?.error || fallback;
}

export default function LabSolutionsAdmin({
  onUnauthorized,
}: {
  onUnauthorized: () => void;
}) {
  const [items, setItems] = useState<LabSolution[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/solutions");
    if (res.status === 401) return onUnauthorized();
    const d = await res.json();
    setItems(d.solutions || []);
    setLoaded(true);
  }, [onUnauthorized]);

  useEffect(() => {
    load().catch(() => setError("Не удалось загрузить карточки."));
  }, [load]);

  function openForm(d: Draft) {
    setDraft(d);
    setError("");
    setNotice("");
    // Форма над списком — прокручиваем к ней, иначе на длинном списке ее не видно
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth" }), 0);
  }

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) =>
    setDraft((d) => (d ? { ...d, [key]: value } : d));

  async function uploadPhoto(file: File) {
    setError("");
    setBusy(true);
    try {
      const blob = await compressImage(file).catch(() => file);
      const form = new FormData();
      form.append("file", blob, "photo.jpg");
      const res = await fetch("/api/admin/solutions/upload", { method: "POST", body: form });
      if (res.status === 401) return onUnauthorized();
      if (!res.ok) {
        setError(await readError(res, "Не удалось загрузить фото."));
        return;
      }
      const { url } = await res.json();
      set("photo", url);
    } finally {
      setBusy(false);
    }
  }

  async function save() {
    if (!draft) return;
    setError("");
    setBusy(true);
    try {
      const res = await fetch(
        draft.id ? `/api/admin/solutions/${draft.id}` : "/api/admin/solutions",
        {
          method: draft.id ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(toPayload(draft)),
        }
      );
      if (res.status === 401) return onUnauthorized();
      if (!res.ok) {
        setError(await readError(res, "Не удалось сохранить карточку."));
        return;
      }
      setNotice(
        draft.id
          ? `Карточка «${draft.name}» сохранена — на сайте уже обновилась ✓`
          : `Карточка «${draft.name}» добавлена${draft.isPublished ? " и уже на сайте" : " (скрыта)"} ✓`
      );
      setDraft(null);
      await load();
    } finally {
      setBusy(false);
    }
  }

  async function patch(item: LabSolution, data: Record<string, unknown>, done: string) {
    setError("");
    const res = await fetch(`/api/admin/solutions/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.status === 401) return onUnauthorized();
    if (!res.ok) {
      setError(await readError(res, "Не удалось сохранить."));
      return;
    }
    setNotice(done);
    await load();
  }

  async function remove(item: LabSolution) {
    if (!window.confirm(`Удалить карточку «${item.name}»? Вернуть ее будет нельзя.`)) return;
    const res = await fetch(`/api/admin/solutions/${item.id}`, { method: "DELETE" });
    if (res.status === 401) return onUnauthorized();
    if (!res.ok) {
      setError(await readError(res, "Не удалось удалить."));
      return;
    }
    setNotice(`Карточка «${item.name}» удалена.`);
    if (draft?.id === item.id) setDraft(null);
    await load();
  }

  async function move(index: number, delta: -1 | 1) {
    const target = index + delta;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    [next[index], next[target]] = [next[target], next[index]];
    setItems(next); // сразу показываем новый порядок
    const res = await fetch("/api/admin/solutions/reorder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: next.map((x) => x.id) }),
    });
    if (res.status === 401) return onUnauthorized();
    if (!res.ok) setError(await readError(res, "Не удалось поменять порядок."));
    await load();
  }

  const preview = draft ? toPreview(draft) : null;

  return (
    <section className="card mt-8 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-brown-deep">Лаборатория решений</h2>
          <p className="mt-1 text-sm text-muted">
            Карточки витрины{" "}
            <a href="/solutions" target="_blank" className="underline hover:text-gold">
              vibemind.by/solutions
            </a>
            . Первые три показываются и на главной. Изменения видны на сайте сразу.
          </p>
        </div>
        {!draft && (
          <button className="btn-primary !px-6 !py-3" onClick={() => openForm({ ...EMPTY })}>
            + Новая карточка
          </button>
        )}
      </div>

      {notice && (
        <p className="mt-4 rounded-2xl bg-gold-light p-3 text-sm text-brown-deep">{notice}</p>
      )}
      {error && <p className="mt-4 rounded-2xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      {/* ===== ФОРМА ===== */}
      {draft && preview && (
        <div ref={formRef} className="mt-6 rounded-3xl border border-line bg-milk p-5">
          <h3 className="font-bold text-brown-deep">
            {draft.id ? `Правка: ${draft.name}` : "Новая карточка"}
          </h3>
          <div className="mt-4 grid gap-6 lg:grid-cols-[1fr_320px]">
            <div className="space-y-4">
              <div>
                <label className="label-base" htmlFor="lab-name">Название *</label>
                <input
                  id="lab-name"
                  className="input-base"
                  placeholder="Иван"
                  value={draft.name}
                  onChange={(e) => set("name", e.target.value)}
                />
              </div>
              <div>
                <label className="label-base" htmlFor="lab-role">Роль (подзаголовок карточки) *</label>
                <input
                  id="lab-role"
                  className="input-base"
                  placeholder="Виртуальный менеджер по продажам в Телеграм"
                  value={draft.role}
                  onChange={(e) => set("role", e.target.value)}
                />
              </div>
              <div>
                <label className="label-base" htmlFor="lab-task">Какую задачу решает *</label>
                <textarea
                  id="lab-task"
                  className="input-base"
                  rows={2}
                  value={draft.task}
                  onChange={(e) => set("task", e.target.value)}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="label-base" htmlFor="lab-abilities">
                    Что умеет (пункт на строку)
                  </label>
                  <textarea
                    id="lab-abilities"
                    className="input-base"
                    rows={4}
                    value={draft.abilities}
                    onChange={(e) => set("abilities", e.target.value)}
                  />
                </div>
                <div>
                  <label className="label-base" htmlFor="lab-tags">Теги (тег на строку)</label>
                  <textarea
                    id="lab-tags"
                    className="input-base"
                    rows={4}
                    placeholder={"Канал: Telegram\nДля: отделов продаж"}
                    value={draft.tags}
                    onChange={(e) => set("tags", e.target.value)}
                  />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="label-base" htmlFor="lab-status">Статус (текст плашки) *</label>
                  <input
                    id="lab-status"
                    className="input-base"
                    placeholder="Живое демо"
                    value={draft.status}
                    onChange={(e) => set("status", e.target.value)}
                  />
                </div>
                <div>
                  <label className="label-base" htmlFor="lab-tone">Цвет плашки</label>
                  <select
                    id="lab-tone"
                    className="input-base"
                    value={draft.tone}
                    onChange={(e) => set("tone", e.target.value as StatusTone)}
                  >
                    {TONES.map((t) => (
                      <option key={t} value={t}>
                        {TONE_LABELS[t]}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="label-base" htmlFor="lab-url">Ссылка (демо, сайт, GitHub)</label>
                  <input
                    id="lab-url"
                    className="input-base"
                    placeholder="https://t.me/…"
                    value={draft.liveUrl}
                    onChange={(e) => set("liveUrl", e.target.value)}
                  />
                </div>
                <div>
                  <label className="label-base" htmlFor="lab-url-label">Надпись на кнопке</label>
                  <input
                    id="lab-url-label"
                    className="input-base"
                    placeholder="Потыкать в Telegram"
                    value={draft.liveLabel}
                    onChange={(e) => set("liveLabel", e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label className="label-base" htmlFor="lab-note">Примечание мелким шрифтом</label>
                <input
                  id="lab-note"
                  className="input-base"
                  value={draft.note}
                  onChange={(e) => set("note", e.target.value)}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <span className="label-base">Фото (обложка)</span>
                  <div className="flex flex-wrap items-center gap-2">
                    <label className="btn-secondary cursor-pointer !px-4 !py-2 text-sm">
                      {draft.photo ? "Заменить фото" : "Загрузить фото"}
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                        data-testid="lab-photo-input"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          e.target.value = "";
                          if (f) uploadPhoto(f);
                        }}
                      />
                    </label>
                    {draft.photo && (
                      <button
                        type="button"
                        className="text-sm text-red-600 hover:underline"
                        onClick={() => set("photo", "")}
                      >
                        Убрать фото
                      </button>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-muted">
                    JPG, PNG или WebP; лучше горизонтальное 4:3. Без фото будет иконка.
                  </p>
                </div>
                <div>
                  <label className="label-base" htmlFor="lab-icon">Иконка (если нет фото)</label>
                  <select
                    id="lab-icon"
                    className="input-base"
                    value={draft.icon}
                    onChange={(e) => set("icon", e.target.value)}
                  >
                    {Object.entries(LAB_ICONS).map(([key, { label }]) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <label className="flex items-center gap-2 text-sm text-brown-deep">
                <input
                  type="checkbox"
                  checked={draft.isPublished}
                  onChange={(e) => set("isPublished", e.target.checked)}
                />
                Показывать на сайте
              </label>

              <div className="flex flex-wrap gap-3 pt-2">
                <button className="btn-primary !px-6 !py-3" disabled={busy} onClick={save}>
                  {busy ? "Сохраняем…" : "Сохранить"}
                </button>
                <button
                  className="btn-secondary !px-6 !py-3"
                  disabled={busy}
                  onClick={() => setDraft(null)}
                >
                  Отмена
                </button>
              </div>
            </div>

            {/* Предпросмотр — те же компоненты, что на сайте */}
            <div>
              <p className="label-base">Так карточка будет выглядеть на сайте</p>
              <div className="rounded-3xl bg-mist p-4" data-testid="lab-preview">
                <SolutionCard p={preview} onClick={() => setPreviewOpen(true)} />
              </div>
              <p className="mt-2 text-xs text-muted">
                Нажмите на карточку — откроется окно «Подробнее», как у посетителя.
              </p>
            </div>
          </div>
        </div>
      )}

      {previewOpen && preview && (
        <SolutionModal p={preview} onClose={() => setPreviewOpen(false)} />
      )}

      {/* ===== СПИСОК ===== */}
      {!loaded ? (
        <p className="mt-6 text-sm text-muted">Загружаем карточки…</p>
      ) : items.length === 0 ? (
        <p className="mt-6 text-sm text-muted">Карточек пока нет.</p>
      ) : (
        <ul className="mt-6 divide-y divide-line">
          {items.map((s, i) => (
            <li
              key={s.id}
              data-testid="lab-row"
              className={`flex flex-wrap items-center gap-4 py-3 ${s.isPublished ? "" : "opacity-60"}`}
            >
              <div className="flex flex-col">
                <button
                  className="px-2 text-muted hover:text-gold disabled:opacity-30"
                  title="Выше"
                  aria-label={`Поднять «${s.name}»`}
                  disabled={i === 0}
                  onClick={() => move(i, -1)}
                >
                  ▲
                </button>
                <button
                  className="px-2 text-muted hover:text-gold disabled:opacity-30"
                  title="Ниже"
                  aria-label={`Опустить «${s.name}»`}
                  disabled={i === items.length - 1}
                  onClick={() => move(i, 1)}
                >
                  ▼
                </button>
              </div>
              {s.photo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={s.photo} alt="" className="h-14 w-20 rounded-xl object-cover" />
              ) : (
                <div className="flex h-14 w-20 items-center justify-center rounded-xl bg-milk text-xs text-muted">
                  без фото
                </div>
              )}
              <div className="min-w-[200px] flex-1">
                <p className="font-semibold text-brown-deep">
                  {i + 1}. {s.name}
                  {!s.isPublished && <span className="ml-2 text-xs text-muted">(скрыта)</span>}
                </p>
                <p className="text-sm text-muted">{s.role}</p>
                <p className="mt-1 text-xs text-muted">
                  <span className={`mr-2 rounded-xl px-2 py-0.5 ${STATUS_STYLES[s.tone]}`}>
                    {s.status}
                  </span>
                  {s.updatedBy && (
                    <>
                      правил(а): {s.updatedBy},{" "}
                      {new Date(s.updatedAt).toLocaleString("ru-RU")}
                    </>
                  )}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  className="rounded-2xl border border-line px-3 py-1.5 text-xs font-semibold text-brown-light hover:border-gold hover:text-gold"
                  onClick={() =>
                    patch(
                      s,
                      { isPublished: !s.isPublished },
                      s.isPublished ? `«${s.name}» скрыта с сайта.` : `«${s.name}» снова на сайте.`
                    )
                  }
                >
                  {s.isPublished ? "Скрыть" : "Показать"}
                </button>
                <button
                  className="rounded-2xl border border-line px-3 py-1.5 text-xs font-semibold text-brown-light hover:border-gold hover:text-gold"
                  onClick={() => openForm(toDraft(s))}
                >
                  Изменить
                </button>
                <button
                  className="rounded-2xl border border-line px-3 py-1.5 text-xs font-semibold text-red-600 hover:border-red-400"
                  onClick={() => remove(s)}
                >
                  Удалить
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
