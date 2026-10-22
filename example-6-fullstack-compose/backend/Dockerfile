FROM python:latest

# لا تنشئ ملفات Python المؤقتة (ذات الامتداد pyc) داخل الحاوية.
ENV PYTHONDONTWRITEBYTECODE=1

# اطبع مخرجات Python وأخطاءها فوراً، حتى تظهر مباشرة في سجلات الحاوية.
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# نسخ ملف المكتبات وتثبيتها أولاً، للاستفادة من ذاكرة البناء المؤقتة.
COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

# نسخ بقية ملفات المشروع إلى الحاوية.
COPY . .

# تشغيل خادم Django، و 0.0.0.0 تسمح بالوصول إليه من خارج الحاوية.
# تنبيه: خادم runserver للتطوير فقط. انظر قسم الدروس المستفادة في README الرئيسي.
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]


# الطريقة اليدوية بدون Compose (قبل كتابة ملف compose.yml)
#
# 1) إنشاء الشبكة (مرة واحدة):
#    docker network create workboard-network
#
# 2) إنشاء مساحة التخزين (مرة واحدة):
#    docker volume create workboard
#
# 3) تشغيل قاعدة البيانات (اسم الحاوية workboard هو قيمة POSTGRES_HOST في ملف .env):
#    docker run -d --rm --name workboard --network workboard-network -e POSTGRES_DB=nawa_tasks -e POSTGRES_USER=nawa_user -e POSTGRES_PASSWORD=password -p 5444:5432 -v workboard:/var/lib/postgresql postgres:latest
#
# الأوامر التالية من داخل مجلد backend:
#
# 4) بناء صورة Django:
#    docker build -t workboard .
#
# 5) إنشاء ملفات الترحيل (عند تعديل النماذج فقط):
#    docker run --rm --network workboard-network --env-file .env -v "$PWD:/app" workboard python manage.py makemigrations
#
# 6) تطبيق الترحيلات:
#    docker run --rm --network workboard-network --env-file .env workboard python manage.py migrate
#
# 7) تشغيل Django باسم backend، لأن ملف nginx.conf في الواجهة يبحث عن هذا الاسم:
#    docker run --rm --name backend --network workboard-network --env-file .env -p 8001:8000 workboard
#
# الاتصال بقاعدة البيانات:
#    docker exec -it workboard psql -U nawa_user -d nawa_tasks
