# CLAUDE.md — AI-продажник корпоративного обучения Вероники Пунчик

Единый сайт-приложение: лендинг + интерактивный AI-визард продажи корпоративного
семинара-практикума «Нейросервисы и системы ИИ» + админка слотов/заявок.

## Архитектура

- **`/`** — лендинг (контент прежнего pedfund.github.io/AI-PVNvna, перекрашен в фирменный стиль). Все CTA ведут на `/app?new=1` (сброс стора визарда для нового клиента).
- **`/app`** — визард из 5 экранов (ТЗ): компания → диагностика → предложение → возражение → бронь встречи. Макет: слева ~25% AI-чат на всю высоту (футер убран по требованию заказчика — контакты только на лендинге), справа ~75% активная панель. Мобайл: чат = bottom sheet.

Подробные фронтенд-соглашения (палитра, компоненты, стор, стиль кода) — в [.claude/skills/frontend/SKILL.md](skills/frontend/SKILL.md).
- **`/admin`** — админка (admin/demo2026): брони, слоты, шаблон сообщения для эксперта.
- **`/privacy`** — политика конфиденциальности (РБ 99-З + РФ 152-ФЗ).
- **`/faq`** — вопросы и ответы. Страница написана под ИИ-поисковики: вопросы в формулировках пользователя, ответ целиком в первом предложении, разметка `FAQPage`. Контент — в `src/lib/seo/faq.ts`, не в вёрстке.

## Стек

