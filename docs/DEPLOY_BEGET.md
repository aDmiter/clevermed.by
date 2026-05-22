# Деплой на Beget

**Главная инструкция (для вас и для агента):** [BEGET-DEPLOY-FOR-AGENTS.md](./BEGET-DEPLOY-FOR-AGENTS.md)

Там указаны пути Clevermed (`~/clevermed.by/clevermed-by/`), `.htaccess`, команды для веб-терминала и что не заливать на сервер.

## Файлы в репозитории

| Файл | Назначение |
|------|------------|
| `server.js` | Passenger + Next standalone |
| `server-minimal.js` | Проверка Passenger («clevermed ok») |
| `scripts/beget-postbuild.mjs` | Копирование static/public/prisma в standalone |
| `scripts/remote-build.sh` | Сборка на сервере |
| `deploy/beget.htaccess.example` | Шаблон для `~/clevermed.by/.htaccess` |
| `deploy/beget.rsync-exclude` | Исключения при загрузке файлов |

## Обычное обновление (веб-терминал Beget)

```bash
export PATH=~/clevermed.by/clevermed-by/.node/bin:$PATH
cd ~/clevermed.by/clevermed-by
npm run build
touch tmp/restart.txt
```

`npm install` — если менялся `package.json`.  
`npx prisma db push` — если менялся `prisma/schema.prisma`.  
**Не запускать** `npm run db:seed` на проде без явной просьбы.
