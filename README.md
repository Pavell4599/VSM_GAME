БЭКЭНД
cd Backend

# Создаём виртуальное окружение
python -m venv venv

# Активируем (Windows)
venv\Scripts\activate
# Или (macOS/Linux)
source venv/bin/activate

# Устанавливаем зависимости
pip install -r requirements.txt

# Применяем миграции БД
python manage.py migrate

# Запускаем сервер
python manage.py runserver


ФРОНТЕНД
cd Frontend

# Устанавливаем зависимости
npm install

# Запускаем dev-сервер
npm run dev


