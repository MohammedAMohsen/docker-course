FROM python:latest

# لا تنشئ ملفات Python المؤقتة (ذات الامتداد pyc) داخل الحاوية.
ENV PYTHONDONTWRITEBYTECODE=1

# اطبع مخرجات Python وأخطاءها فوراً، حتى تظهر مباشرة في سجلات الحاوية.
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# نسخ ملف المكتبات وتثبيتها أولاً، للاستفادة من ذاكرة البناء المؤقتة.
# الخيار --no-cache-dir يمنع pip من حفظ ملفات التحميل، فتصغر الصورة.
COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

# نسخ بقية ملفات المشروع إلى الحاوية.
COPY . .

# تشغيل خادم Django، و 0.0.0.0 تسمح بالوصول إليه من خارج الحاوية.
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]


# تشغيل حاويتين يدوياً (Django و PostgreSQL) على شبكة واحدة
# الشرح الكامل لكل خطوة في ملف README.
#
# 1) إنشاء الشبكة (مرة واحدة):
#    docker network create app-network
#
# 2) إنشاء مساحة التخزين (مرة واحدة):
#    docker volume create tasks-data
#
# 3) تشغيل قاعدة البيانات:
#    docker run -d --rm --name task-db --network app-network -e POSTGRES_DB=tasks_db -e POSTGRES_USER=tasks_user -e POSTGRES_PASSWORD=password -p 5444:5432 -v tasks-data:/var/lib/postgresql postgres:latest
#
# 4) بناء صورة Django:
#    docker build -t tasks .
#
# 5) إنشاء ملفات الترحيل (عند الحاجة فقط):
#    docker run --rm --network app-network --env-file .env -v "$PWD:/app" tasks python manage.py makemigrations
#
# 6) تطبيق الترحيلات:
#    docker run --rm --network app-network --env-file .env tasks python manage.py migrate
#
# 7) تشغيل Django:
#    docker run --rm --name tasks-app --network app-network --env-file .env -p 8001:8000 tasks
#
# الاتصال بقاعدة البيانات:
#    docker exec -it task-db psql -U tasks_user -d tasks_db
