# Запуск проекта локально
cd Backend
python -m venv venv
# Powershell
venv\Scripts\activate 
# Bash
source venv/bin/activate 
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
cd Frontend
npm install
npm run dev

После успешного запуска:
- **Фронтенд**: http://localhost:5173
- **Бэкенд (API)**: http://localhost:8000




## Запуск проекта через Docker
docker-compose up --build

После успешного запуска:
- **Фронтенд**: http://localhost:5173
- **Бэкенд (API)**: http://localhost:8000


