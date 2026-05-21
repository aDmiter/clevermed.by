# Clevermed

Web-приложение медицинского центра Clevermed (неврология и диагностика) на Next.js 16.

Подробная документация для разработчиков и AI-агентов: **[AGENTS.md](./AGENTS.md)**.

## Быстрый старт

```bash
cp .env.example .env
# Укажите DATABASE_URL (MySQL), AUTH_SECRET и AUTH_URL=http://localhost:3002

npm install
npm run db:migrate
npm run db:seed
npm run dev
```

- Сайт: http://localhost:3002  
- Админка: http://localhost:3002/admin/login  
