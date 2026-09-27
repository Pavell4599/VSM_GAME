# Используем легковесный образ Python
FROM python:3.11-slim

# Устанавливаем системные зависимости (опционально, если нужны для сборки некоторых пакетов)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Устанавливаем рабочую директорию внутри контейнера
WORKDIR /app

# Копируем и устанавливаем зависимости
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Копируем весь код бэкенда в контейнер
COPY . .

# Открываем порт, который использует Django по умолчанию
EXPOSE 8000

# Команда для применения миграций и запуска сервера
CMD ["sh", "-c", "python manage.py migrate && python manage.py runserver 0.0.0.0:8000"]
