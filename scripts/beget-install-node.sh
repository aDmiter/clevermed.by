#!/usr/bin/env bash
# Node в clevermed-by/.node/bin (Prisma 7.8 требует >= 20.19)
set -euo pipefail

APP_DIR="${HOME}/clevermed.by/clevermed-by"
NODE_VERSION="${NODE_VERSION:-20.19.1}"
ARCH="linux-x64"
TARBALL="node-v${NODE_VERSION}-${ARCH}.tar.xz"
URL="https://nodejs.org/dist/v${NODE_VERSION}/${TARBALL}"

cd "$APP_DIR"
mkdir -p .node
cd .node

echo "→ Загрузка Node ${NODE_VERSION}..."
wget -q --show-progress "$URL" -O "$TARBALL"
echo "→ Распаковка в ${APP_DIR}/.node ..."
tar xf "$TARBALL" --strip 1
rm -f "$TARBALL"

export PATH="${APP_DIR}/.node/bin:${PATH:-}"
echo "→ Версия:"
node -v
npm -v
echo ""
echo "Готово. Дальше:"
echo "  export PATH=${APP_DIR}/.node/bin:\$PATH"
echo "  cd ${APP_DIR}"
echo "  rm -rf node_modules"
echo "  npm install"
