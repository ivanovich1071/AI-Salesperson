# Инструкция по деплою на сервер

Прод развёрнут на VPS (Ubuntu 24.04) за nginx с HTTPS.

> 🔐 **Доступы (пароль root, SSH-ключ) — в файле `DEPLOY_SECRETS.local.md`**, он в
> `.gitignore` и в репозиторий НЕ попадает (репозиторий публичный). Если файла нет —
> см. раздел «Доступы» ниже.

## 1. Что где на сервере

| Параметр | Значение |
|---|---|
| IP | `81.177.214.84` |
| Домен (HTTPS) | `https://81-177-214-84.nip.io` |
| Каталог приложения | `/opt/ai-salesperson` |
| Сервисный пользователь | `appuser` |
| systemd-сервис | `ai-salesperson` (Next.js на порту 3100) |
| Веб-сервер | nginx (80 → 443 редирект, проксирует на 127.0.0.1:3100) |
| TLS-сертификат | Let's Encrypt (автопродление через `certbot.timer`) |
| База данных | SQLite `/opt/ai-salesperson/prod.db` |
| Репозиторий | https://github.com/ivanovich1071/AI-Salesperson |

## 2. Подключение по SSH

```bash
ssh root@81.177.214.84
```

Пароль — в `DEPLOY_SECRETS.local.md`. Рекомендуется вход по SSH-ключу (см. там же).

> ⚠️ Провайдер иногда временно блокирует порт 22 после нескольких быстрых подключений
> подряд. Если `ssh` завис — не долбите повторно, подождите 5–10 минут и подключитесь один
> раз. Веб-сайт (порты 80/443) при этом работает всегда.

## 3. Обновление прода (обычный релиз)

После `git push` в `main` выполнить на сервере:

```bash
cd /opt/ai-salesperson
git config --global --add safe.directory /opt/ai-salesperson   # один раз
git fetch origin main && git reset --hard origin/main
npm ci
npx prisma generate
npm run build
chown -R appuser:appuser /opt/ai-salesperson
systemctl restart ai-salesperson
```

Проверка:

```bash
systemctl is-active ai-salesperson
curl -s -o /dev/null -w "%{http_code}\n" https://81-177-214-84.nip.io/
```

> На сервере 1 vCPU / 1 ГБ RAM — `npm run build` идёт 3–5 минут. Есть swap 2.5 ГБ.
> Долгие шаги лучше запускать в фоне: `setsid nohup bash -c '…' > /root/deploy.log 2>&1 &`,
> чтобы обрыв SSH не прервал сборку; следить через `tail -f /root/deploy.log`.

## 4. Переменные окружения (`/opt/ai-salesperson/.env`)

Не в git. Ключевые:

```env
OPENROUTER_API_KEY=...            # ключ OpenRouter
OPENROUTER_MODEL=qwen/qwen3-235b-a22b-2507
OPENROUTER_WHISPER_MODEL=openai/whisper-large-v3
DATABASE_URL=file:./prod.db
ADMIN_USER=admin
ADMIN_PASSWORD=demo2026
ADMIN_SESSION_SECRET=...          # случайная строка
NEXT_PUBLIC_SITE_URL=https://81-177-214-84.nip.io
```

После правки `.env` → `systemctl restart ai-salesperson`.

## 5. Слоты календаря встреч

```bash
cd /opt/ai-salesperson
node scripts/seed-slots.mjs 2026-09-01 2026-09-30   # слоты на диапазон
node scripts/seed-current-month.mjs                 # текущий месяц + чистка прошедших
```

Автообновление 1-го числа каждого месяца настроено через cron (`crontab -l` от root).

## 6. Полезные команды

```bash
journalctl -u ai-salesperson -n 100 --no-pager   # логи приложения
systemctl restart ai-salesperson                 # перезапуск
nginx -t && systemctl reload nginx               # проверка/перезагрузка nginx
certbot certificates                             # статус TLS-сертификата
```

## 7. Первичная установка (если ставить с нуля на новый сервер)

1. `apt update && apt install -y curl git nginx ufw`
2. Node.js 20: `curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && apt install -y nodejs`
3. Swap 2 ГБ (при 1 ГБ RAM): `fallocate -l 2G /swapfile2 && chmod 600 /swapfile2 && mkswap /swapfile2 && swapon /swapfile2 && echo '/swapfile2 none swap sw 0 0' >> /etc/fstab`
4. `useradd -r -m -d /opt/ai-salesperson -s /usr/sbin/nologin appuser`
5. `git clone https://github.com/ivanovich1071/AI-Salesperson /opt/ai-salesperson`
6. Создать `/opt/ai-salesperson/.env` (см. раздел 4).
7. `cd /opt/ai-salesperson && npm ci && npx prisma generate && npx prisma db push && npm run build`
8. systemd-сервис `/etc/systemd/system/ai-salesperson.service`:
   ```ini
   [Unit]
   Description=AI Salesperson (Next.js)
   After=network.target
   [Service]
   Type=simple
   User=appuser
   WorkingDirectory=/opt/ai-salesperson
   ExecStart=/usr/bin/npm run start
   Restart=always
   Environment=NODE_ENV=production
   [Install]
   WantedBy=multi-user.target
   ```
   `systemctl daemon-reload && systemctl enable --now ai-salesperson`
9. nginx: проксировать `location / { proxy_pass http://127.0.0.1:3100; … }`, `server_name` = домен.
10. HTTPS: `apt install -y certbot python3-certbot-nginx && certbot --nginx -d <домен> --agree-tos -m <email> --redirect`

## 8. Безопасность (рекомендуется)

- Сменить пароль root: `passwd root` (текущий пароль несколько раз звучал в переписке).
- Перейти на вход по SSH-ключу и отключить парольную аутентификацию.
- Включить `ufw`: `ufw allow OpenSSH && ufw allow 80,443/tcp && ufw enable`
  (сейчас выключен). ⚠️ Делать через VNC-консоль панели, а не по SSH, чтобы не потерять доступ.
