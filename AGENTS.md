# AGENTS.md — Clevermed

Документация для AI-агентов и разработчиков проекта медицинского центра **Clevermed** (неврология и диагностика, Беларусь).

## 1. Описание проекта

Полнофункциональное web-приложение с:

- **Публичным сайтом** — OrganiTech-дизайн: спокойствие, glassmorphism, мягкий neumorphism, русскоязычный контент.
- **Админ-панелью** (`/admin`) — управление услугами, ценами, врачами, отзывами и статическим контентом (после подключения CRUD-экранов).

Концепция **«Адаптивный Орга-тек» (OrganiTech)** — высокотехнологичный минимализм, стерильная прозрачность, восстанавливающее спокойствие природы.

## 2. Стек технологий

| Технология | Версия (на момент инициализации) |
|------------|----------------------------------|
| Next.js (App Router) | 16.1.6 |
| React | 19.2.3 |
| TypeScript | ^5 |
| MySQL | 8+ (рекомендуется) |
| Prisma | 7.8.0 |
| Tailwind CSS | 4.x |
| shadcn/ui | base-nova |
| Motion | 12.x (`motion/react`) |
| NextAuth.js | 5.0.0-beta |
| Lucide React | иконки |

## 3. Архитектура папок

```
clevermed-by/
├── app/
│   ├── (site)/              # Публичный сайт (route group, URL без префикса)
│   │   ├── layout.tsx       # Header + Footer
│   │   ├── page.tsx         # Главная
│   │   ├── services/
│   │   ├── prices/
│   │   ├── doctors/
│   │   ├── about/
│   │   ├── reviews/
│   │   └── contacts/
│   ├── admin/
│   │   ├── login/           # Вход (без sidebar)
│   │   └── (dashboard)/     # Защищённая зона CMS
│   ├── api/auth/[...nextauth]/
│   ├── generated/prisma/    # Сгенерированный Prisma Client (gitignored)
│   ├── globals.css
│   └── layout.tsx           # Root: шрифт, lang=ru, metadata
├── components/
│   ├── site/                # UI публичных страниц (часто 'use client')
│   ├── admin/               # (зарезервировано)
│   ├── ui/                  # shadcn/ui
│   └── providers/
├── lib/
│   ├── prisma.ts            # Singleton PrismaClient
│   └── utils.ts             # cn() для классов
├── styles/blocks/           # BEM-блоки (hero, trust-strip)
├── prisma/
│   ├── schema.prisma
│   ├── seed.ts
│   └── migrations/
├── auth.ts                  # NextAuth конфигурация
├── middleware.ts            # Защита /admin/*
├── AGENTS.md
└── .env.example
```

## 4. Дизайн: OrganiTech

### Палитра (строго)

| Токен | HEX | Назначение |
|-------|-----|------------|
| `primary-green` | `#016143` | CTA, активная навигация |
| `primary-dark` | `#0A1F1A` | Основной текст |
| `secondary-mint` | `#E6F4EF` | Фоны секций |
| `accent-warmth` | `#E07A5F` | Редкие акценты, экстренные пометки |
| `neutral-bg` | `#F8F9FA` | Фон секций |
| `neutral-border` | `#E9ECEF` | Границы |

### Glassmorphism

```css
background: rgba(255, 255, 255, 0.6);
backdrop-filter: blur(15px);
border: 1px solid rgba(255, 255, 255, 0.8);
```

В Tailwind: `bg-white/60 backdrop-blur-[15px] border border-white/80`.

### BEM vs Tailwind

- **Tailwind + shadcn/ui** — кнопки, формы админки, утилитарная вёрстка.
- **BEM** (`styles/blocks/*.css`) — кастомные блоки: `.hero`, `.hero__bg`, `.trust-strip__track`. Импорт в `app/globals.css`.

### Типографика

Plus Jakarta Sans (`app/layout.tsx`), поддержка кириллицы.

## 5. Принципы разработки

### TypeScript

- Строгий режим включён.
- Публичные props компонентов — явные типы (`DoctorCard`, `ContactData`).
- Серверные страницы по возможности остаются Server Components; интерактив — `'use client'`.

### Именование

- Файлы компонентов: `kebab-case.tsx` (`home-page.tsx`).
- React-компоненты: `PascalCase`.
- Prisma-модели: `PascalCase`, поля `camelCase`.
- Slug услуг/врачей: `kebab-case` в БД.

### Изображения

`next/image` с `remotePatterns` для Unsplash в `next.config.ts`. В продакшене — URL из БД или `/public`.

### Аутентификация и RBAC

- Вход: **логин или email** + пароль (`/admin/login`). Без обхода через `.env` в production.
- **Суперадминистратор** (`SUPER_ADMIN`) — полный доступ ко всем разделам.
- **Администратор** (`ADMIN`) — доступ по матрице прав `UserPermission` (просмотр / изменение на раздел).
- Разделы прав: `DASHBOARD`, `SERVICES`, `DOCTORS`, `ONLINE_BOOKINGS`, `APPOINTMENTS`, `SETTINGS`, `SEO`, `REVIEWS`, `CONTENT`, `USERS`.
- Управление пользователями: `/admin/users` (только при праве `USERS` + write; назначать `SUPER_ADMIN` может только суперадмин).
- Безопасность входа: bcrypt (12 раундов), блокировка после 5 ошибок (15 мин), rate-limit по IP, аудит `LoginAttempt`, единое сообщение об ошибке, timing-safe сравнение пароля.
- Код: `lib/auth/rbac.ts`, `lib/auth/password.ts`, `lib/auth/login-security.ts`, `lib/auth/require-permission.ts`.
- JWT-сессия 8 ч, обновление каждый час. Проверка прав в `middleware` + `requirePermission()` в server actions.

