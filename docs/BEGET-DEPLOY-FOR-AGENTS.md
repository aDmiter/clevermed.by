# Деплой Node/Next.js на Beget — инструкция для агента

Документ для копирования в другой проект (Cursor rule или первое сообщение в чате).  
Референс рабочего деплоя: репозиторий [webo.by](https://github.com/aDmiter/webo.by).

---

## О владельце

- **Не разработчик.** Объяснять коротко, по одному шагу.
- **Формат деплоя (обязательно):**
  1. **Залей** — список файлов и папок (пути от корня проекта) → куда на сервере.
  2. **В терминале Beget** — один готовый блок команд (веб-терминал [cp.beget.com](https://cp.beget.com)), без Git/rsync/VS Code, пока сам не попросит.
- **Терминал:** предпочитать **веб-терминал панели Beget**. SSH из Windows PowerShell у пользователя часто обрывается.
- Для тяжёлой сборки на Beget иногда нужен Docker из веб-терминала: `ssh localhost -p 222`.

---

## Параметры: WEBO.by (уже на проде)

| Параметр | Значение |
|----------|----------|
| Домен | https://webo.by |
| Папка на сервере | `~/webo.by/webo-by/` |
| Node в PATH | `~/webo.by/webo-by/.node/bin` |
| `.htaccess` Passenger | `~/webo.by/.htaccess` |
| MySQL БД / пользователь | `admite_weboreact` |
| Пароль БД | только в `.env` на сервере (не в Git) |

**Деплой WEBO:**

```bash
export PATH=~/webo.by/webo-by/.node/bin:$PATH
cd ~/webo.by/webo-by
npm run build
mkdir -p tmp && touch tmp/restart.txt
```

Добавить `npx prisma db push` только если менялся `prisma/schema.prisma`.  
**Не запускать** `npm run db:seed` на проде без явной просьбы (затирает данные/админа).

---

## Параметры: Clevermed.by

| Параметр | Значение |
|----------|----------|
| Домен | https://clevermed.by |
| Папка на сервере | `~/clevermed.by/clevermed-by/` |
| Node в PATH | `~/clevermed.by/clevermed-by/.node/bin` |
| Минимум Node | **20.19+** (Prisma 7.8; `20.18.x` — ошибка при `npm install`) |
| `.htaccess` Passenger | `~/clevermed.by/.htaccess` |
| MySQL БД | `admite_clevereac` |
| MySQL пользователь | `admite_clevereac` |
| MySQL хост | `localhost` |
| Пароль БД | только в `.env` на сервере (не в Git, не в этот файл) |

**Путь на диске Beget** (для `.htaccess`, логин `admite`):

`/home/a/admite/clevermed.by/clevermed-by`

### `.env` на сервере (`~/clevermed.by/clevermed-by/.env`)

Пароль задать в панели Beget. Если в пароле есть символ `%`, в `DATABASE_URL` его кодировать как `%25`.

```env
DATABASE_URL="mysql://admite_clevereac:ПАРОЛЬ_С_ПАНЕЛИ@localhost:3306/admite_clevereac"
```

Остальные переменные — по README проекта clevermed-by (`ADMIN_*`, JWT secret и т.д.).

### Файл `.htaccess` — куда положить (важно)

Без этого файла сайт даёт **403 Forbidden**.

**Содержимое** — скопировать из `deploy/clevermed.by.htaccess` в репозитории (или блок ниже).

**Куда:** в панели Beget → **Сайты** → **clevermed.by** → **Файловый менеджер**.

1. Откройте папку сайта `clevermed.by` (не заходя в `clevermed-by`).
2. Рядом с папками `clevermed-by` и `public_html` создайте файл **`.htaccess`**.
3. Вставьте содержимое, сохраните.

Если 403 остаётся — **скопируйте тот же файл** в `clevermed.by/public_html/.htaccess`.

Путь на диске: `/home/a/admite/clevermed.by/.htaccess`

```apache
PassengerNodejs /home/a/admite/clevermed.by/clevermed-by/.node/bin/node
PassengerAppRoot /home/a/admite/clevermed.by/clevermed-by
PassengerAppType node
PassengerStartupFile server.js
PassengerAppEnv production
SetEnv HOSTNAME 127.0.0.1
```

**Через терминал Beget** (если удобнее):

```bash
cat > ~/clevermed.by/.htaccess << 'EOF'
PassengerNodejs /home/a/admite/clevermed.by/clevermed-by/.node/bin/node
PassengerAppRoot /home/a/admite/clevermed.by/clevermed-by
PassengerAppType node
PassengerStartupFile server.js
PassengerAppEnv production
SetEnv HOSTNAME 127.0.0.1
EOF
mkdir -p ~/clevermed.by/clevermed-by/tmp
touch ~/clevermed.by/clevermed-by/tmp/restart.txt
```

**Node 20.18 не подходит.** Если `node -v` показывает `v20.18.x`, обновите (один раз):

```bash
cd ~/clevermed.by/clevermed-by
chmod +x scripts/beget-install-node.sh
./scripts/beget-install-node.sh
export PATH=~/clevermed.by/clevermed-by/.node/bin:$PATH
node -v
```

Должно быть `v20.19.1` или выше (можно `NODE_VERSION=24.15.0 ./scripts/beget-install-node.sh`).

**Деплой Clevermed (первый раз или после смены зависимостей):**

```bash
export PATH=~/clevermed.by/clevermed-by/.node/bin:$PATH
cd ~/clevermed.by/clevermed-by
rm -rf node_modules
npm install
npm run build
npx prisma db push
mkdir -p tmp && touch tmp/restart.txt
```

**Обычное обновление** (без `package.json` / без схемы Prisma):

```bash
export PATH=~/clevermed.by/clevermed-by/.node/bin:$PATH
cd ~/clevermed.by/clevermed-by
npm run build
mkdir -p tmp && touch tmp/restart.txt
```

---

## Что никогда не заливать

- `node_modules/`
- `.next/`
- `.env` (с компьютера)
- `.git/`, `.cursor/`

`.env` создаётся **только на сервере** в корне приложения.

---

## Проверенная схема: Next.js + Apache Passenger

Виртуальный хостинг Beget (не VPS). Успешно на **webo.by** (Next.js 16, Prisma, MySQL).

### 1. `next.config` — standalone

```ts
output: "standalone",
experimental: { cpus: 1 },
```

Если Prisma — `outputFileTracingIncludes` для `@prisma/client` и `.prisma` (см. `next.config.ts` в webo.by).

### 2. Сборка

`package.json`:

```json
"build": "prisma generate && next build && node scripts/beget-postbuild.mjs"
```

`scripts/beget-postbuild.mjs` после `next build` копирует в `.next/standalone/`:

- `.next/static` → `standalone/.next/static`
- `public/` → `standalone/public/`
- `prisma/` (если есть)
- `node_modules/.prisma` (если есть)

### 3. `server.js` в корне проекта

- `dotenv` из корня проекта
- `NODE_ENV=production`, `HOSTNAME=127.0.0.1`
- запуск `.next/standalone/server.js`
- для Passenger: патч `listen` → `"passenger"`; `PhusionPassenger.configure({ autoInstall: false })`
- отладка: `server-minimal.js` + временно `PassengerStartupFile server-minimal.js`

Скопировать паттерн из webo.by: `server.js`, `server-minimal.js`.

### 4. Node на Beget

Установить Node в **`проект/.node/bin`**, не полагаться на `~/.local/bin/node` (Passenger часто не видит).

Прописать путь в `.htaccess` и в `export PATH=...` перед `npm`.

### 5. Перезапуск

```bash
mkdir -p tmp
mkdir -p tmp && touch tmp/restart.txt
```

---

## Первый деплой (чеклист)

1. Сайт/домен в панели Beget.
2. Залить исходники (без `node_modules`, `.next`, `.env`).
3. MySQL: создать БД, записать логин/пароль.
4. На сервере создать `.env`.
5. Node в `.node/bin`, настроить `.htaccess`.
6. `npm install` → `npm run build` → при Prisma `npx prisma db push` → `mkdir -p tmp && touch tmp/restart.txt`.
7. Проверить сайт; при 500 — логи панели / `tmp/passenger.log`.

---

## Шаблон инструкции пользователю (каждое обновление)

**Залей** в `~/ПУТЬ/К/ПРОЕКТУ/`:

- *(агент перечисляет только изменённые файлы)*

**В терминале Beget:**

```bash
export PATH=~/ПУТЬ/К/ПРОЕКТУ/.node/bin:$PATH
cd ~/ПУТЬ/К/ПРОЕКТУ
# npx prisma db push   # только если менялся prisma/schema.prisma
npm run build
mkdir -p tmp && touch tmp/restart.txt
```

`npm install` — только если менялся `package.json` / lockfile.

---

## Типичные ошибки

| Симптом | Причина | Решение |
|--------|---------|---------|
| Passenger не стартует | Node из `~/.local` | `проект/.node/bin` в `.htaccess` |
| 500, пустая страница | нет standalone/static | `beget-postbuild.mjs`, полный `npm run build` |
| Prisma на бою | нет engine в standalone | postbuild + tracing includes |
| Ошибка БД | `%` или `&` в пароле URL | URL-encode в `DATABASE_URL` |
| Сброс контента | `db:seed` на проде | не запускать без явной просьбы |
| Сборка падает | мало RAM | `experimental.cpus: 1` |
| `Prisma only supports Node.js 20.19+` | Node 20.18 в `.node` | `./scripts/beget-install-node.sh`, затем `rm -rf node_modules && npm install` |
| `EBADENGINE` Prisma | то же | обновить Node, не игнорировать |
| Passenger «something went wrong» | нет сборки / нет `.env` / ошибка старта | `./scripts/beget-diagnose.sh`, смотреть `tmp/passenger.log` |

---

## Если проект не Next.js

- **Статика:** в `public_html`, без Passenger.
- **Другой Node:** свой `server.js` + `listen('passenger')`.
- **PHP и т.д.:** другая схема.

Сначала уточнить стек, БД, нужна ли сборка `npm run build`.

---

## Файлы в репозитории (clevermed-by = webo.by)

| Файл | Назначение |
|------|------------|
| `server.js` | Passenger + standalone |
| `server-minimal.js` | проверка Passenger («clevermed ok») |
| `scripts/beget-postbuild.mjs` | static/public/prisma + `app/generated` в standalone |
| `scripts/remote-build.sh` | сборка на сервере Clevermed |
| `scripts/beget-db-setup.sh` | первый запуск БД (локально/стейдж, не прод без согласия) |
| `deploy/beget.htaccess.example` | шаблон `~/clevermed.by/.htaccess` |
| `deploy/beget.rsync-exclude` | что не заливать |
| `deploy/beget/env.production.example` | шаблон `.env` |

---

## Задачи агента

1. Уточнить проект: домен, путь на Beget, стек, Prisma/MySQL.
2. Адаптировать `server.js`, `.htaccess`, postbuild под проект.
3. Не коммитить и не заливать `.env` и пароли.
4. После правок — формат **«Залей» + «В терминале Beget»**.
5. Не предлагать `db:seed` на проде без явного запроса.
