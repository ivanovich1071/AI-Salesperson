---
name: frontend
description: Настройки и соглашения фронтенда AI-продажника Вероники Пунчик — Next.js 14 App Router, Tailwind (фирменная палитра), Zustand-стор визарда, структура компонентов. Загружать при любой работе с src/app, src/components, src/store, стилями или клиентским UI этого проекта.
---

# Frontend — AI-продажник Вероники Пунчик

Справочник по фронтенд-части проекта: стек, палитра, структура, соглашения. Читать перед
любой правкой `src/app/**`, `src/components/**`, `src/store/**`, `tailwind.config.ts`,
`src/app/globals.css`.

## Стек

| Технология | Версия | Роль |
|---|---|---|
| Next.js | 14.2 (App Router) | Роутинг, RSC, API routes (`route.ts`) |
| React | 18.3 | UI |
| TypeScript | 5.5 | strict mode (`tsconfig.json`) |
| Tailwind CSS | 3.4 | Вся стилизация — **без CSS-модулей и styled-components** |
| Zustand | 4.5 + `persist` middleware | Клиентское состояние визарда |
| Zod | 3.23 | Валидация на границе клиент/сервер (используется и в API-роутах) |

Dev-сервер: `npm run dev` → **порт 3100** (не 3000 — задано в `package.json`, чтобы не
конфликтовать с другими локальными проектами). Прод: `npm run build && npm run start`.

## Три раздела приложения

| Маршрут | Файл | Тип |
|---|---|---|
| `/` | `src/app/page.tsx` | Клиентский компонент (лендинг, одностраничник с якорями) |
| `/app` | `src/app/app/page.tsx` | Клиентский компонент (визард, `"use client"`) |
| `/admin` | `src/app/admin/page.tsx` | Клиентский компонент (логин + дашборд) |
| `/privacy` | `src/app/privacy/page.tsx` | Серверный компонент (статичный текст) |
| `src/app/layout.tsx` | Корневой layout | `<html lang="ru">`, метатеги, импорт `globals.css` |

Все интерактивные страницы — `"use client"` (используют `useState`/Zustand/эффекты).
`/privacy` — единственная серверная страница, оставляй её так же простой при правках.

## Цветовая палитра (фирменный стиль)

Определена в `tailwind.config.ts`, используется **только через Tailwind-классы**
(`bg-gold`, `text-brown-deep` и т.п.) — хардкодить hex в JSX не нужно.

```ts
brown: { deep: "#3E2723", light: "#5D4037" }
gold:  { DEFAULT: "#D4AF37", light: "#F4E5B2", hover: "#E5C14D" }
milk:  "#FAF9F6"   // фон страниц
ink:   "#2C1B18"   // основной текст
muted: "#6D5E59"   // второстепенный текст
line:  "#E6DFD8"   // границы, разделители
```

Дополнительно: `rounded-2xl` (16px) / `rounded-3xl` (24px) для карточек и кнопок,
`shadow-soft` / `shadow-gold` — фирменные тени. Шрифт — системный (`Segoe UI` / system-ui),
без Google Fonts.

## Готовые CSS-компоненты (`src/app/globals.css`, `@layer components`)

Переиспользуй эти классы вместо того, чтобы собирать утилиты заново:

- `.btn-primary` — золотая кнопка (основной CTA)
- `.btn-secondary` — контурная кнопка («Назад» и т.п.)
- `.card` — белая карточка с рамкой и `shadow-soft`
- `.section-title` / `.title-underline` — заголовок секции лендинга + золотое подчёркивание
- `.input-base` — поле ввода/textarea/select (фокус — золотая обводка)
- `.label-base` — подпись над полем

Анимации: `.fade-in-up` (появление сообщений чата/экранов), `.rec-pulse` (мигающий
индикатор записи в `MicButton`).

## Структура компонентов

