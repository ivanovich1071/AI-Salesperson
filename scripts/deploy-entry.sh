#!/usr/bin/env bash
# ---------------------------------------------------------------------------
# Вход в деплой на сервере: обновить код и запустить scripts/server-deploy.sh.
#
# Как вызывается:
#   - вручную: scripts/deploy.sh передает этот файл по SSH (`bash -s`);
#   - из GitHub Actions: ключ деплоя в authorized_keys ограничен командой
#     command="/usr/local/bin/vibemind-deploy" — копией этого файла, которую
#     server-deploy.sh обновляет при каждом деплое. Этим ключом можно только
#     запустить деплой, консоли сервера он не дает.
#
# Код обновляется ЗДЕСЬ, до запуска server-deploy.sh: bash читает скрипт по
# ходу выполнения, и перезапись файла посреди работы ломала бы его.
# ---------------------------------------------------------------------------
set -euo pipefail

APPDIR=/opt/ai-salesperson

# Два деплоя одновременно (ручной и из GitHub) не пускаем — второй ждет первого
exec 9>/var/lock/vibemind-deploy.lock
if ! flock -w 900 9; then
  echo "Другой деплой идет дольше 15 минут — прерываемся." >&2
  exit 5
fi

cd "$APPDIR"
git config --global --get-all safe.directory 2>/dev/null | grep -qx "$APPDIR" \
  || git config --global --add safe.directory "$APPDIR"
git fetch origin main -q
git reset --hard origin/main -q
echo "    версия: $(git rev-parse --short HEAD) $(git log -1 --pretty=%s)"

exec bash scripts/server-deploy.sh
