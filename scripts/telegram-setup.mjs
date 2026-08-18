// Настройка уведомлений в Telegram: проверка токена, поиск chat_id, тестовое сообщение.
//
// Запуск:
//   node scripts/telegram-setup.mjs          — проверить бота и показать найденные чаты
//   node scripts/telegram-setup.mjs --test   — плюс отправить тестовое сообщение
//
// Токен читается из .env (TELEGRAM_BOT_TOKEN). chat_id находится по последним
// сообщениям бота: поэтому перед запуском нужно написать боту «привет» в личку
// или добавить его в группу и написать туда.

import { readFileSync } from "node:fs";

/** Минимальный разбор .env: нам нужна одна переменная, тащить dotenv незачем. */
function readEnv(name) {
  if (process.env[name]) return process.env[name];
  try {
    const text = readFileSync(new URL("../.env", import.meta.url), "utf8");
    for (const line of text.split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (m && m[1] === name) return m[2].replace(/^["']|["']$/g, "");
    }
  } catch {
    /* .env может отсутствовать — это не ошибка */
  }
  return undefined;
}

const token = readEnv("TELEGRAM_BOT_TOKEN");
if (!token) {
  console.error(
    "Не найден TELEGRAM_BOT_TOKEN.\n" +
      "1. Напишите @BotFather в Telegram, команда /newbot, придумайте имя.\n" +
      "2. Скопируйте выданный токен в .env строкой TELEGRAM_BOT_TOKEN=...\n" +
      "3. Запустите этот скрипт снова."
  );
  process.exit(1);
}

async function api(method, body) {
  const res = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body ?? {}),
  });
  const data = await res.json();
  if (!data.ok) throw new Error(`${method}: ${data.description}`);
  return data.result;
}

const me = await api("getMe");
console.log(`Бот на связи: @${me.username} (${me.first_name})`);

const updates = await api("getUpdates", { limit: 50 });
const chats = new Map();
for (const u of updates) {
  const msg = u.message ?? u.channel_post ?? u.my_chat_member;
  if (msg?.chat) chats.set(String(msg.chat.id), msg.chat);
}

if (chats.size === 0) {
  console.log(
    "\nЧаты не найдены. Откройте бота в Telegram, нажмите «Запустить» (/start)\n" +
      "и напишите ему любое сообщение — потом запустите скрипт ещё раз.\n" +
      "Для группы: добавьте бота в группу и напишите там любое сообщение."
  );
  process.exit(0);
}

console.log("\nНайденные чаты (значение для TELEGRAM_CHAT_ID):");
for (const [id, chat] of chats) {
  const title = chat.title ?? [chat.first_name, chat.last_name].filter(Boolean).join(" ");
  console.log(`  ${id}  — ${chat.type}: ${title ?? "без названия"}`);
}
console.log("\nНесколько получателей перечисляются через запятую.");

if (process.argv.includes("--test")) {
  const target = readEnv("TELEGRAM_CHAT_ID") || [...chats.keys()][0];
  for (const chatId of String(target).split(",").map((s) => s.trim()).filter(Boolean)) {
    await api("sendMessage", {
      chat_id: chatId,
      text:
        "✅ <b>ВайбМайнд</b>: уведомления подключены.\n\n" +
        "Сюда будут приходить новые заявки на встречу и пройденные диагностики.",
      parse_mode: "HTML",
    });
    console.log(`Тестовое сообщение отправлено в чат ${chatId}.`);
  }
}
