# 🐳 دورة Docker — ملاحظات وتطبيقات عملية

> My Docker learning notes in Arabic: seven hands-on examples, from a one-line Python script
> to a four-service full-stack app (React + Django REST Framework + PostgreSQL + Nginx)
> run with Docker Compose and shipped through Docker Hub.

هذا المستودع خلاصة تعلّمي لـ Docker.
تعلّمت ذاتياً من عدة دورات على يوتيوب ومن التوثيق الرسمي، وطبّقت كل مفهوم في مثال عملي.
الأمثلة مرتّبة من الأسهل إلى الأصعب، وكل مثال يضيف مفهوماً جديداً فوق ما قبله.

![تطبيق نواة يعمل بأربع حاويات عبر Docker Compose](screenshots/nawa-overview.png)

## مسار التعلّم

| # | المثال | المفاهيم الجديدة | التقنيات |
|---|---|---|---|
| 1 | [أول صورة](example-1-hello-python/) | الصورة والحاوية، تعليمات Dockerfile الأساسية، البناء والتشغيل | Python |
| 2 | [مشروع Django](example-2-django-blog/) | ذاكرة البناء المؤقتة وترتيب التعليمات، ملف `.dockerignore`، ربط المنافذ، تمرير الأسرار عند التشغيل | Django، SQLite |
| 3 | [React مع البناء متعدد المراحل](example-3-react-multistage/) | البناء متعدد المراحل، تقديم موقع ثابت عبر Nginx، تصغير الصورة من 1.8GB إلى 102MB | React، Vite، Nginx |
| 4 | [PostgreSQL ومساحات التخزين](example-4-postgres-volumes/) | الصور الرسمية، التشغيل في الخلفية، الأمر `exec`، حفظ البيانات بمساحات التخزين | PostgreSQL |
| 5 | [حاويتان على شبكة واحدة](example-5-django-postgres-network/) | الشبكات وخدمة الأسماء، ملفات المتغيّرات، ربط مجلد من الجهاز، أوامر لمرة واحدة | Django REST Framework، PostgreSQL |
| 6 | [تطبيق كامل عبر Compose](example-6-fullstack-compose/) | ملف Compose، فحص الصحة، ترتيب البدء بالشروط، خدمة الترحيل، الوكيل العكسي | React، Django REST Framework، PostgreSQL، Nginx |
| 7 | [Docker Hub](example-7-docker-hub/) | الوسم والرفع والسحب، تشغيل المشروع من صور جاهزة بلا كود، متغيّرات Compose | Docker Hub |

## مرجع الأوامر

ملف [important-commands.md](important-commands.md) يجمع أهم الأوامر مرتّبة حسب الموضوع:
الصور، والبناء، والتشغيل وخياراته، والشبكات، والتخزين، وتعليمات Dockerfile، وملف Compose وأوامره، و Docker Hub، والتنظيف، وجدول بالأخطاء الشائعة وحلولها.

## لقطات من الأمثلة

| المثال السادس: لوحة المهام | المثال الثالث: React داخل Nginx |
|---|---|
| ![لوحة المهام](screenshots/nawa-board.png) | ![تطبيق React](screenshots/example-3-react.png) |

## طريقة الاستخدام

المتطلبات: Docker مع Docker Compose. لا تحتاج تثبيت Python أو Node على جهازك.

```bash
git clone https://github.com/MohammedAMohsen/docker-course.git
```

```bash
cd docker-course/example-1-hello-python
```

في كل مجلد ملف README فيه الشرح وخطوات التشغيل خطوة بخطوة.
الأمثلة التي تحتاج أسراراً فيها ملف `.env.example`: انسخه باسم `.env` قبل التشغيل.

## الدروس المستفادة: ما الذي سأغيّره في مشروع حقيقي؟

الأمثلة مكتوبة للتعلّم. بعد المراجعة، هذه أهم الأشياء التي تختلف في مشروع حقيقي على خادم.

### 1) صورة أساسية مصغّرة بإصدار ثابت

الأمثلة تستخدم `python:latest`، وهذه أحجام حقيقية من جهازي:

| الصورة | الحجم |
|---|---|
| خلفية المثال السادس على `python:latest` | 1.72GB |
| الخلفية نفسها على `python:3.13-slim` | 272MB |

تغيير سطر واحد صغّر الصورة أكثر من ست مرات، وعمل المشروع بلا أي تعديل آخر.

والوسم `latest` يتغيّر مع الوقت. صورة اليوم قد تختلف عن صورة الشهر القادم.
مثال حقيقي: صورة PostgreSQL غيّرت مسار البيانات في الإصدار 18، كما في المثال الرابع.
لذلك الأفضل تثبيت الإصدار، مثل `python:3.13-slim` و `postgres:18` و `node:22-alpine`.

### 2) خادم إنتاج بدل runserver

الأمر `runserver` خادم للتطوير فقط: بطيء، ولا يتحمّل الضغط، ولا يقدّم ملفات التنسيق عندما يكون وضع التطوير متوقفاً.
في الإنتاج نستخدم خادماً مثل `gunicorn`:

```dockerfile
CMD ["gunicorn", "config.wsgi:application", "--bind", "0.0.0.0:8000"]
```

### 3) ملفات التنسيق في الإنتاج

في المثال السابع ظهرت لوحة الإدارة بلا تنسيق، لأن وضع التطوير متوقف.
الحل: تشغيل `collectstatic` أثناء البناء، ثم تقديم الملفات عبر مكتبة `whitenoise` أو عبر Nginx.

### 4) مستخدم عادي بدل المدير

الحاوية تعمل افتراضياً بالمستخدم المدير `root`.
إذا اختُرق التطبيق، تكون صلاحيات المهاجم داخل الحاوية كاملة.
الأفضل إنشاء مستخدم عادي في Dockerfile والتبديل إليه بالتعليمة `USER`.

### 5) الأسرار

ما طبّقته في الأمثلة وأبقى عليه:

- لا أسرار داخل الصور: ملف `.env` في `.dockerignore`.
- لا أسرار في Git: ملف `.env` في `.gitignore`، ونرفع بدلاً منه `.env.example` بقيم وهمية.
- لا أسرار داخل ملف Compose: في المثال السابع تُقرأ من ملف `.env`.

## هيكل المستودع

```text
docker-course/
├── README.md
├── important-commands.md              مرجع الأوامر
├── screenshots/
├── example-1-hello-python/
├── example-2-django-blog/
├── example-3-react-multistage/
├── example-4-postgres-volumes/        أوامر فقط، بلا كود
├── example-5-django-postgres-network/
├── example-6-fullstack-compose/
│   ├── compose.yml
│   ├── backend/                       Django REST Framework
│   └── frontend/                      React و Nginx
└── example-7-docker-hub/
```

## المصادر

تعلّمت ذاتياً من مجموعة دورات على يوتيوب، ومن [توثيق Docker الرسمي](https://docs.docker.com/).
كود التطبيقات في الأمثلة الثالث والخامس والسادس مشاريع تدريبية جاهزة، وعملي فيها هو كل ما يخص Docker.
مدوّنة Django في المثال الثاني مشروع كتبته سابقاً بنفسي.

---

**محمد علاء محسن** · [GitHub](https://github.com/MohammedAMohsen) · [الموقع الشخصي](https://mohammedamohsen.github.io)
