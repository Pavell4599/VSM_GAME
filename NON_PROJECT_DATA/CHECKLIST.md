# ✅ Контрольный список для хакатона МОСКОВСКОГО ТРАНСПОРТА

## Подготовка к сдаче

### 📦 Docker & Контейнеризация
- [x] Dockerfile для Backend (multi-stage, Python 3.11-slim)
- [x] Dockerfile для Frontend (Node 20-alpine)
- [x] docker-compose.yml с обоими сервисами
- [x] .dockerignore файлы для оптимизации
- [x] requirements.txt с актуальными зависимостями
- [x] Проверка успешной сборки: `docker compose build`
- [x] Проверка запуска: `docker compose up`

### 📋 Конфигурация
- [x] .env.example файл с примерами переменных
- [x] Настройки Django (config/settings.py)
- [x] CORS, DEBUG и SECRET_KEY для разработки
- [x] Правильные миграции БД

### 📚 Документация
- [x] DOCKER_README.md с подробными инструкциями
- [x] Описание структуры проекта
- [x] Инструкции по запуску (Docker и локально)
- [x] API Endpoints документация
- [x] Раздел для продакшена (безопасность, оптимизация)

### 🧪 Тестирование
- [x] Backend запускается на http://localhost:8000
- [x] Frontend запускается на http://localhost:8080
- [x] Миграции применяются успешно
- [x] Контейнеры коммуницируют друг с другом
- [x] Volume mounting работает (hot-reload)

### 🔧 Оптимизация
- [x] Multi-stage builds для уменьшения размера
- [x] Слои Docker кэшируются эффективно
- [x] Минимальные base images (slim, alpine)
- [x] .dockerignore исключает ненужные файлы

### 📁 Структура репозитория
```
VSM_GAME/
├── Backend/
│   ├── Dockerfile              ✅
│   ├── .dockerignore           ✅
│   ├── requirements.txt        ✅
│   ├── config/
│   │   ├── settings.py         ✅
│   │   ├── urls.py
│   │   └── wsgi.py
│   ├── game/
│   ├── scenarios/
│   ├── users/
│   └── manage.py
├── Frontend/
│   ├── Dockerfile              ✅
│   ├── .dockerignore           ✅
│   ├── package.json            ✅
│   ├── src/
│   ├── public/
│   └── vite/
├── docker-compose.yml          ✅
├── .dockerignore                ✅
├── .env.example                ✅
├── DOCKER_README.md            ✅
├── setup-docker.sh             ✅
├── setup-docker.bat            ✅
└── README.md
```

## Инструкции для жюри

### Быстрый старт (60 секунд)

```bash
# 1. Клонировать репозиторий
git clone <repository-url>
cd VSM_GAME

# 2. Запустить Docker Compose
docker compose up --build

# 3. Открыть в браузере
# Frontend:  http://localhost:8080
# Backend:   http://localhost:8000
```

### Требуемое окружение
- Docker 20.10+ (вместе с Docker Desktop)
- Docker Compose 2.0+
- Браузер (Chrome, Firefox, Safari)
- Интернет (для загрузки образов при первом запуске)

### Проверка готовности
```bash
# Проверить статус контейнеров
docker compose ps

# Ожидаемый результат:
# NAME              STATUS
# vsm-backend       Up (healthy)
# vsm-frontend      Up
```

### Остановка и очистка
```bash
# Остановить контейнеры
docker compose down

# Полная очистка (включая volumes)
docker compose down -v

# Очистить все неиспользуемые образы
docker system prune -a
```

## Известные требования хакатона

### ✅ Требования к приложению
- [x] Приложение контейнеризировано
- [x] Можно запустить одной командой
- [x] Фронтенд доступен на http://localhost:8080
- [x] Бэкенд доступен на http://localhost:8000
- [x] БД инициализируется автоматически
- [x] Демо-данные загружаются (или готовы к загрузке)

### ✅ Требования к документации
- [x] README с инструкциями
- [x] Описание архитектуры
- [x] Инструкции по запуску
- [x] Описание стека технологий
- [x] Инструкции для продакшена

### ✅ Требования к безопасности
- [x] SECRET_KEY не закоммичен
- [x] CORS настроен (разработка: все источники, продакшен: конкретный домен)
- [x] DEBUG=True только в разработке
- [x] Нет hardcoded credentials

### ✅ Требования к производительности
- [x] Приложение запускается < 30 сек
- [x] Образы оптимизированы по размеру
- [x] Hot-reload работает в разработке
- [x] БД быстро инициализируется

## Потенциальные вопросы жюри

### "Как запустить приложение?"
```bash
docker compose up --build
Затем откройте http://localhost:8080
```

### "Как посмотреть логи?"
```bash
docker compose logs -f backend    # логи бэкенда
docker compose logs -f frontend   # логи фронтенда
```

### "Как попасть в контейнер?"
```bash
docker compose exec backend bash   # bash в бэкенде
docker compose exec frontend bash  # bash во фронтенде
```

### "Как изменить настройки?"
```bash
cp .env.example .env
# Отредактировать .env
docker compose restart
```

### "Почему медленно загружается?"
- Первый запуск скачивает образы (~500MB)
- Последующие запуски быстрые благодаря кэшу
- Volume mounting для фронтенда может быть медленнее на Windows

## Финальная проверка перед сдачей

```bash
# 1. Убедиться что всё закоммичено
git status
# Должно быть чисто

# 2. Пересоздать контейнеры с нуля
docker compose down -v
docker system prune -a
docker compose up --build

# 3. Проверить логи на ошибки
docker compose logs

# 4. Открыть http://localhost:8080 и http://localhost:8000

# 5. Остановить всё
docker compose down
```

---

**Статус:** ✅ Готово к сдаче

**Дата подготовки:** 2026-09-27

**Версия:** 1.0.0 для хакатона МОСКОВСКОГО ТРАНСПОРТА
