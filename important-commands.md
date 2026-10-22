# أهم أوامر Docker

مرجع سريع مرتّب حسب الموضوع. كل أمر معه شرح قصير.
الكلمات بين القوسين المعقوفين مثل `<container>` تعني: ضع هنا الاسم أو المعرّف.

## المحتويات

1. [مفاهيم سريعة](#1-مفاهيم-سريعة)
2. [الصور](#2-الصور)
3. [بناء الصور](#3-بناء-الصور)
4. [تشغيل الحاويات](#4-تشغيل-الحاويات)
5. [إدارة الحاويات](#5-إدارة-الحاويات)
6. [الدخول إلى الحاوية والسجلات](#6-الدخول-إلى-الحاوية-والسجلات)
7. [الشبكات](#7-الشبكات)
8. [التخزين](#8-التخزين)
9. [تعليمات ملف Dockerfile](#9-تعليمات-ملف-dockerfile)
10. [ملف Docker Compose](#10-ملف-docker-compose)
11. [أوامر Docker Compose](#11-أوامر-docker-compose)
12. [Docker Hub](#12-docker-hub)
13. [التنظيف](#13-التنظيف)
14. [أخطاء شائعة وحلولها](#14-أخطاء-شائعة-وحلولها)

---

## 1) مفاهيم سريعة

| المصطلح | معناه |
|---|---|
| الصورة (Image) | قالب جاهز للقراءة فقط، فيه نظام صغير وبرنامج ومكتباته |
| الحاوية (Container) | نسخة تعمل من صورة. يمكن تشغيل عدة حاويات من صورة واحدة |
| ملف Dockerfile | وصفة بناء الصورة، تعليمة بعد تعليمة |
| الطبقة (Layer) | كل تعليمة في Dockerfile تصنع طبقة، ويحفظها Docker لإعادة استخدامها |
| الوسم (Tag) | الجزء بعد النقطتين في اسم الصورة، مثل `latest` أو `18` |
| مساحة التخزين (Volume) | مكان يديره Docker لحفظ البيانات خارج الحاوية |
| الشبكة (Network) | تسمح للحاويات بالتواصل، واسم الحاوية فيها يعمل كعنوان |
| المستودع (Registry) | مكان حفظ الصور ومشاركتها، مثل Docker Hub |

---

## 2) الصور

```bash
docker image ls
```

عرض الصور الموجودة على الجهاز. الاختصار القديم: `docker images`.

```bash
docker pull node:latest
```

سحب صورة من Docker Hub دون تشغيلها. هنا: أحدث نسخة من صورة Node.

```bash
docker pull postgres:18
```

سحب إصدار محدّد. الأفضل في المشاريع الحقيقية من `latest`.

```bash
docker image rm hello-world
```

حذف صورة. يفشل إذا كانت حاوية ما زالت تستخدمها، حتى لو كانت متوقفة.

```bash
docker image tag <image-id> my-app:v1
```

إضافة اسم ووسم جديدين لصورة موجودة.
لا ينسخ الصورة ولا يغيّرها، بل يضيف اسماً آخر يشير إليها.

```bash
docker image inspect postgres:latest
```

كل تفاصيل الصورة: المتغيّرات، والمنافذ، والأمر الافتراضي، ومساحات التخزين.

```bash
docker image history my-app
```

طبقات الصورة وحجم كل طبقة. مفيد لمعرفة سبب كبر الصورة.

---

## 3) بناء الصور

```bash
docker build -t my-app:latest .
```

- `-t my-app:latest`: اسم الصورة ووسمها.
- النقطة في الآخر: مجلد البناء. محتواه يُرسل إلى محرّك البناء، ما عدا ما في `.dockerignore`.

```bash
docker build -t my-app -f docker/Dockerfile.prod .
```

`-f`: استخدام ملف Dockerfile باسم أو مكان مختلف.

```bash
docker build --no-cache -t my-app .
```

`--no-cache`: تجاهل الطبقات المحفوظة وبناء كل شيء من الصفر.

---

## 4) تشغيل الحاويات

```bash
docker run -it --rm ubuntu:latest
```

تشغيل صورة Ubuntu والدخول إلى طرفيتها.

### أهم خيارات الأمر run

| الخيار | معناه | مثال |
|---|---|---|
| `-it` | جلسة تفاعلية نكتب فيها ونقرأ الرد | `docker run -it ubuntu` |
| `--rm` | احذف الحاوية تلقائياً عند توقفها | `docker run --rm hello-python` |
| `-d` | شغّل في الخلفية وأعد الطرفية | `docker run -d postgres` |
| `--name` | اسم ثابت للحاوية بدل اسم عشوائي | `--name task-db` |
| `-p` | ربط منفذ الجهاز بمنفذ الحاوية | `-p 8000:8000` |
| `-e` | تعيين متغيّر بيئة واحد | `-e POSTGRES_PASSWORD=password` |
| `--env-file` | قراءة المتغيّرات من ملف | `--env-file .env` |
| `-v` | ربط مساحة تخزين أو مجلد | `-v tasks-data:/var/lib/postgresql` |
| `--network` | وضع الحاوية في شبكة | `--network app-network` |

### المنافذ

```text
-p 5444:5432
   │    └── منفذ داخل الحاوية
   └─────── منفذ على الجهاز
```

### استبدال الأمر الافتراضي

الكلمات بعد اسم الصورة تستبدل التعليمة `CMD`:

```bash
docker run --rm my-django-app python manage.py migrate
```

مثال كامل من المثال الخامس:

```bash
docker run -d --rm --name task-db --network app-network -e POSTGRES_DB=tasks_db -e POSTGRES_USER=tasks_user -e POSTGRES_PASSWORD=password -p 5444:5432 -v tasks-data:/var/lib/postgresql postgres:latest
```

---

## 5) إدارة الحاويات

```bash
docker container ls
```

الحاويات التي تعمل الآن. الاختصار: `docker ps`.

```bash
docker container ls -a
```

كل الحاويات، ومنها المتوقفة. الاختصار: `docker ps -a`.

```bash
docker container stop <container>
```

إيقاف حاوية بهدوء: يرسل إشارة إيقاف، وينتظر عشر ثوانٍ، ثم يوقفها بالقوة.

```bash
docker container start <container>
```

تشغيل حاوية متوقفة موجودة، بالإعدادات نفسها التي أُنشئت بها.

```bash
docker container restart <container>
```

إيقاف ثم تشغيل.

```bash
docker container rm <container>
```

حذف حاوية متوقفة. أضف `-f` لحذف حاوية تعمل.

```bash
docker container inspect <container>
```

كل تفاصيل الحاوية: العنوان الداخلي، والشبكات، ومساحات التخزين، والمتغيّرات.

```bash
docker stats
```

استهلاك المعالج والذاكرة لكل حاوية تعمل، بشكل مباشر.

> الفرق بين `run` و `start`:
> `run` ينشئ حاوية **جديدة** من صورة.
> `start` يشغّل حاوية **موجودة** كانت متوقفة.

---

## 6) الدخول إلى الحاوية والسجلات

```bash
docker exec -it <container> bash
```

فتح طرفية داخل حاوية تعمل. الصور الصغيرة مثل صور alpine لا تحتوي bash، فاستخدم `sh` بدلاً منه.

```bash
docker exec -it task-db psql -U tasks_user -d tasks_db
```

تنفيذ أمر محدّد داخل الحاوية. هنا: الدخول إلى قاعدة البيانات.

```bash
docker logs <container>
```

عرض سجلات الحاوية، أي كل ما طبعه البرنامج.

```bash
docker logs -f --tail 50 <container>
```

- `-f`: متابعة السجلات الجديدة مباشرة.
- `--tail 50`: ابدأ من آخر خمسين سطراً.

```bash
docker cp <container>:/app/file.txt ./file.txt
```

نسخ ملف من الحاوية إلى الجهاز. ويعمل بالعكس أيضاً.

---

## 7) الشبكات

```bash
docker network create app-network
```

إنشاء شبكة. داخلها، اسم الحاوية يعمل كعنوان.

```bash
docker network ls
```

عرض الشبكات.

```bash
docker network inspect app-network
```

تفاصيل الشبكة والحاويات المتصلة بها.

```bash
docker network connect app-network <container>
```

إضافة حاوية تعمل إلى شبكة.

```bash
docker network rm app-network
```

حذف شبكة.

> خدمة الأسماء تعمل فقط في الشبكات التي ننشئها نحن، وفي شبكات Compose.
> في الشبكة الافتراضية لا تجد الحاوية غيرها بالاسم.

---

## 8) التخزين

### مساحات التخزين

```bash
docker volume create tasks-data
```

إنشاء مساحة تخزين مسمّاة.

```bash
docker volume ls
```

عرض مساحات التخزين.

```bash
docker volume inspect tasks-data
```

تفاصيلها، ومنها مكانها الفعلي على الجهاز في الحقل `Mountpoint`.

```bash
docker volume rm tasks-data
```

حذف مساحة تخزين **مع كل بياناتها**. لا يمكن التراجع.

### الفرق بين مساحة التخزين وربط المجلد

| النوع | الكتابة | من يديره | الاستخدام |
|---|---|---|---|
| مساحة تخزين | `-v tasks-data:/var/lib/postgresql` | Docker | بيانات دائمة مثل قواعد البيانات |
| ربط مجلد | `-v "$PWD:/app"` | أنت | مشاركة الكود والملفات أثناء التطوير |

القاعدة: إذا كان الجزء قبل النقطتين **اسماً** فهو مساحة تخزين، وإذا كان **مساراً** فهو ربط مجلد.

---

## 9) تعليمات ملف Dockerfile

| التعليمة | معناها |
|---|---|
| `FROM python:3.13-slim` | الصورة الأساسية |
| `FROM node AS builder` | بداية مرحلة بناء وتسميتها |
| `WORKDIR /app` | مجلد العمل، يُنشأ تلقائياً |
| `COPY . .` | نسخ من مجلد البناء إلى الصورة |
| `COPY --from=builder /app/dist ./` | نسخ من مرحلة سابقة |
| `RUN pip install -r requirements.txt` | تنفيذ أمر **أثناء البناء** |
| `ENV PYTHONUNBUFFERED=1` | متغيّر بيئة دائم في الصورة |
| `ARG VERSION=1` | متغيّر يُستخدم أثناء البناء فقط |
| `EXPOSE 8000` | توثيق المنفذ فقط، لا يفتح شيئاً |
| `CMD ["python", "app.py"]` | الأمر الافتراضي **عند التشغيل** |
| `ENTRYPOINT ["python"]` | الأمر الثابت، و `CMD` يصبح معاملاته |
| `USER app` | تشغيل ما بعده بمستخدم عادي بدل المدير |

### الفرق بين RUN و CMD

- `RUN` يُنفَّذ مرة واحدة **أثناء بناء** الصورة، ونتيجته تُحفظ فيها.
- `CMD` يُنفَّذ **كل مرة تبدأ** فيها حاوية من الصورة.

### قاعدة ترتيب التعليمات

ضع ما يتغيّر نادراً في الأعلى، وما يتغيّر كثيراً في الأسفل:

```dockerfile
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
```

عند تعديل الكود فقط، يأخذ Docker تثبيت المكتبات من الذاكرة المؤقتة.

### ملف .dockerignore

يمنع ملفات من الدخول إلى الصورة. أهم ما يوضع فيه:

```text
.env
.git/
.venv/
__pycache__/
node_modules/
```

---

## 10) ملف Docker Compose

مثال مختصر مع أهم المفاتيح:

```yaml
services:
  db:
    image: postgres:18               # صورة جاهزة
    environment:                     # متغيّرات بيئة
      POSTGRES_PASSWORD: ${DB_PASS}  # قيمة من ملف .env
    volumes:
      - db_data:/var/lib/postgresql  # مساحة تخزين مسمّاة
    healthcheck:                     # فحص الجاهزية
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      retries: 5

  backend:
    build: ./backend                 # بناء صورة من مجلد
    image: my-backend:latest         # اسم الصورة المبنية
    env_file:
      - ./backend/.env               # متغيّرات من ملف
    command: python manage.py runserver 0.0.0.0:8000   # استبدال CMD
    ports:
      - "8001:8000"
    depends_on:
      db:
        condition: service_healthy   # انتظر نجاح فحص القاعدة
    restart: unless-stopped          # أعد التشغيل تلقائياً إذا توقفت

volumes:
  db_data:
```

### شروط الانتظار في depends_on

| الشرط | معناه |
|---|---|
| بدون شرط | ترتيب البدء فقط، ولا ينتظر أن تجهز الخدمة |
| `service_started` | انتظر أن تبدأ الخدمة |
| `service_healthy` | انتظر نجاح فحص الصحة |
| `service_completed_successfully` | انتظر أن تنتهي الخدمة بنجاح، مثل خدمة الترحيل |

### متى يُقرأ ملف .env؟

- ملف `.env` بجانب ملف Compose: يقرؤه Compose تلقائياً ليعوّض `${...}` في الملف.
- الملف في `env_file`: محتواه يدخل الحاوية كمتغيّرات بيئة.
- القيم في `environment` تتغلّب على القيم نفسها في `env_file`.

---

## 11) أوامر Docker Compose

| الأمر | معناه |
|---|---|
| `docker compose up` | تشغيل الخدمات وعرض السجلات في الطرفية |
| `docker compose up -d` | تشغيل الخدمات في الخلفية |
| `docker compose up -d --build` | بناء الصور المطلوبة ثم التشغيل |
| `docker compose build` | بناء الصور فقط |
| `docker compose pull` | سحب الصور الجاهزة من المستودع |
| `docker compose config` | التحقق من الملف وعرضه بعد تعويض المتغيّرات |
| `docker compose ps` | حاويات المشروع وحالتها |
| `docker compose ps -a` | ومعها المنتهية، مثل خدمة الترحيل |
| `docker compose logs -f` | متابعة سجلات كل الخدمات |
| `docker compose logs -f backend` | متابعة سجلات خدمة واحدة |
| `docker compose exec backend bash` | طرفية داخل خدمة تعمل |
| `docker compose exec backend python manage.py createsuperuser` | تنفيذ أمر داخل خدمة تعمل |
| `docker compose run --rm backend python manage.py test` | حاوية جديدة لمرة واحدة |
| `docker compose restart backend` | إعادة تشغيل خدمة |
| `docker compose stop` | إيقاف الحاويات مع بقائها، لتشغيلها لاحقاً |
| `docker compose down` | إيقاف وحذف الحاويات والشبكة، وتبقى مساحات التخزين |
| `docker compose down -v` | السابق مع حذف مساحات التخزين. **يحذف البيانات** |

> اسم المشروع في Compose هو اسم المجلد.
> منه تتكوّن أسماء الحاويات والشبكة ومساحات التخزين، مثل `example-6-fullstack-compose_postgres_data`.
> لذلك تغيير اسم المجلد يجعل Compose ينشئ مساحة تخزين جديدة فارغة.

---

## 12) Docker Hub

```bash
docker login
```

تسجيل الدخول.

```bash
docker tag workboard-backend:latest mohammed7845/workboard-backend:latest
```

إعطاء الصورة اسماً يبدأ باسم المستخدم، وهو شرط الرفع.

```bash
docker push mohammed7845/workboard-backend:latest
```

رفع الصورة. يُنشأ المستودع تلقائياً إذا لم يكن موجوداً.

```bash
docker pull mohammed7845/workboard-backend:latest
```

سحب الصورة على أي جهاز.

```bash
docker logout
```

تسجيل الخروج.

---

## 13) التنظيف

```bash
docker system df
```

المساحة التي تستهلكها الصور والحاويات ومساحات التخزين وذاكرة البناء.

```bash
docker container prune
```

حذف كل الحاويات المتوقفة.

```bash
docker image prune
```

حذف الصور التي بلا اسم، وهي بقايا البناءات القديمة.

```bash
docker image prune -a
```

حذف كل صورة لا تستخدمها أي حاوية. ستحتاج سحبها من جديد لاحقاً.

```bash
docker builder prune
```

حذف ذاكرة البناء المؤقتة.

```bash
docker volume prune
```

حذف مساحات التخزين غير المستخدمة. **انتبه: قد يحذف بيانات قواعد البيانات.**

```bash
docker system prune
```

تنظيف عام: الحاويات المتوقفة، والشبكات غير المستخدمة، والصور بلا اسم، وذاكرة البناء.

---

## 14) أخطاء شائعة وحلولها

| الخطأ أو العَرَض | السبب | الحل |
|---|---|---|
| `port is already allocated` | المنفذ على الجهاز مستخدم | غيّر الرقم الأول في `-p`، مثل `5444:5432` |
| المتصفح لا يصل إلى التطبيق | الخادم يستمع على `127.0.0.1` داخل الحاوية | شغّله على `0.0.0.0` |
| المتصفح لا يصل إلى التطبيق | نسيت الخيار `-p` | أضف ربط المنفذ |
| `failed to resolve host 'task-db'` | الحاويتان ليستا في الشبكة نفسها | أضف `--network` للحاويتين |
| Django لا يجد القاعدة على `localhost` | داخل الحاوية `localhost` هي الحاوية نفسها | استخدم اسم حاوية القاعدة أو اسم الخدمة |
| البيانات تختفي بعد إعادة التشغيل | لا توجد مساحة تخزين | أضف `-v` بمساحة مسمّاة |
| القاعدة فارغة رغم وجود مساحة تخزين | المسار داخل الحاوية خطأ لهذا الإصدار | من الإصدار 18: `/var/lib/postgresql`، وقبله: `/var/lib/postgresql/data` |
| تعديلات الكود لا تظهر | الصورة قديمة | أعد البناء، أو `docker compose up -d --build` |
| `Exited (0)` لخدمة الترحيل | ليس خطأ | الحاوية أنهت عملها بنجاح |
| `Exited (1)` | البرنامج داخل الحاوية فشل | اقرأ السبب في `docker logs <container>` |
| `Bind for 0.0.0.0:3001 failed` | مشروع آخر يستخدم المنفذ | أوقفه بالأمر `docker compose down` في مجلده |
