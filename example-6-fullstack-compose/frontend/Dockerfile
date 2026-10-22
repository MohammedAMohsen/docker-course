# ===== المرحلة الأولى: بناء تطبيق React =====
FROM node:latest AS builder

WORKDIR /app

# ملفات المكتبات أولاً، للاستفادة من ذاكرة البناء المؤقتة.
COPY package*.json ./

# الأمر npm ci يثبّت الإصدارات المسجّلة في package-lock.json بالضبط.
# لذلك يعطي النتيجة نفسها في كل بناء، وهذا ما نريده داخل Docker.
RUN npm ci

COPY . .
RUN npm run build


# ===== المرحلة الثانية: تقديم الملفات عبر Nginx =====
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html

# إعدادنا الخاص لخادم Nginx: تقديم الموقع وتمرير طلبات الخلفية إلى Django.
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]


# التشغيل اليدوي بدون Compose (بعد تشغيل حاوية Django باسم backend على الشبكة نفسها):
#
# docker build -t workboard-app:latest .
# docker run -it --rm --name workboard-frontend --network workboard-network -p 3001:80 workboard-app:latest
