
# استطيع عمل اكثر من تطبيق او مشروع داخلي Django داخل المشروع ال
# على سبيل المثال موقع مدونة وايضا موقع خاص بالمتجر, وكل شيئ منفصل علن الآخر
# لكن اذا كان عندي اكثر من تطبيق لازم امييز الرابط بكتابة اسم التطبيق
# path('blog/', include('blog.urls'))    http://127.0.0.1:8000/blog/
# path('Market/', include('blog.urls'))  http://127.0.0.1:8000/Market/
# ...
# ..
# .
# ممكن ما اسمي الرابط Django لكن اذا كان عندي تطبيق واحد داخل مشروع ال
# واتركه فارغ حتى ينقلني الي التطبيق مباشرة عند تشغيل المشروع ويكون هو التطبيق الرئيسي
# path('', include('blog.urls'))   http://127.0.0.1:8000/


from django.contrib import admin
from django.urls import path, include
from users import views as user_views
from django.contrib.auth import views as auth_views
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('register/', user_views.register, name='register'),
    path('profile/', user_views.profile, name='profile'),
#   path('login/', auth_views.LoginView.as_view(template_name='users/login.html'), name='login'),
    path('login/', user_views.CustomLoginView.as_view(), name='login'),
    path('logout/', auth_views.LogoutView.as_view(template_name='users/logout.html'), name='logout'),
    path('password-reset/',
        auth_views.PasswordResetView.as_view(template_name='users/password_reset.html'),
        name='password_reset'
    ),
    path('password-reset-done/',
        auth_views.PasswordResetDoneView.as_view(template_name='users/password_reset_done.html'),
        name='password_reset_done'
    ),
    path('password-reset-confirm/<uidb64>/<token>/',
        auth_views.PasswordResetConfirmView.as_view(template_name='users/password_reset_confirm.html'),
        name='password_reset_confirm'
    ),
    path('password-reset-complete/',
        auth_views.PasswordResetCompleteView.as_view(template_name='users/password_reset_complete.html'),
        name='password_reset_complete'
    ),
    path('', include('blog.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
