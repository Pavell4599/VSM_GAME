# VSM_GAME: Игровое обучающее приложение для проводников ВСМ-400

![Python](https://img.shields.io/badge/Python-3.11-blue)
![Django](https://img.shields.io/badge/Django-4.2.7-darkgreen)
![Node.js](https://img.shields.io/badge/Node.js-20-green)
![Docker](https://img.shields.io/badge/Docker-Supported-2496ED)

## 🎯 Описание

Интерактивная геймифицированная виртуальная среда для подготовки проводников высокоскоростных магистралей к работе в условиях стресса, дефицита времени и нештатных ситуаций.

**Стек технологий:**
- **Backend:** Django 4.2 + Django REST Framework + SQLite
- **Frontend:** Phaser 4 + React + Vite
- **Контейнеризация:** Docker + Docker Compose
- **БД:** SQLite (встроенная в приложение)

---

## 📋 Требования

### Для локального запуска (без Docker):
- Python 3.11+
- Node.js 20+
- npm или yarn

### Для запуска в Docker:
- Docker 20.10+
- Docker Compose 2.0+

---

## 🚀 Быстрый старт

### Вариант 1: Docker (Рекомендуется для хакатона)

#### 1. Клонирование репозитория
```bash
git clone <repository-url>
cd VSM_GAME
```

#### 2. Запуск с Docker Compose
```bash
# Загрузить изображения и запустить контейнеры
docker compose up --build

# Или в режиме разработки с горячей перезагрузкой
docker compose watch
```

Приложение будет доступно по адресам:
- **Frontend:** http://localhost:8080
- **Backend (Admin):** http://localhost:8000/admin

#### 3. Остановка контейнеров
```bash
docker compose down
```

---

### Вариант 2: Локальный запуск

#### Backend (в новом терминале):
```bash
cd Backend
python -m venv venv

# Windows PowerShell:
venv\Scripts\activate
# или macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt
python manage.py migrate
python manage.py loaddata data_fixtures.json
python manage.py runserver
```

#### Frontend (в новом терминале):
```bash
cd Frontend
npm install
npm run dev
```

---

## 🐳 Docker Compose структура

### Сервисы:

**Backend (Django API)**
- Порт: `8000`
- Образ: `python:3.11-slim` (многоступенчатая сборка)
- БД: SQLite (`db.sqlite3`)
- Hot-reload: Включен через volume mounting

**Frontend (Phaser/React)**
- Порт: `8080`
- Образ: `node:20-alpine`
- Сборщик: Vite
- Hot-reload: Включен через volume mounting

### Точки подключения API:
```
Frontend → Backend: http://backend:8000
Локально: http://localhost:8000
```

---

## 📊 Демонстрационные данные

При старте приложение автоматически загружает демо-данные из файла `Backend/data_fixtures.json`:

1. **Типовые сценарии:**
   - Конфликты между пассажирами в вагоне
   - Медицинские инциденты на скорости 400 км/ч
   - Сервисные кейсы премиального уровня обслуживания

2. **Игровые механики:**
   - Нелинейный движок (сюжет зависит от ответов)
   - Двойная шкала (Лояльность + Рейтинг безопасности)
   - Тайм-лимит для критических решений
   - Система достижений (ачивок)

3. **Все данные анонимизированы** в соответствии с требованиями 152-ФЗ

---

## 🏗️ Структура проекта

```
VSM_GAME/
├── Backend/                    # Django приложение
│   ├── config/                # Настройки Django
│   │   ├── settings.py        # Основные настройки
│   │   ├── urls.py            # Маршруты API
│   │   └── wsgi.py
│   ├── game/                  # Логика игры
│   ├── scenarios/             # Сценарии и кейсы
│   ├── users/                 # Профили проводников
│   ├── manage.py              # Django CLI
│   ├── requirements.txt        # Python зависимости
│   ├── Dockerfile             # Multi-stage сборка
│   └── data_fixtures.json     # Демо-данные
│
├── Frontend/                  # React + Phaser приложение
│   ├── src/                   # Исходный код React
│   ├── public/                # Статические файлы
│   ├── vite/                  # Конфиг Vite (dev & prod)
│   ├── package.json           # npm зависимости
│   ├── Dockerfile             # Alpine-based сборка
│   └── index.html
│
├── docker-compose.yml         # Оркестрация контейнеров
├── .dockerignore               # Исключения для Docker
├── .env.example               # Шаблон переменных окружения
└── README.md                  # Этот файл
```

---

## 🔧 Конфигурация

### Переменные окружения

Создайте файл `.env` в корневой директории (скопируйте из `.env.example`):

```bash
# Django
DEBUG=True
SECRET_KEY=your-secret-key-here
DJANGO_SETTINGS_MODULE=config.settings

# API
CORS_ALLOWED_ORIGINS=http://localhost:8080

# AI Model (опционально, если используется vLLM)
AI_MODEL_URL=http://ai-model:8000/v1/chat/completions
AI_MODEL_NAME=LadiesMan69/Qwen2.5-NPC-passenger

# Frontend
VITE_API_URL=http://backend:8000
VITE_ENV=development
```

### Настройка для продакшена

Перед развертыванием измените в `Backend/config/settings.py`:

```python
DEBUG = False
SECRET_KEY = 'your-strong-random-key'
ALLOWED_HOSTS = ['your-domain.com']
CORS_ALLOWED_ORIGINS = ['https://your-domain.com']
```

---

## 🧪 Тестирование

### Проверка Backend API
```bash
# Вход в контейнер backend
docker compose exec backend bash

# Проверка миграций
python manage.py migrate --check

# Запуск тестов
python manage.py test
```

### Проверка Frontend
```bash
# Вход в контейнер frontend
docker compose exec frontend bash

# Проверка сборки
npm run build
```

---

## 📦 Сборка для продакшена

### Подготовка Docker образов

```bash
# Сборка с оптимизацией размера
docker compose build --no-cache

# Проверка размеров
docker images | grep vsm_game

# Frontend: ~200MB (Node 20-alpine base)
# Backend: ~450MB (Python 3.11-slim base)
```

### Публикация на Docker Registry

```bash
# Тег образов
docker tag vsm_game-backend:latest your-registry/vsm-backend:1.0
docker tag vsm_game-frontend:latest your-registry/vsm-frontend:1.0

# Push на регистр
docker push your-registry/vsm-backend:1.0
docker push your-registry/vsm-frontend:1.0
```

---

## 🔐 Безопасность

⚠️ **Для разработки:** SECRET_KEY и CORS настройки разрешают все источники.

### Перед продакшеном:

1. **Установите стойкий SECRET_KEY:**
   ```python
   from django.core.management.utils import get_random_secret_key
   print(get_random_secret_key())
   ```

2. **Ограничьте CORS:**
   ```python
   CORS_ALLOWED_ORIGINS = ['https://yourdomain.com']
   ```

3. **Включите HTTPS**

4. **Установите правильные права доступа** для БД и медиа-файлов

5. **Используйте PostgreSQL** вместо SQLite в продакшене

---

## 🛠️ Отладка

### Просмотр логов контейнеров

```bash
# Backend логи
docker compose logs -f backend

# Frontend логи
docker compose logs -f frontend

# Все логи
docker compose logs -f
```

### Подключение к контейнерам

```bash
# Backend shell
docker compose exec backend bash

# Frontend shell
docker compose exec frontend bash

# Django shell
docker compose exec backend python manage.py shell
```

### Проверка сети

```bash
# Список контейнеров
docker compose ps

# Сетевые подключения
docker network inspect vsm_game_default
```

---

## 📚 API Документация

### Основные endpoints:

**Пользователи:**
- `POST /api/users/register/` — Регистрация
- `POST /api/users/login/` — Вход
- `GET /api/users/profile/` — Профиль пользователя

**Сценарии:**
- `GET /api/scenarios/` — Список сценариев
- `GET /api/scenarios/{id}/` — Сценарий с деталями

**Игра:**
- `POST /api/game/start/` — Начать игру
- `POST /api/game/choice/` — Выбор в диалоге
- `GET /api/game/results/` — Результаты сессии

**Полная документация:** http://localhost:8000/api/schema/ (после включения)

---

## 🎮 Как играть

1. **Вход в приложение** (http://localhost:8080)
2. **Создание профиля** проводника
3. **Выбор сценария** из доступных кейсов
4. **Взаимодействие** с пассажирами через диалоги
5. **Оценка решений** по двум шкалам:
   - **Лояльность пассажира** (0-100%)
   - **Рейтинг безопасности** (0-100%)
6. **Получение достижений** и лидерборд

---

## 🚢 Развертывание

### На Kubernetes
```bash
# Создание ConfigMap из .env
kubectl create configmap vsm-config --from-file=.env

# Применение манифестов
kubectl apply -f k8s/
```

### На Docker Swarm
```bash
# Инициализация Swarm
docker swarm init

# Развертывание стека
docker stack deploy -c docker-compose.yml vsm_game
```

---

## 🐛 Известные проблемы и решения

| Проблема | Решение |
|----------|---------|
| Port 8000 занят | `docker compose down` и `docker ps -a` |
| Ошибка миграции БД | `docker compose exec backend python manage.py migrate --force` |
| Frontend не загружается | Проверьте `docker compose logs -f frontend` |
| API не отвечает | Убедитесь, что `backend` контейнер запущен |

---

## 📞 Контакты и поддержка

**Проект создан для:** Хакатон Московского Транспорта

**Команда разработки:**
- Backend: Django/Python
- Frontend: React/Phaser
- DevOps: Docker/Docker Compose

---

## 📄 Лицензия

MIT License — см. LICENSE файл для деталей

---

## 🔄 Обновления и версионирование

- **v1.0.0** - Первая версия для хакатона
  - Django backend с REST API
  - React + Phaser frontend
  - Docker контейнеризация
  - Демо-данные и сценарии

---

## 💡 Советы для хакатона

✅ **DO:**
- Используйте `docker compose up --build` для полной пересборки
- Проверяйте логи перед отправкой (`docker compose logs`)
- Тестируйте в Docker перед финальной сдачей
- Используйте `docker compose down -v` для очистки всех данных

❌ **DON'T:**
- Не коммитьте `.env` файл с реальными ключами
- Не меняйте `docker-compose.yml` прямо перед сдачей
- Не забывайте про CORS при развертывании
- Не используйте SQLite для многопользовательского продакшена

---

**Успехов на хакатоне! 🚀**
