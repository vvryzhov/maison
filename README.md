# Maison Valery

Luxury e-commerce starter: витрина, каталог, карточка товара, корзина и локальная админка.

## Быстрый старт (Docker)

На сервере с установленными Docker и Docker Compose:

```bash
git clone https://github.com/vvryzhov/maison.git
cd maison
cp .env.example .env   # при необходимости измените HTTP_PORT
docker compose up -d --build
```

Сайт будет доступен на `http://<IP-сервера>:8080` (порт настраивается в `.env`).

Остановка:

```bash
docker compose down
```

Обновление после изменений в коде:

```bash
git pull
docker compose up -d --build
```

## Локальная разработка

```bash
npm install
npm run dev
```

## Сборка без Docker

```bash
npm install
npm run build
npm run preview
```

## Админка

Откройте `/#/admin`.

Демо-доступ:

- login: `admin`
- password: `valery2026`

Данные хранятся в `localStorage`, чтобы проект можно было сразу залить в Git и показать как рабочий прототип. Для продакшена нужно заменить localStorage на backend/CMS: Strapi, Directus, Medusa, Shopify Hydrogen или собственный API.

## Что внутри

- главная страница в стиле quiet luxury;
- каталог товаров;
- карточка товара;
- корзина;
- админка: товары, заказы, настройки магазина;
- адаптивная верстка;
- изображения Валерии в `public/images`.

## Структура деплоя

| Файл | Назначение |
|------|------------|
| `Dockerfile` | multi-stage сборка: Node.js → nginx |
| `docker-compose.yml` | запуск контейнера на сервере |
| `nginx.conf` | раздача статики, gzip, кэш |
| `.env.example` | пример переменных окружения |
