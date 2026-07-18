# CLAUDE.md — AI-продажник корпоративного обучения Вероники Пунчик

Единый сайт-приложение: лендинг + интерактивный AI-визард продажи корпоративного
семинара-практикума «Нейросервисы и системы ИИ» + админка слотов/заявок.

## Архитектура

- **`/`** — лендинг (контент прежнего pedfund.github.io/AI-PVNvna, перекрашен в фирменный стиль). Все CTA ведут на `/app`.
- **`/app`** — визард из 5 экранов (ТЗ): компания → диагностика → предложение → возражение → бронь встречи. Макет: слева ~25% AI-чат (75% высоты) + футер (25%), справа ~75% активная панель. Мобайл: чат = bottom sheet.
- **`/admin`** — админка (admin/demo2026): брони, слоты, шаблон сообщения для эксперта.
- **`/privacy`** — политика конфиденциальности (РБ 99-З + РФ 152-ФЗ).

## Стек

Next.js 14 (App Router) · TypeScript · Tailwind (палитра в `tailwind.config.ts`: brown-deep #3E2723, gold #D4AF37, milk #FAF9F6, ink #2C1B18) · Zustand+persist (`src/store/wizardStore.ts`) · SQLite+Prisma (`prisma/schema.prisma`: TimeSlot, Booking) · OpenRouter (Qwen — текст/JSON, Whisper Large V3 — голос).

## Ключевые файлы

| Что | Где |
|---|---|
| Цены и каталог модулей (BYN 1000/1300/1500) | `src/lib/pricing.ts` — ЕДИНСТВЕННОЕ место правки цен |
| Системный промпт AI-продажника | `prompts/assistant-system.md` (v1.0 от заказчика, 18.07.2026, адаптирован) |
| Детерминированный выбор модулей по роли | `src/lib/moduleSelection.ts` (матрица «роль → модули/занятия»; AI модули НЕ выбирает) |
| База знаний (RAG) | `knowledge/*.md` — это Obsidian-vault, открывать как vault |
| OpenRouter-клиент (chat, JSON-retry, whisper) | `src/lib/openrouter.ts` |
| Zod-схемы AI-ответов и входных данных | `src/lib/schemas.ts` |
| Админ-сессия (HMAC-cookie) | `src/lib/adminAuth.ts` |

## Команды

```bash
npm run dev        # dev-сервер на http://localhost:3100
npm run build      # прод-сборка
npm run db:push    # применить схему Prisma к SQLite (prisma/dev.db)
npx tsc --noEmit   # проверка типов
```

Ключи — в `.env` (не в git): `OPENROUTER_API_KEY`, модели `OPENROUTER_MODEL` / `OPENROUTER_WHISPER_MODEL`.

## Принципы (из ТЗ)

- Весь интерфейс и AI-контент — строго на русском.
- AI НЕ придумывает цены: расчёт детерминированный на бэкенде (`calculateCost`).
- Ответы Qwen валидируются Zod; при ошибке — один повторный запрос с текстом ошибки.
- Голосовой ввод: MediaRecorder → `/api/transcribe` → Whisper; текст вставляется «сырым», без постобработки; всегда есть текстовый фолбэк.
- Ошибки пользователю — дружелюбные, на русском, без stack trace.
- Никаких фейковых демо-данных в БД: чистая база, слоты добавляет админ.
- При изменении данных Шага 1 зависимые AI-блоки регенерируются (fingerprint в сторе).

## База знаний (Obsidian)

`knowledge/` — Obsidian-vault. Все `.md` (кроме README) автоматически подгружаются в
системный промпт (см. `src/lib/knowledge.ts`, лимит `MAX_KNOWLEDGE_CHARS`). Порядок — по
алфавиту, префиксы `01-`, `02-`... БЗ будет пополняться — при добавлении крупных файлов
следить за лимитом.

## Git-workflow (ОБЯЗАТЕЛЬНО)

- После каждого законченного блока работы: **коммитить и пушить на GitHub** (`git add -A && git commit && git push`).
- Conventional Commits: `feat:`, `fix:`, `docs:`, `refactor:`, `test:`.
- Не коммитить: `.env`, `prisma/*.db`, `node_modules`, `.next`, `knowledge/.obsidian/workspace.json`.

## Деплой

Целевой хостинг — VPS (Node.js). SQLite-файл живёт рядом с приложением, поэтому обычный
`npm run build && npm run start` (порт 3100), впереди — nginx reverse proxy.

## Справочные материалы (в корне, не часть приложения)

- `index.html` — исходный статический макет визарда (референс дизайна).
- `!!Брест_мясокомбинат2026подЗапрос.docx` — исходник программы (уже извлечён в `knowledge/01-program.md`).
- `Анализ корпоративного курса.md` — исходник для `knowledge/02-course-analysis.md`.
