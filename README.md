# Clevermed

Web-приложение медицинского центра Clevermed (неврология и диагностика) на Next.js 16.

Подробная документация для разработчиков и AI-агентов: **[AGENTS.md](./AGENTS.md)**.

## Быстрый старт

```bash
cp .env.example .env
# Укажите DATABASE_URL (MySQL), AUTH_SECRET и AUTH_URL=http://localhost:3002

npm install
npm run db:apply-rbac
npm run db:seed
npm run dev
```

**Если `npm run db:migrate` падает с P3014 (shadow database):** у MySQL-пользователя нет права `CREATE DATABASE`. Варианты:

1. **Рекомендуется локально:** `npm run db:apply-rbac` затем `npm run db:seed`
2. Создать БД `clevermed_shadow` вручную и добавить `SHADOW_DATABASE_URL` в `.env`, затем `npm run db:migrate`
3. `npm run db:deploy` — если миграции уже ведутся через Prisma Migrate (без shadow)

- Сайт: http://localhost:3002  
- Админка: http://localhost:3002/admin/login  

## Деплой на Beget

Инструкция для загрузки и веб-терминала: **[docs/BEGET-DEPLOY-FOR-AGENTS.md](./docs/BEGET-DEPLOY-FOR-AGENTS.md)** (краткая ссылка: [DEPLOY_BEGET.md](./docs/DEPLOY_BEGET.md)).