Next.js 14 (App Router) · TypeScript · Tailwind (палитра в `tailwind.config.ts`: brown-deep #3E2723, gold #D4AF37, milk #FAF9F6, ink #2C1B18) · Zustand+persist (`src/store/wizardStore.ts`) · SQLite+Prisma (`prisma/schema.prisma`: TimeSlot, Booking) · OpenRouter (Qwen — текст/JSON, Whisper Large V3 — голос).

## Ключевые файлы

| Что | Где |
|---|---|
| Протокол цен: 6 пакетов + каталог модулей | `src/lib/pricing.ts` — ЕДИНСТВЕННОЕ место правки цен. Цена = пакет из прайса + надбавки за доп. потоки и контур руководителей; сложения модулей нет. Треки сверх пакета уходят в опции |
| Системный промпт AI-продажника | `prompts/assistant-system.md` (v1.0 от заказчика, 18.07.2026, адаптирован) |
| Детерминированный выбор модулей по роли | `src/lib/moduleSelection.ts` (матрица «роль → модули/занятия»; AI модули НЕ выбирает) |
| База знаний (RAG) | `knowledge/*.md` — это Obsidian-vault, открывать как vault |
| OpenRouter-клиент (chat, JSON-retry, whisper) | `src/lib/openrouter.ts` |
| Zod-схемы AI-ответов и входных данных | `src/lib/schemas.ts` |
| Админ-сессия (HMAC-cookie) | `src/lib/adminAuth.ts` |
| Факты о компании для машин (GEO) | `src/lib/seo/profile.ts` — ЕДИНСТВЕННОЕ место правки названия, контактов, услуг, модулей и продуктов. Из него собираются `/llms.txt`, `/llms-full.txt`, `/identity.json`, `/ai.json`, разметка Schema.org и sitemap |

## Команды

```bash
npm run dev        # dev-сервер на http://localhost:3100
npm run build      # прод-сборка
npm run db:push    # применить схему Prisma к SQLite (prisma/dev.db)
npx tsc --noEmit   # проверка типов
npm run test:e2e   # E2E-тесты (Playwright, ≈5 мин)
npm run deploy     # деплой на прод (пароль не нужен, вход по ключу)
```

## Тесты (E2E, Playwright)

Соглашения по написанию и починке — в [skills/testing/SKILL.md](skills/testing/SKILL.md),
статус и открытые вопросы — в [TESTING.md](../TESTING.md).

**82 сценария**, прогон в двух конфигурациях (desktop 1280 и mobile Pixel 5):

| Файл | Сценарии |
|---|---|
| `e2e/landing.spec.ts` | навигация и якоря · 7 карточек «Лаборатории» с модалками и ссылками на ботов · **стрелки процесса между карточками** · навбар на 950px · бургер-меню · нет горизонтального скролла |
| `e2e/course.spec.ts` | тизер → `/#solutions` · модалки сертификатов · «Ключевой спикер» · список «Внедрено» · отсутствие личных контактов |
| `e2e/wizard.spec.ts` | сквозной путь компания → анкета → предложение → бронь → успех · ветка возражения (3→4→5) · степпер (назад свободно, вперёд по готовности) · валидация формы · заполнение анкеты и формы из чата · голосовой ввод · дружелюбные ошибки при сбое AI |
| `e2e/admin.spec.ts` | неверный и верный логин · брони · карты диагностики · добавление и удаление слотов |
| `e2e/a11y.spec.ts` | axe-аудит 4 страниц (контраст-проверки временно пропущены — см. TESTING.md) |
| `e2e/visual.spec.ts` | скриншот-эталоны главной, курса и экранов визарда |
| `e2e/geo.spec.ts` | видимость для ИИ-поисковиков: robots.txt пускает GPTBot/ClaudeBot/PerplexityBot · sitemap · llms.txt · identity.json · ai.json · /.well-known/ai.txt · разметка Organization/WebSite/Course/Person/FAQPage · все вопросы FAQ видны в HTML |

**Три правила, без которых тесты ломаются:**
1. AI всегда мокается (`mockAi(page)` в `beforeEach`) — живой OpenRouter медленный,
   платный и недетерминированный.
2. Тесты работают с отдельной базой `test.db`; рабочая `dev.db` не трогается.
3. Визард стартует с `/app?new=1` — иначе состояние из `localStorage` протекает
   между тестами.

Ключи — в `.env` (не в git): `OPENROUTER_API_KEY`, модели `OPENROUTER_MODEL` / `OPENROUTER_WHISPER_MODEL`.

## GEO — видимость в ИИ-поисковиках

Сайт настроен так, чтобы ChatGPT Search, Perplexity, Claude, Gemini и Copilot
могли его обойти, понять и процитировать. Все факты берутся из
`src/lib/seo/profile.ts` и `src/lib/seo/faq.ts` — правь только там, файлы ниже
собираются из них автоматически.

| Адрес | Что отдаёт | Код |
|---|---|---|
| `/robots.txt` | 18 ИИ-краулеров разрешены поимённо, `/admin` и `/api` закрыты | `src/app/robots.ts` |
| `/sitemap.xml` | публичные страницы с приоритетами | `src/app/sitemap.ts` |
| `/llms.txt` | краткий «паспорт» компании для языковых моделей | `src/app/llms.txt/route.ts` |
| `/llms-full.txt` | весь публичный контент одним Markdown | `src/app/llms-full.txt/route.ts` |
| `/identity.json` | карточка организации в Schema.org | `src/app/identity.json/route.ts` |
| `/ai.json`, `/.well-known/ai.txt` | правила цитирования и запреты для моделей | `src/app/ai.json/route.ts`, `src/app/ai-policy.txt/route.ts` |

JSON-LD вставляется компонентом `src/components/seo/JsonLd.tsx`: Organization +
WebSite + ItemList решений в корневом layout, Course + Person на `/course`,
FAQPage на `/faq`. Схемы собираются в `src/lib/seo/jsonLd.ts`.

**Критично при деплое:** `NEXT_PUBLIC_SITE_URL` подставляется на **сборке**.
Если на сервере переменная не задана или осталась `localhost`, в sitemap,
canonical и JSON-LD уедут локальные адреса — краулеры уйдут в никуда. Проверка:

```bash
npm run geo:audit -- https://vibemind.by
```

Скрипт (`scripts/geo-audit.mjs`, без зависимостей) печатает GEO-score и список
починок; он же стоит в `.github/workflows/geo-audit.yml` (еженедельно + при
правках SEO-файлов, порог 80). Общие правила GEO вынесены в глобальный скилл
`~/.claude/skills/geo-optimizer/`.

**Чего не делать:** размечать `FAQPage` вопросами, которых нет в видимом HTML;
публиковать в разметке цены (они считаются индивидуально — в `ai.json` стоит
явный запрет моделям их выдумывать); добавлять скрытый текст «для нейросетей».

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

Прод — https://vibemind.by (VPS, Node.js). SQLite-файл живёт рядом с приложением, поэтому обычный
`npm run build && npm run start` (порт 3100), впереди — nginx reverse proxy.

## Справочные материалы (в корне, не часть приложения)

- `index.html` — исходный статический макет визарда (референс дизайна).
- `!!Брест_мясокомбинат2026подЗапрос.docx` — исходник программы (уже извлечён в `knowledge/01-program.md`).
- `Анализ корпоративного курса.md` — исходник для `knowledge/02-course-analysis.md`.
