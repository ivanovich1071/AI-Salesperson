/**
 * Уведомления в Telegram.
 *
 * Односторонний канал: сайт шлёт сообщения боту, бот пересылает их в личку
 * или в группу. Никаких вебхуков и постоянных соединений — обычный HTTPS-запрос
 * к Bot API. Это сознательно: на сервере один процесс Node, и держать ради
 * уведомлений вторую службу с long polling не за что.
 *
 * Правило: уведомление никогда не ломает основной сценарий. Если Telegram
 * недоступен, токен не задан или сеть отвалилась — бронь всё равно сохраняется,
 * а в лог уходит строка. Клиент об этом не узнаёт.
 */

const API_TIMEOUT_MS = 5000;

/** Экранирование под parse_mode=HTML: Telegram ругается на сырые < > &. */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/**
 * Разряды в сумме. Своя функция вместо toLocaleString: та в зависимости от
 * сборки Node подставляет то обычный пробел, то неразрывный — а в уведомлении
 * нужен предсказуемый текст.
 */
function formatMoney(value: number): string {
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

/** Получатели: один или несколько chat_id через запятую. */
function recipients(): string[] {
  return (process.env.TELEGRAM_CHAT_ID ?? "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);
}

/** Настроен ли канал уведомлений (токен + хотя бы один получатель). */
export function isTelegramConfigured(): boolean {
  return Boolean(process.env.TELEGRAM_BOT_TOKEN) && recipients().length > 0;
}

/**
 * Отправить сообщение всем получателям. Не бросает исключений.
 * @returns сколько сообщений реально ушло
 */
export async function sendTelegramMessage(text: string): Promise<number> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatIds = recipients();
  if (!token || chatIds.length === 0) {
    console.warn("[telegram] уведомление пропущено: не задан TELEGRAM_BOT_TOKEN или TELEGRAM_CHAT_ID");
    return 0;
  }

  let sent = 0;
  for (const chatId of chatIds) {
    try {
      const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text,
          parse_mode: "HTML",
          disable_web_page_preview: true,
        }),
        signal: AbortSignal.timeout(API_TIMEOUT_MS),
      });
      if (res.ok) {
        sent += 1;
      } else {
        console.error(`[telegram] чат ${chatId}: ${res.status} ${await res.text()}`);
      }
    } catch (e) {
      console.error(`[telegram] чат ${chatId}:`, e);
    }
  }
  return sent;
}

/**
 * Уведомление «в фоне»: вызывающий код не ждёт ответа Telegram.
 * Нужно, чтобы клиент не смотрел лишние секунды на спиннер брони.
 */
export function notifyTelegram(text: string): void {
  void sendTelegramMessage(text);
}

export interface BookingNotification {
  name: string;
  company: string;
  email: string;
  phone: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  totalCost: number;
  role?: string;
  participants?: number;
  modules?: string[];
}

/** Текст уведомления о новой брони встречи. */
export function formatBookingMessage(b: BookingNotification): string {
  const lines = [
    "🗓 <b>Новая заявка на встречу</b>",
    "",
    `<b>Когда:</b> ${escapeHtml(b.date)} в ${escapeHtml(b.time)}`,
    `<b>Компания:</b> ${escapeHtml(b.company)}`,
    `<b>Контакт:</b> ${escapeHtml(b.name)}`,
    `<b>Телефон:</b> ${escapeHtml(b.phone)}`,
    `<b>Почта:</b> ${escapeHtml(b.email)}`,
  ];

  if (b.role) lines.push(`<b>Роль:</b> ${escapeHtml(b.role)}`);
  if (b.participants) lines.push(`<b>Участников:</b> ${b.participants}`);
  if (b.totalCost > 0) lines.push(`<b>Расчёт:</b> ${formatMoney(b.totalCost)} BYN`);
  if (b.modules?.length) lines.push(`<b>Модули:</b> ${escapeHtml(b.modules.join(", "))}`);

  const site = process.env.NEXT_PUBLIC_SITE_URL ?? "https://vibemind.by";
  lines.push("", `<a href="${site}/admin">Открыть в админке</a>`);

  return lines.join("\n");
}

export interface DiagnosticNotification {
  companyName: string;
  userRole: string;
  participantCount: number;
  matchScore: number;
  totalCost?: number;
}

/**
 * Текст уведомления о новой карте диагностики. Короче, чем о брони:
 * такие события случаются чаще, и большинство из них до встречи не дойдёт.
 */
export function formatDiagnosticMessage(d: DiagnosticNotification): string {
  const parts = [
    "📋 <b>Кто-то прошёл диагностику</b>",
    "",
    `<b>Компания:</b> ${escapeHtml(d.companyName)}`,
    `<b>Роль:</b> ${escapeHtml(d.userRole)}`,
  ];
  if (d.participantCount) parts.push(`<b>Участников:</b> ${d.participantCount}`);
  if (d.matchScore) parts.push(`<b>Соответствие задачам:</b> ${d.matchScore}%`);
  if (d.totalCost) parts.push(`<b>Расчёт:</b> ${formatMoney(d.totalCost)} BYN`);
  parts.push("", "<i>Встреча пока не забронирована.</i>");
  return parts.join("\n");
}

/** Уведомлять ли о картах диагностики (по умолчанию — да). */
export function diagnosticsNotifyEnabled(): boolean {
  const flag = (process.env.TELEGRAM_NOTIFY_DIAGNOSTICS ?? "on").toLowerCase();
  return flag !== "off" && flag !== "0" && flag !== "false";
}
