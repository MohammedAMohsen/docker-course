# المثال الخامس — Django و PostgreSQL في حاويتين على شبكة واحدة

واجهة برمجية صغيرة لإدارة المهام مبنية بـ Django REST Framework، وقاعدة بياناتها PostgreSQL.
هنا نشغّل حاويتين **يدوياً** بأوامر منفصلة، ونجعلهما تتواصلان عبر شبكة.
في المثال السادس نختصر كل هذه الأوامر في ملف Compose واحد.

## ما الجديد في هذا المثال؟

1. **الشبكات:** كيف تجد حاوية حاويةً أخرى.
2. **ملف المتغيّرات:** إعدادات الاتصال بقاعدة البيانات تأتي من البيئة، وليست مكتوبة في الكود.
3. **ربط مجلد من الجهاز:** حتى تظهر الملفات التي تنشئها الحاوية على جهازي.
4. **تشغيل أوامر لمرة واحدة:** مثل أمر الترحيل، في حاوية تنتهي بعد التنفيذ.

## لماذا نحتاج شبكة؟

كل حاوية معزولة، ولها عنوان داخلي خاص بها.
حاوية Django تحتاج أن تعرف أين قاعدة البيانات.

عندما ننشئ شبكة بأنفسنا ونضع الحاويتين فيها،
يوفّر Docker خدمة أسماء داخلية: **اسم الحاوية يصبح عنواناً**.
لذلك في ملف `.env` نكتب:

```text
POSTGRES_HOST=task-db
```

و `task-db` هو الاسم الذي أعطيناه لحاوية القاعدة بالخيار `--name`.

### لماذا ليس localhost؟

داخل حاوية Django، الكلمة `localhost` تعني حاوية Django نفسها.
قاعدة البيانات في حاوية أخرى، فلن يجدها Django هناك.

### ماذا يحدث بدون الشبكة؟

جرّبت تشغيل الترحيل بدون الخيار `--network`، فظهر هذا الخطأ:

```text
django.db.utils.OperationalError: failed to resolve host 'task-db': [Errno -2] Name or service not known
```

الحاوية وُضعت في الشبكة الافتراضية، وهذه الشبكة لا تحوّل أسماء الحاويات إلى عناوين.
خدمة الأسماء تعمل فقط في الشبكات التي ننشئها بأنفسنا.

## خطوات التشغيل

ابدأ من مجلد المثال، وأنشئ ملف المتغيّرات:

```bash
cd example-5-django-postgres-network
```

```bash
cp .env.example .env
```

### 1) إنشاء الشبكة (مرة واحدة)

```bash
docker network create app-network
```

### 2) إنشاء مساحة تخزين للقاعدة (مرة واحدة)

```bash
docker volume create tasks-data
```

### 3) تشغيل قاعدة البيانات

```bash
docker run -d --rm --name task-db --network app-network -e POSTGRES_DB=tasks_db -e POSTGRES_USER=tasks_user -e POSTGRES_PASSWORD=password -p 5444:5432 -v tasks-data:/var/lib/postgresql postgres:latest
```

- المتغيّرات `POSTGRES_DB` و `POSTGRES_USER` و `POSTGRES_PASSWORD` تقرأها صورة PostgreSQL عند أول تشغيل، فتنشئ القاعدة والمستخدم.
- كلمة المرور هنا يجب أن تطابق `POSTGRES_PASSWORD` في ملف `.env`.
- الخيار `-p 5444:5432` ليس ضرورياً لاتصال Django، فالحاويتان تتواصلان داخل الشبكة.
  أضفناه فقط لنتصل بالقاعدة من برنامج إدارة قواعد البيانات على الجهاز.

### 4) بناء صورة Django

```bash
docker build -t tasks .
```

### 5) إنشاء ملفات الترحيل (عند تعديل النماذج فقط)

```bash
docker run --rm --network app-network --env-file .env -v "$PWD:/app" tasks python manage.py makemigrations
```

الجديد هنا هو `-v "$PWD:/app"`، وهو **ربط مجلد** وليس مساحة تخزين:

- `$PWD` هو المجلد الحالي على جهازي.
- `/app` هو مجلد العمل داخل الحاوية.
- النتيجة: الحاوية ترى ملفات جهازي مباشرة، وأي ملف تنشئه في `/app` يظهر على جهازي.

بدون هذا الربط، ينشئ أمر الترحيل ملفاته داخل الحاوية فقط،
ثم تُحذف الحاوية بسبب `--rm`، فتضيع الملفات.

| النوع | الشكل | الاستخدام |
|---|---|---|
| مساحة تخزين | `-v tasks-data:/var/lib/postgresql` | بيانات يديرها Docker، مثل قاعدة البيانات |
| ربط مجلد | `-v "$PWD:/app"` | مشاركة ملفات بين الجهاز والحاوية أثناء التطوير |

الفرق في الكتابة: إذا كان الجزء الأول اسماً فهو مساحة تخزين، وإذا كان مساراً فهو ربط مجلد.

### 6) تطبيق الترحيلات

```bash
docker run --rm --network app-network --env-file .env tasks python manage.py migrate
```

هذه حاوية تنفّذ أمراً واحداً ثم تنتهي وتُحذف.
الكلمات بعد اسم الصورة تستبدل الأمر الافتراضي المكتوب في `CMD`.

### 7) تشغيل Django

```bash
docker run --rm --name tasks-app --network app-network --env-file .env -p 8001:8000 tasks
```

### الاتصال بقاعدة البيانات

```bash
docker exec -it task-db psql -U tasks_user -d tasks_db
```

## تجربة الواجهة البرمجية

| الطلب | الوظيفة |
|---|---|
| `GET /api/tasks/` | عرض المهام |
| `POST /api/tasks/` | إنشاء مهمة |
| `GET /api/tasks/1/` | عرض مهمة |
| `PATCH /api/tasks/1/` | تعديل مهمة |
| `DELETE /api/tasks/1/` | حذف مهمة |
| `/admin/` | لوحة الإدارة |

مثال حقيقي لإنشاء مهمة:

```bash
curl -X POST -H "Content-Type: application/json" -d '{"title":"Learn Compose","completed":false}' http://localhost:8001/api/tasks/
```

```json
{"id":3,"title":"Learn Compose","completed":false,"created_at":"2026-10-22T10:03:14.599369+03:00"}
```

لإنشاء مستخدم للوحة الإدارة:

```bash
docker exec -it tasks-app python manage.py createsuperuser
```

## الإيقاف

```bash
docker stop tasks-app task-db
```

بسبب `--rm` تُحذف الحاويتان، أما البيانات فتبقى في مساحة التخزين `tasks-data`.

## ما الصعب في هذه الطريقة؟

سبعة أوامر طويلة، وترتيبها مهم، وأي خطأ في اسم الشبكة أو كلمة المرور يكسر الاتصال.
وكلما زادت الخدمات زاد التعقيد.
هذه بالضبط المشكلة التي يحلّها Docker Compose في المثال السادس.
