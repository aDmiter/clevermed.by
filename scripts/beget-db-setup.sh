#!/usr/bin/env bash
# Первичная настройка БД на Beget (без shadow DB)
set -euo pipefail

cd "$(dirname "$0")/.."

echo "→ prisma generate"
npx prisma generate

echo "→ RBAC migration"
npm run db:apply-rbac

echo "→ drop procedures (если ещё не применялась)"
npm run db:apply-drop-procedures 2>/dev/null || true

echo "→ analytics columns"
npm run db:apply-analytics 2>/dev/null || true

echo "→ seed"
npm run db:seed

echo "Готово. Проверьте вход: /admin/login"
