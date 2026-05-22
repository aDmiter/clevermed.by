# Деплой Clevermed на Beget (виртуальный хостинг)

Проект — **Next.js 16** с API, NextAuth и **MySQL**. На стандартном хостинге Beget приложение запускается через **Apache mod_passenger** и **Node.js** (см. [инструкцию Beget](https://beget.com/ru/kb/how-to/web-apps/node-js)).

> **Важно:** обычный PHP-хостинг без Node.js не подойдёт. Нужен тариф с SSH и возможностью Node.js в Docker (`ssh localhost -p 222`).

## Что понадобится

1. Аккаунт Beget, сайт и домен (например `clevermed.by`) в панели → **Сайты**.
2. База **MySQL** в панели → **MySQL** (запомните имя БД, пользователя, пароль).
3. SSH-доступ (PuTTY / терминал / веб-консоль в панели).

## 1. Node.js в Docker

```bash
ssh LOGIN@LOGIN.beget.tech
ssh localhost -p 222
cat /etc/os-release   # Ubuntu 22.04+ — ставьте Node 20–24 с nodejs.org
```

Установка Node в `~/.local` (кратко, полная версия — в KB Beget):

```bash
mkdir -p ~/.local && cd ~/.local
wget https://nodejs.org/dist/v24.15.0/node-v24.15.0-linux-x64.tar.xz
tar xf node-v24.15.0-linux-x64.tar.xz --strip 1
node -v && npm -v
```

Откройте **общий доступ** к `~/.local` для веб-сервера (статья Beget про Docker и изоляцию сайтов).

## 2. Код проекта

В каталоге сайта (например `~/clevermed.by`):

```bash
cd ~
git clone https://github.com/aDmiter/clevermed.by.git clevermed.by
cd clevermed.by
```

Или загрузите архив через SFTP в ту же папку.

## 3. Переменные окружения

```bash
cp deploy/beget/env.production.example .env
nano .env
```

| Переменная | Значение |
|------------|----------|
| `DATABASE_URL` | `mysql://USER:PASS@localhost:3306/DBNAME` из панели MySQL |
| `AUTH_SECRET` | случайная строка (`openssl rand -base64 32`) |
| `AUTH_URL` | `https://ваш-домен.by` (без слэша в конце) |
| `ADMIN_*` | логин/пароль суперадмина для seed |

## 4. Сборка и БД

```bash
cd ~/clevermed.by
npm ci
chmod +x scripts/beget-db-setup.sh
./scripts/beget-db-setup.sh
npm run build
```

Если `npm run build` падает по памяти — соберите локально на ПК и залейте по SFTP папки `.next`, `node_modules` (тяжело) или увеличьте лимиты / соберите на VPS Beget.

## 5. Passenger (.htaccess)

В **корне проекта** (там же, где `server.js`):

```bash
cp deploy/beget/.htaccess.example .htaccess
nano .htaccess
```

Подставьте реальные пути, например:

```
PassengerNodejs /home/u/mylogin/.local/bin/node
PassengerAppRoot /home/u/mylogin/clevermed.by
PassengerAppType node
PassengerStartupFile server.js
PassengerAppEnv production
```

Проверка пути к node: `which node` (в Docker).

## 6. public_html и перезапуск

```bash
cd ~/clevermed.by
rm -rf ~/public_html
ln -s ~/clevermed.by/public ~/public_html
mkdir -p tmp && touch tmp/restart.txt
```

Статика (`/images`, favicon) отдаётся из `public/`. Динамика и API — через Passenger → `server.js`.

Перезапуск после обновлений:

```bash
touch tmp/restart.txt
```

## 7. Проверка

- Сайт: `https://ваш-домен.by`
- Админка: `https://ваш-домен.by/admin/login`
- Если 500 — логи в панели Beget / `passenger.log` в каталоге сайта.

Сброс пароля админа на сервере:

```bash
npm run auth:reset-admin
```

## 8. Обновление с GitHub

```bash
cd ~/clevermed.by
git pull
npm ci
npm run build
touch tmp/restart.txt
```

При изменении схемы БД — при необходимости снова `npm run db:apply-analytics` и т.д. (см. `package.json`).

## Альтернатива: VPS Beget с Node.js + PM2

Если на shared не хватает RAM для сборки Next.js, возьмите **облачный VPS** с образом Node.js ([маркетплейс Beget](https://beget.com/ru/cloud/marketplace/nodejs)):

```bash
su - nodejs
cd /var/www/html
git clone https://github.com/aDmiter/clevermed.by.git .
npm ci && npm run build
# .env как выше
pm2 start npm --name clevermed -- start
pm2 save
```

Порт в nginx (`/etc/nginx/sites-available/nodejs.conf`) — по умолчанию 3000; в `package.json` `start` использует `-p 3002` — на VPS смените на `3000` или поправьте proxy.

## Частые проблемы

| Симптом | Решение |
|---------|---------|
| 502 / приложение не стартует | Проверьте `.htaccess`, `which node`, `tmp/restart.txt` |
| Ошибка БД | `DATABASE_URL`, доступ MySQL с `localhost` |
| Редиректы login в цикл | `AUTH_URL` = точный HTTPS-URL сайта |
| `P3014` при migrate | Используйте `npm run db:apply-rbac` (как в README) |