```
src/
├── app/
│   ├── page.tsx              # лендинг (весь контент в одном файле, секции по id)
│   ├── layout.tsx            # root layout + метатеги
│   ├── globals.css           # Tailwind + фирменные @layer components
│   ├── app/page.tsx           # визард — оркестрирует ChatPanel + Screen1..6
│   ├── admin/page.tsx         # админка (self-contained, без отдельных компонентов)
│   ├── privacy/page.tsx       # статичная страница
│   └── api/**/route.ts        # серверные роуты (не относятся к фронтенду напрямую)
├── components/wizard/
│   ├── ChatPanel.tsx          # левая колонка визарда — только AI-чат (футер убран нарочно)
│   ├── MicButton.tsx          # голосовой ввод: idle → recording → transcribing
│   ├── Screen1Company.tsx     # шаг 1: данные компании
│   ├── Screen2Questions.tsx   # шаг 2: диагностические вопросы (+ кнопка "отправить ответ")
│   ├── Screen3Proposal.tsx    # шаг 3: предложение + расчёт стоимости
│   ├── Screen4Objection.tsx   # шаг 4: обработка возражения
│   ├── Screen5Booking.tsx     # шаг 5: календарь + форма контактов
│   └── Screen6Success.tsx     # финал: подтверждение брони
├── store/wizardStore.ts       # Zustand + persist("ai-salesperson-wizard", localStorage)
└── lib/                       # НЕ фронтенд-специфика — pricing, openrouter, prisma и т.д.
```

## Состояние визарда (`src/store/wizardStore.ts`)

Один Zustand-стор с `persist` в `localStorage` (ключ `ai-salesperson-wizard`). Хранит все
данные шагов 1–6 + историю чата (`chat: ChatMessage[]`) + `bookingDetails`.

Ключевые механизмы:
- **`fingerprint()` / `needsRegeneration()`** — при изменении данных Шага 1 (компания,
  роль, цели) AI-блоки (вопросы, предложение) считаются устаревшими и генерируются заново
  при следующем запуске диагностики (см. `Screen1Company.tsx`).
- **`reset()`** — полная очистка стора. Вызывается со страницей `/app?new=1` (лендинг
  всегда ссылается на визард с этим параметром, чтобы новый клиент не видел данные
  предыдущего — см. `useEffect` в `src/app/app/page.tsx`).
- **`pushChat` / `replaceLastStatus`** — добавление сообщений в чат; `status`-сообщения
  (индикаторы загрузки) заменяются на финальный результат, а не накапливаются.

При добавлении нового поля в визард: расширяй `WizardState` в сторе, НЕ создавай
параллельное состояние в компоненте — все данные шагов должны жить в сторе, иначе шаг
«Назад» их потеряет.

## Соглашения по стилю кода

- **Иконки** — inline SVG (см. `page.tsx`, `MicButton.tsx`), внешние иконочные библиотеки
  (Font Awesome и т.п.) не используются.
- **Изображения** — обычный `<img>` с `// eslint-disable-next-line @next/next/no-img-element`
  (осознанный выбор — не `next/image`, т.к. все изображения локальные и небольшие;
  сохраняй этот комментарий при добавлении новых `<img>`).
- **Состояния загрузки** — инлайновый спиннер (`animate-spin` + бордер), см. кнопки в
  Screen1–5. Не используй сторонние skeleton-библиотеки.
- **Ошибки пользователю** — дружелюбный текст на русском в `<p className="... bg-red-50
  text-red-700">`, никогда не показывать raw error/stack.
- **Компоненты страниц** — толстые (вся логика шага в одном файле), общих UI-примитивов
  (Button.tsx, Input.tsx) сознательно нет: проект небольшой, дублирование Tailwind-классов
  дешевле абстракции. Не начинай выделять компоненты без явного запроса.

## Проверка перед коммитом

```bash
npx tsc --noEmit   # обязательно после любой правки .ts/.tsx
npm run dev         # ручная проверка в браузере — порт 3100
```

Верификация в браузере — через Browser-pane (preview_start на `http://127.0.0.1:3100`,
не `localhost` — так стабильнее резолвится).
