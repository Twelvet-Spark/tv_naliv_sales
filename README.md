# TV Promotions (React + Vite)

Одностраничное приложение, которое запрашивает активные Акции для магазина по эндпоинту `GET /api/tv/promotions` (https://njt25.naliv.kz) и выводит их на ТВ-экране.

## Быстрый старт

1) Установите зависимости:

```bash
npm install
```

2) Добавьте токен бизнеса в `.env.local` или введите его на странице `/token`:

```bash
VITE_TV_BUSINESS_TOKEN=<ваш_токен>
# опционально: если базовый URL отличается
# VITE_TV_API_URL=https://njt25.naliv.kz
# опционально: уровень клиентских логов (debug|info|warn|error)
# VITE_TV_LOG_LEVEL=info
# опционально: staged rollout для расширенного UI слоя (true|false)
# VITE_TV_RICH_UI=true
```

3) Запустите dev-сервер:

```bash
npm run dev
```

Откройте адрес из консоли (по умолчанию http://localhost:5173).

## Что внутри

- React + TypeScript + Vite
- Запрос к `/api/tv/promotions` с заголовком `Authorization: Bearer <token>`
- Состояния загрузки, ошибки, пустого ответа, офлайн-режима и отображение карточек Акций
- Автообновление данных каждые 90 секунд
- Кэш последних успешно загруженных Акций в localStorage для кратких сбоев сети
- Ограничение кэша: до 5 токенов, автоочистка старых записей (ретеншн 30 дней)
- Режим устаревших данных: при сбое сети показывается предупреждение до 12 часов, затем включается полноэкранный офлайн-статус
- TV-ориентированный интерфейс с увеличенной типографикой и высоким контрастом
- Встроенная клиентская телеметрия синхронизации (настраивается через `VITE_TV_LOG_LEVEL`)

## Развертывание

- Для продакшена (включая Coolify) используйте `npm run build` и раздачу каталога `dist` через Caddy/Nginx.
- На каждом ТВ откройте домен приложения, перейдите на `/token` и введите бизнес-токен на устройстве.

### Docker / Coolify

```bash
docker build -t naliv-tv-akcii .
docker run -p 8080:80 naliv-tv-akcii
```

- Базовые образы в Dockerfile закреплены на актуальных версиях (`node:22-alpine`, `caddy:2.9.1-alpine`).
- Для внешнего API укажите `VITE_TV_API_URL` на этапе сборки в переменных окружения Coolify.

## Команды

- `npm run dev` — запуск dev-сервера
- `npm run dev:tv` — запуск dev-сервера для доступа с ТВ в локальной сети
- `npm run build` — production-сборка
- `npm run preview` — предпросмотр собранной версии
- `npm run lint` — проверка lint
- `npm run verify` — полный базовый gate (`lint + build`)

## Контроль Качества

- Матрица ручной проверки: `docs/verification-matrix.md`
- Чеклист выпуска и отката: `docs/release-rollout-checklist.md`
- Шаблон релиз-нотов: `docs/release-notes-template.md`
