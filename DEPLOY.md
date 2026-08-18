# Деплой ВайбМайнд — подробная инструкция

Прод: **https://vibemind.by** — VPS (Ubuntu 24.04), Next.js за nginx с HTTPS.

> 🔑 **Пароль вводить не нужно.** Вход на сервер настроен по SSH-ключу
> `~/.ssh/vibemind_deploy`. Пароль root лежит в `DEPLOY_SECRETS.local.md`
> (файл в `.gitignore`, в репозиторий не попадает) и нужен только для аварийного
> восстановления доступа — см. раздел «Если пропал ключ».

---

## 1. Обычный релиз — один шаг

Выберите любой удобный способ. Все три делают одно и то же.

**Способ А — двойной клик (самый простой).**
В папке проекта откройте файл **`Деплой.bat`** двойным кликом. Откроется окно,
всё выполнится само, в конце появится «ГОТОВО! Сайт обновлён».

**Способ Б — из терминала проекта:**

```bash
npm run deploy
```

**Способ В — если код уже запушен и надо просто пересобрать прод:**

```bash
npm run deploy -- --skip-push
```

### Что произойдёт автоматически

| Шаг | Что делает | Время |
|---|---|---|
| 1 | Проверяет, что нет незакоммиченных правок, и пушит `main` на GitHub | ~5 сек |
| 2 | Ждёт доступности SSH (порт 22 иногда придушен провайдером) | 0–10 мин |
| 3 | На сервере: `git reset --hard origin/main` — код обновляется до `main` | ~5 сек |
| 4 | `npm ci` — ставит зависимости | ~40 сек |
| 5 | `npx prisma generate` + `npx prisma db push` — обновляет клиент и **создаёт новые таблицы**, если менялась схема | ~5 сек |
| 6 | `npm run build` — прод-сборка Next.js | 3–5 мин |
| 7 | `chown appuser` + `systemctl restart ai-salesperson` — перезапуск сервиса | ~10 сек |
| 8 | Проверяет `/`, `/course`, `/app`, `/admin` — все должны ответить `200` | ~3 сек |

Если всё хорошо, в конце будет:

```
    / → 200
    /course → 200
    /app → 200
    /admin → 200
Готово. Сайт обновлён: https://vibemind.by
```

> ⚠️ **Не закрывайте окно во время сборки.** На сервере 1 vCPU / 1 ГБ RAM,
> шаг `npm run build` идёт 3–5 минут — это нормально.

---

## 2. Если что-то пошло не так

Скрипт возвращает понятный код ошибки:

| Код | Сообщение | Что делать |
|---|---|---|
| 1 | Есть незакоммиченные изменения / нет ключа | Закоммитьте правки (`git add -A && git commit -m "..."`), либо см. «Если пропал ключ» |
| 2 | Сервер не отвечает по SSH | Провайдер придушил порт 22 после частых подключений. **Подождите 10 минут и запустите снова.** Сайт при этом продолжает работать |
| 3 | Деплой упал на сервере | Посмотрите логи (ниже) |
| 4 | Сайт отвечает не 200 | Посмотрите логи, при необходимости перезапустите сервис |

**Посмотреть логи приложения:**

```bash
ssh -i ~/.ssh/vibemind_deploy root@81.177.214.84 "journalctl -u ai-salesperson -n 50 --no-pager"
```

**Перезапустить сервис вручную:**

```bash
ssh -i ~/.ssh/vibemind_deploy root@81.177.214.84 "systemctl restart ai-salesperson && systemctl is-active ai-salesperson"
```

> ⚠️ **Про порт 22.** Провайдер временно блокирует SSH после нескольких быстрых
> подключений подряд. Не долбите повторно — подождите 5–10 минут и подключитесь
> один раз. Веб-сайт (порты 80/443) работает всегда, независимо от SSH.

---

## 3. Что где на сервере

| Параметр | Значение |
|---|---|
| IP | `81.177.214.84` |
| Домен (HTTPS) | `https://vibemind.by` — канонический адрес. `www.vibemind.by` и старый `81-177-214-84.nip.io` отдают 301 на него. DNS домена ведёт hoster.by (A-записи на `81.177.214.84`) |
| Каталог приложения | `/opt/ai-salesperson` |
| Сервисный пользователь | `appuser` |
| systemd-сервис | `ai-salesperson` (Next.js на порту 3100) |
| Веб-сервер | nginx (80 → 443 редирект, проксирует на `127.0.0.1:3100`) |
| TLS-сертификат | Let's Encrypt, автопродление через `certbot.timer` |
| База данных | SQLite `/opt/ai-salesperson/prod.db` |
| Репозиторий | https://github.com/ivanovich1071/AI-Salesperson |

