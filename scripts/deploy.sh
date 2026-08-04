#!/usr/bin/env bash
# ---------------------------------------------------------------------------
# Деплой ВайбМайнд на прод одной командой (без пароля — вход по SSH-ключу).
#
#   npm run deploy            — обычный релиз
#   npm run deploy -- --skip-push   — не пушить, задеплоить то, что уже в origin/main
#
# Что делает: пушит main → ждёт порт 22 → на сервере обновляет код, ставит
# зависимости, применяет схему БД, собирает, перезапускает сервис и проверяет сайт.
# Подробности и разбор ошибок — в DEPLOY.md.
# ---------------------------------------------------------------------------
set -u

HOST="root@81.177.214.84"
SITE="https://81-177-214-84.nip.io"
APPDIR="/opt/ai-salesperson"
KEY="$HOME/.ssh/vibemind_deploy"
SSH_OPTS="-i $KEY -o IdentitiesOnly=yes -o BatchMode=yes -o StrictHostKeyChecking=accept-new"

red()  { printf '\033[31m%s\033[0m\n' "$*"; }
grn()  { printf '\033[32m%s\033[0m\n' "$*"; }
info() { printf '\033[36m==> %s\033[0m\n' "$*"; }

# --- 0. Проверки перед стартом -------------------------------------------
if [ ! -f "$KEY" ]; then
  red "Нет ключа деплоя: $KEY"
  red "Восстановить доступ: см. раздел «Если пропал ключ» в DEPLOY.md"
  exit 1
fi
chmod 600 "$KEY" 2>/dev/null || true

if [ "${1:-}" != "--skip-push" ]; then
  if [ -n "$(git status --porcelain)" ]; then
    red "Есть незакоммиченные изменения — сначала закоммитьте их:"
    git status --short
    exit 1
  fi
  info "Пушим main на GitHub"
  git push origin main || { red "git push не прошёл"; exit 1; }
fi

# --- 1. Ждём доступности SSH (провайдер иногда придушивает порт 22) -------
info "Проверяем связь с сервером"
OPEN=""
for i in 1 2 3 4 5 6; do
  if ssh $SSH_OPTS -o ConnectTimeout=25 "$HOST" 'echo ok' 2>/dev/null | grep -q ok; then
    OPEN=1; break
  fi
  echo "    порт 22 занят/закрыт — ждём 2 мин (попытка $i из 6)"
  sleep 120
done
if [ -z "$OPEN" ]; then
  red "Сервер не отвечает по SSH. Сайт при этом обычно работает."
  red "Подождите 10 минут и запустите деплой снова (см. DEPLOY.md, раздел «Порт 22»)."
  exit 2
fi

# --- 2. Деплой одним соединением (build долгий — держим сессию) ----------
info "Разворачиваем на сервере (3–6 минут)"
ssh $SSH_OPTS -o ConnectTimeout=30 -o ServerAliveInterval=30 -o ServerAliveCountMax=10 "$HOST" "
  set -e
  cd $APPDIR
  git config --global --add safe.directory $APPDIR 2>/dev/null || true
  git fetch origin main -q && git reset --hard origin/main
  echo \"    версия: \$(git rev-parse --short HEAD) \$(git log -1 --pretty=%s)\"
  npm ci
  npx prisma generate
  npx prisma db push --skip-generate    # создаёт новые таблицы, если схема менялась
  npm run build
  chown -R appuser:appuser $APPDIR
  systemctl restart ai-salesperson
  sleep 4
  systemctl is-active ai-salesperson
" || { red "Деплой упал. Логи: ssh $HOST 'journalctl -u ai-salesperson -n 50 --no-pager'"; exit 3; }

# --- 3. Проверяем, что сайт живой ----------------------------------------
info "Проверяем сайт"
FAIL=0
for p in / /course /app /admin; do
  code=$(curl -s -o /dev/null -w '%{http_code}' "$SITE$p")
  if [ "$code" = "200" ]; then grn "    $p → $code"; else red "    $p → $code"; FAIL=1; fi
done

if [ "$FAIL" = "0" ]; then
  grn ""
  grn "Готово. Сайт обновлён: $SITE"
else
  red "Сайт отвечает не на всех страницах — проверьте логи (см. DEPLOY.md)."
  exit 4
fi
