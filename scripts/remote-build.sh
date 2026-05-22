#!/usr/bin/env bash
set -euo pipefail

export PATH="${HOME}/clevermed.by/clevermed-by/.node/bin:${PATH:-}"
cd "${HOME}/clevermed.by/clevermed-by"

npm install
npm run build
mkdir -p tmp && touch tmp/restart.txt

echo "[remote-build] Готово: $(date -Iseconds)"