---

## 4. Переменные окружения (`/opt/ai-salesperson/.env`)

Не в git, живут только на сервере. Ключевые:

```env
OPENROUTER_API_KEY=...            # ключ OpenRouter
OPENROUTER_MODEL=qwen/qwen3-235b-a22b-2507
OPENROUTER_WHISPER_MODEL=openai/whisper-large-v3   # голосовой ввод
DATABASE_URL=file:./prod.db
ADMIN_USER=admin
ADMIN_PASSWORD=demo2026
ADMIN_SESSION_SECRET=...          # случайная строка
NEXT_PUBLIC_SITE_URL=https://vibemind.by
```

После правки `.env` нужен перезапуск сервиса (команда в разделе 2).

> ℹ️ **Про голосовой ввод.** Модель `openai/whisper-large-v3` работает через
> OpenRouter, но её нет в каталоге `/api/v1/models` (там только chat-модели) —
> это нормально. Важно: Whisper **не декодирует webm/opus**, поэтому фронтенд
> конвертирует запись микрофона в **WAV 16 кГц моно** (`src/lib/audioWav.ts`)
> перед отправкой. Не убирайте эту конвертацию — иначе модель «слышит тишину»
> и возвращает галлюцинации вида «Продолжение следует…».

---

## 5. Слоты календаря встреч

```bash
ssh -i ~/.ssh/vibemind_deploy root@81.177.214.84 "cd /opt/ai-salesperson && node scripts/seed-current-month.mjs"
```

Автообновление 1-го числа каждого месяца настроено через cron (`crontab -l` от root).

---

## 6. Если пропал ключ (аварийное восстановление доступа)

Нужно, только если деплой пишет «Нет ключа деплоя» или сервер перестал пускать.

1. Создать новый ключ (в Git Bash), **без пароля** — просто жмите Enter:
   ```bash
   ssh-keygen -t ed25519 -f ~/.ssh/vibemind_deploy -N "" -C "vibemind-deploy"
   ```
2. Загрузить его на сервер — **вот здесь один раз спросит пароль root**
   (он в `DEPLOY_SECRETS.local.md`):
   ```bash
   ssh-copy-id -i ~/.ssh/vibemind_deploy.pub root@81.177.214.84
   ```
   Если `ssh-copy-id` нет:
   ```bash
   cat ~/.ssh/vibemind_deploy.pub | ssh root@81.177.214.84 "mkdir -p ~/.ssh && chmod 700 ~/.ssh && cat >> ~/.ssh/authorized_keys && chmod 600 ~/.ssh/authorized_keys"
   ```
3. Проверить, что пароль больше не нужен:
   ```bash
   ssh -i ~/.ssh/vibemind_deploy root@81.177.214.84 "echo ok"
   ```

> 💡 При вводе пароля в терминале символы **не отображаются** — это нормально,
> просто наберите и нажмите Enter.

---

## 7. Первичная установка (только для нового сервера с нуля)

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
9. nginx: `location / { proxy_pass http://127.0.0.1:3100; … }`, `server_name` = домен.
10. HTTPS: `apt install -y certbot python3-certbot-nginx && certbot --nginx -d <домен> --agree-tos -m <email> --redirect`

---

## 8. Безопасность (рекомендуется)

- **Сменить пароль root**: `passwd root` на сервере. Пароль несколько раз
  передавался в переписке; вход по ключу уже работает, поэтому смена пароля
  ничего не сломает. После смены обновите `DEPLOY_SECRETS.local.md`.
- Отключить парольную аутентификацию SSH (после проверки, что ключ работает):
  в `/etc/ssh/sshd_config` → `PasswordAuthentication no`, затем `systemctl restart ssh`.
- Включить `ufw`: `ufw allow OpenSSH && ufw allow 80,443/tcp && ufw enable`.
  ⚠️ Делать через VNC-консоль панели хостинга, а не по SSH, чтобы не потерять доступ.
