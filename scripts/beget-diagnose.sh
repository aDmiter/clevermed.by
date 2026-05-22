#!/usr/bin/env bash
set -euo pipefail

APP="${HOME}/clevermed.by/clevermed-by"
export PATH="${APP}/.node/bin:${PATH:-}"
cd "$APP"

echo "=== Clevermed: диагностика Beget ==="
echo "node: $(node -v 2>/dev/null || echo НЕ НАЙДЕН)"
echo "pwd:  $(pwd)"
echo ""

check() {
  if [ -e "$1" ]; then
    echo "  OK   $1"
  else
    echo "  НЕТ  $1"
  fi
}

echo "Файлы:"
check ".env"
check ".node/bin/node"
check "server.js"
check ".next/standalone/server.js"
check ".next/standalone/.next/static"
check ".next/standalone/public"
check ".next/standalone/app/generated/prisma/client"
check "tmp/restart.txt"
check "../.htaccess"
echo ""

if [ -f .env ]; then
  echo ".env (без паролей):"
  grep -E '^(AUTH_URL|AUTH_SECRET|DATABASE_URL|NODE_ENV)=' .env \
    | sed 's/\(DATABASE_URL=mysql:\/\/[^:]*:\)[^@]*/\1***/' \
    | sed 's/\(AUTH_SECRET=\).*/\1***/' || true
  echo ""
fi

echo "Проверка запуска standalone (5 сек)..."
if [ -f .next/standalone/server.js ]; then
  cd .next/standalone
  timeout 5 env HOSTNAME=127.0.0.1 PORT=3999 node server.js 2>&1 | head -20 || true
  cd "$APP"
else
  echo "  Сначала: npm run build"
fi

echo ""
echo "Лог Passenger (если есть):"
[ -f tmp/passenger.log ] && tail -30 tmp/passenger.log || echo "  tmp/passenger.log пуст или нет"
