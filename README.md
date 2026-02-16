# TV Promotions (React + Vite)

Одностраничное приложение, которое запрашивает активные акции и скидки для магазина по эндпоинту `GET /api/tv/promotions` (https://njt25.naliv.kz) и выводит их на экране.

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
```

3) Запустите dev-сервер:

```bash
npm run dev
```

Откройте адрес из консоли (по умолчанию http://localhost:5173).

## Что внутри

- React + TypeScript + Vite
- Запрос к `/api/tv/promotions` с заголовком `Authorization: Bearer <token>`
- Состояния загрузки, ошибки, пустого ответа и отображение карточек акций

## Команды

- `npm run dev` — запуск dev-сервера
- `npm run build` — production-сборка
- `npm run preview` — предпросмотр собранной версии
- `npm run lint` — проверка lint
