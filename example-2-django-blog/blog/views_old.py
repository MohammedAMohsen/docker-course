# ────────────────────────────────────────────────────────────────────────
#  [Function-Based Views] CRUDالطريقة العادية لعرض المنشورات وعمل اوامر ال
# ────────────────────────────────────────────────────────────────────────

# forms.py

from django import forms

from .models import Post

class PostForm(forms.ModelForm):
    class Meta:
        model = Post
        fields = ['title', 'content']

# ────────────────────────────────────────────────────────────────────────

# urls.py

from django.urls import path

from . import views

urlpatterns = [

    path('', views.home, name='blog-home'),
    path('post/new/', views.post_create, name='post-create'),
    path('post/<int:pk>/', views.post_detail, name='post-detail'),
    path('post/<int:pk>/update/', views.post_update, name='post-update'),
    path('post/<int:pk>/delete/', views.post_delete, name='post-delete'),
    path('about/', views.about, name='blog-about'),
]

# ────────────────────────────────────────────────────────────────────────

# views.py

from django.shortcuts import (
    render,
    redirect,
    get_object_or_404
)

from django.contrib.auth.decorators import login_required
from django.http import HttpResponseForbidden

from .models import Post

# =========================================================
# HOME PAGE
# بديلة عن ListView
# =========================================================

def home(request):

    posts = Post.objects.all().order_by('-date_posted')
    return render(request, 'blog/home.html', {'posts': posts})

# =========================================================
# POST DETAIL
# بديلة عن DetailView
# =========================================================

def post_detail(request, pk):

    post = get_object_or_404(Post, pk=pk)
    return render(request, 'blog/post_detail.html', {'posts': post})

# =========================================================
# CREATE POST
# بديلة عن CreateView
# =========================================================

@login_required
def post_create(request):
    # عند إرسال الفورم
    if request.method == 'POST':
        # تعبئة الفورم بالبيانات القادمة
        form = PostForm(request.POST)
        # التحقق من صحة البيانات
        if form.is_valid():
            # إنشاء object مؤقتة بدون حفظ
            post = form.save(commit=False)
            # إضافة الكاتب الحالي
            post.author = request.user
            # الحفظ النهائي
            post.save()
            # تحويل المستخدم لصفحة المنشور
            return redirect('post-detail', pk=post.pk)
    else:
        # أول مرة يدخل الصفحة
        form = PostForm()
    return render(request, 'blog/post_form.html', {'form': form})

# =========================================================
# UPDATE POST
# بديلة عن UpdateView
# =========================================================

@login_required
def post_update(request, pk):

    # جلب المنشور
    post = get_object_or_404(Post, pk=pk)

    # التحقق أن المستخدم هو صاحب المنشور
    if request.user != post.author:
        return HttpResponseForbidden("You are not allowed to edit this post.")

    # عند إرسال الفورم
    if request.method == 'POST':

        # تعبئة الفورم بالبيانات الجديدة
        # وربطها بالمنشور الحالي
        form = PostForm(request.POST, instance=post)

        # التحقق من صحة البيانات
        if form.is_valid():

            # إنشاء object مؤقتة
            updated_post = form.save(commit=False)

            # الحفاظ على الكاتب
            updated_post.author = request.user

            # حفظ التعديلات
            updated_post.save()

            # التحويل لصفحة المنشور
            return redirect('post-detail', pk=updated_post.pk)

    else:

        # تعبئة الفورم ببيانات المنشور الحالية
        form = PostForm(instance=post)

    return render(request, 'blog/post_form.html', {'form': form})

# =========================================================
# DELETE POST
# بديلة عن DeleteView
# =========================================================

@login_required
def post_delete(request, pk):

    # جلب المنشور
    post = get_object_or_404(Post, pk=pk)

    # التحقق أن المستخدم هو صاحب المنشور
    if request.user != post.author:
        return HttpResponseForbidden("You are not allowed to delete this post.")

    # عند تأكيد الحذف
    if request.method == 'POST':

        # حذف المنشور
        post.delete()

        # العودة للرئيسية
        return redirect('blog-home')

    return render(request, 'blog/post_confirm_delete.html', {'post': post})


# =========================================================
# ABOUT PAGE
# =========================================================

def about(request):
    return render(request, 'blog/about.html', {'title': 'About'})
