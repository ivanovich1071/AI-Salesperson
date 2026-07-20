# AI-продажник корпоративного обучения Вероники Пунчик

Единый сайт-приложение: лендинг курса «Нейросервисы и системы искусственного интеллекта:
от основ к экспертным решениям» + интерактивный AI-визард, который проводит потенциального
клиента через диагностику бизнес-задач, подбирает модули обучения, считает стоимость,
отвечает на возражения и записывает на встречу с экспертом.

## Стек

Next.js 14 (App Router) · TypeScript · Tailwind CSS · Zustand · SQLite + Prisma ·
OpenRouter (Qwen — текст/JSON, Whisper Large V3 — голос).

## Структура сайта

| Маршрут | Что это |
|---|---|
| `/` | Лендинг — весь контент курса (о программе, 3 модуля, AI-навыки, автор с сертификатами, контакты). Все CTA ведут на `/app?new=1` |
| `/app` | Визард AI-диагностики: 5 экранов (компания → диагностика → предложение → возражение → бронь встречи) |
| `/admin` | Админ-панель: заявки, свободные слоты, шаблон сообщения для эксперта |
| `/privacy` | Политика конфиденциальности |

## Быстрый старт

```bash
npm install
cp .env.example .env       # заполнить OPENROUTER_API_KEY и остальные переменные
npm run db:push            # применить схему Prisma к SQLite
npm run dev                # http://localhost:3100
```

Полезные команды:

```bash
npm run build && npm run start   # прод-сборка и запуск
npx tsc --noEmit                 # проверка типов
npm run db:studio                # Prisma Studio — визуальный просмотр БД
node scripts/seed-slots.mjs 2026-08-01 2026-08-14   # сгенерировать демо-слоты на диапазон дат
node scripts/seed-current-month.mjs                 # слоты на текущий месяц + чистка прошедших (для cron)
```

## Переменные окружения (`.env`)

| Переменная | Назначение |
|---|---|
| `OPENROUTER_API_KEY` | Ключ OpenRouter (не коммитить) |
| `OPENROUTER_MODEL` | Текстовая модель (по умолчанию Qwen) |
| `OPENROUTER_WHISPER_MODEL` | Модель распознавания речи |
| `DATABASE_URL` | Путь к SQLite-файлу (`file:./dev.db`) |
| `ADMIN_USER` / `ADMIN_PASSWORD` | Логин админ-панели |
| `ADMIN_SESSION_SECRET` | Секрет для подписи cookie-сессии админа |
| `NEXT_PUBLIC_SITE_URL` | Публичный URL (метатеги, заголовки запросов к OpenRouter) |

Полный список с описаниями — в [.env.example](.env.example).

## Ключевые директории

```
src/
├── app/                 # страницы (App Router) и API-роуты (app/api/**/route.ts)
├── components/wizard/    # 6 экранов визарда + чат-панель + голосовой ввод
├── store/wizardStore.ts  # Zustand-стор состояния визарда (persist в localStorage)
└── lib/                  # бизнес-логика: pricing, openrouter, knowledge, prisma, schemas

prisma/schema.prisma      # модели TimeSlot, Booking (SQLite)
knowledge/                # база знаний (RAG) — Obsidian-vault, авто-подгружается в промпт
prompts/assistant-system.md  # системный промпт AI-консультанта
scripts/seed-slots.mjs    # генератор демо-слотов для календаря встреч
.claude/skills/frontend/  # соглашения по фронтенду проекта (для Claude Code)
```

Подробности архитектуры, палитры и соглашений по коду — в [.claude/CLAUDE.md](.claude/CLAUDE.md)
и [.claude/skills/frontend/SKILL.md](.claude/skills/frontend/SKILL.md).

## База знаний и системный промпт

`knowledge/` — Obsidian-vault (можно открыть как vault в Obsidian). Все `.md`-файлы, кроме
`README.md`, автоматически подгружаются в системный промпт AI (см. `src/lib/knowledge.ts`).
Пополнение: положить новый `.md`-файл с числовым префиксом (`03-...`) — перезапуск сервера
не требуется в dev-режиме.

`prompts/assistant-system.md` — системный промпт консультанта (роли агентов, правила
безопасности, банк диагностических вопросов по ролям, сценарии возражений).

## Цены и выбор модулей

- `src/lib/pricing.ts` — единственное место, где правятся цены модулей (BYN).
- `src/lib/moduleSelection.ts` — детерминированная матрица «роль участников → модули +
  обязательные/желательные занятия». AI модули не выбирает — только объясняет готовый выбор.

## Деплой

Целевой хостинг — VPS (Node.js) за nginx reverse proxy. SQLite-файл (`prisma/dev.db`)
живёт рядом с приложением на диске сервера.

## Git-workflow

Коммитить и пушить на GitHub после каждого законченного блока работы (см. правило в
`.claude/CLAUDE.md`). Commit-стиль — Conventional Commits (`feat:`, `fix:`, `docs:`).
Репозиторий: https://github.com/ivanovich1071/AI-Salesperson
