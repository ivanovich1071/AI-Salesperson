#!/usr/bin/env bash
# ---------------------------------------------------------------------------
# Серверная часть деплоя. Запускается из scripts/deploy-entry.sh уже после
# обновления кода — отдельно не вызывать.
#
# Все шаги идемпотентны: повтор после обрыва SSH безопасен.
# ---------------------------------------------------------------------------
set -euo pipefail

APPDIR=/opt/ai-salesperson
cd "$APPDIR"

npm ci
npx prisma generate
npx prisma db push --skip-generate    # создает новые таблицы, если схема менялась
node scripts/seed-lab.mjs             # стартовые карточки — только в пустую таблицу

# Фото карточек из админки: вне git, переживают git reset
mkdir -p data/uploads/lab

npm run build
chown -R appuser:appuser "$APPDIR"

# Вход для ключа GitHub Actions — всегда свежая копия из репозитория
install -m 755 scripts/deploy-entry.sh /usr/local/bin/vibemind-deploy

systemctl restart ai-salesperson

# Сервис поднимается несколько секунд — ждем ответа, а не фиксированную паузу
for i in $(seq 1 30); do
  if curl -s -o /dev/null -m 3 http://127.0.0.1:3100/robots.txt; then break; fi
  sleep 1
done
systemctl is-active ai-salesperson

FAIL=0
for p in / /solutions /course /app /admin; do
  code=$(curl -s -o /dev/null -m 20 -w '%{http_code}' "http://127.0.0.1:3100$p")
  echo "    $p → $code"
  [ "$code" = "200" ] || FAIL=1
done
if [ "$FAIL" != "0" ]; then
  echo "Сайт отвечает не на всех страницах: journalctl -u ai-salesperson -n 50" >&2
  exit 4
fi
echo "    деплой на сервере завершен"
