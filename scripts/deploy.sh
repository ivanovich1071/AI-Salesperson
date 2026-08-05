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

# --- 1. Деплой одним соединением, с повторами ----------------------------
# Провайдер придушивает порт 22 после частых подключений, поэтому НЕ тратим
# отдельный коннект на пинг: сразу пробуем боевой деплой и повторяем при обрыве.
# Все шаги идемпотентны (reset --hard, npm ci, build), повтор безопасен.
REMOTE_CMD="
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
"

DONE=""
for i in 1 2 3 4 5; do
  info "Разворачиваем на сервере (3–6 минут), попытка $i из 5"
  if ssh $SSH_OPTS -o ConnectTimeout=30 -o ServerAliveInterval=30 -o ServerAliveCountMax=10 \
       "$HOST" "$REMOTE_CMD"; then
    DONE=1; break
  fi
  if [ "$i" -lt 5 ]; then
    echo "    не достучались (вероятно, порт 22 придушен) — ждём 3 мин"
    sleep 180
  fi
done
if [ -z "$DONE" ]; then
  red "Деплой не прошёл: сервер не пускает по SSH."
  red "Подождите 10 минут и запустите снова. Сайт при этом продолжает работать."
  red "Логи: ssh -i \$HOME/.ssh/vibemind_deploy root@81.177.214.84 'journalctl -u ai-salesperson -n 50 --no-pager'"
  exit 3
fi

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