## 6. Развёртывание и локальный запуск

### Требования

- Node.js 20+
- MySQL 8+

### Шаги

```bash
cp .env.example .env
```

Заполните:

```env
DATABASE_URL="mysql://USER:PASSWORD@localhost:3306/clevermed"
AUTH_SECRET="..."   # openssl rand -base64 32
AUTH_URL="http://localhost:3002"
ADMIN_LOGIN=superadmin
ADMIN_EMAIL=admin@clevermed.by
ADMIN_PASSWORD=ChangeMe!Secure2026
```

**Prisma 7 + MySQL:** клиент создаётся через `@prisma/adapter-mariadb` в `lib/prisma.ts` (адаптер парсит `DATABASE_URL`). После `npm install` выполняется `prisma generate` (`postinstall`).

```bash
npm install
npm run db:apply-rbac # RBAC без shadow DB (локально, если migrate dev падает P3014)
npm run db:seed
# db:migrate — только если есть SHADOW_DATABASE_URL или права CREATE DATABASE
npm run dev
```

Продакшен:

```bash
npm run build
npm run start
```

## 7. Схема базы данных (Prisma)

### PageSeo

SEO для публичных страниц: `path` (ключ, напр. `/`, `/services/nevrologiya`), `title`, `description`. Админка: `/admin/seo`.

### User / UserPermission / LoginAttempt

`User`: `login`, `email`, `firstName`, `lastName`, `passwordHash`, `role` (SUPER_ADMIN | ADMIN), `isActive`, `failedLoginAttempts`, `lockedUntil`, `lastLoginAt`.

`UserPermission`: `section`, `canRead`, `canWrite` (на пользователя).

`LoginAttempt`: аудит попыток входа (`login`, `ip`, `success`).

### ServiceCategory / Service

Категории прайса (`ServiceCategory`: `name`, `sortOrder`) и услуги (`Service`: `categoryId`, `title`, `amount`, `currency`, `sortOrder`). Админка: `/admin/services` — каталог с drag-n-drop, редактирование на месте.

### Price

Привязка к `Service`: `title`, `amount`, `currency`, `includes` (JSON-массив строк), `sortOrder`.

### Doctor

`slug`, `lastName`, `firstName`, `middleName`, `name` (полное ФИО), `medicalCategory`, `specialty` (направление), `education`, `bio`, `imageUrl`, `experience`, `achievements` (JSON), `sortOrder`, `published`. Фото — `public/images/doctors/`, админка: `/admin/doctors`.

### Review

`authorName`, `text`, `rating`, `status` (PENDING | APPROVED | REJECTED), `videoUrl`, `featured`.

### Partner

Полоса доверия на главной: `name`, `logoUrl`, `sortOrder`.

### AboutContent

Singleton `id: "default"`: `missionQuote`, `timeline` (JSON).

### ContactInfo

Singleton `id: "default"`: `address`, `phone`, `email`, `hours` (JSON), `mapLat`, `mapLng`.

### AppointmentDuration / DoctorAvailabilityDay

**Настройки сайта** (`/admin/settings`): длительности приёма (`AppointmentDuration`: 25, 50 мин). Привязка к услугам — в `/admin/services` (`ServiceCategory.durationId`).

**Дни приёма врача** (кнопка «Дни приёма» в `/admin/doctors`): выбор дат в календаре, окна работы (например 8–13 и 14–18), длительность слота → автогенерация `AvailabilitySlot`.

**Запись** (`Appointment`): `categoryId`, `slotId`, пациент, `source` ONLINE|PHONE. Публично: `/booking` (врач → услуга из каталога → дата → слот).

## 8. Статус реализации

| Область | Статус |
|---------|--------|
| Инициализация Next.js 16 | ✅ |
| Дизайн-токены OrganiTech | ✅ |
| Главная, Услуги (аккордеон + ЭНМГ), Врачи, Контакты | ✅ по макету |
| Цены, О нас, Отзывы (публичные) | 🔲 заглушки |
| Админ: вход, дашборд, навигация | ✅ |
| Админ: CRUD врачей | ✅ |
| Админ: запись на приём (календарь, CRUD) | ✅ |
| Публичная онлайн-запись (`/booking`) | ✅ |
| Админ: каталог услуг | ✅ |
| Админ: SEO / Meta (title, description) | ✅ |
| Админ: CRUD (остальное) | 🔲 заглушки |
| Данные из БД на публичных страницах | 🔲 частично (врачи — из БД) |

## 9. Правила для AI-агентов

1. Не менять палитру OrganiTech без согласования.
2. Новые кастомные секции с устойчивой структурой — BEM в `styles/blocks/`.
3. Не использовать `document.createElement` для стилей — только CSS/Tailwind.
4. Весь пользовательский контент сайта — на **русском**.
5. Публичный контент должен управляться из админки (при добавлении фич — через Prisma).
6. Не коммитить `.env` и секреты.
7. После изменения `schema.prisma` — `npm run db:migrate` и обновить этот файл при новых моделях.
