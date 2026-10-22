from django.contrib.auth.models import User
from django.utils import timezone
from django.db import models
from django.urls import reverse

class Post(models.Model):
    title = models.CharField(max_length=100)
    content = models.TextField()
    date_posted = models.DateTimeField(default=timezone.now)
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='posts')
    """
        Post → User: post.author --> الشكل الطبيعي من خلال جدول المنشورات استطيع جلب بيانات المستخدم الناشر

        User → Post: user.post_set --> ORM Django العلاقة العكسية التي ينشاءها ال

        ينشاء العلاقة العكسية بشكل تلقائي عشان اقدر من جدول المستخدمين عرض المنشورات الخاصة بالمستخدم هذا Djangoال

        related_name='posts' --> بشكل تلقائي Djangoبهذة الطريقة بغير اسم العلاقة العكسية الي انشاءها ال

        user.posts.all() --> بعرض كل المشورات الخاصة بالمستخدم الحالي
        
        user.posts.create(title='#', content='#') -->  استطيع من خلال العلاقة العكسية انشاء منشور من خلال المستخدم الحالي
    """

    def __str__(self):
        return f"Title: {self.title} | Date: {self.date_posted} | Author: {self.author}"
    
    def get_absolute_url(self):
        return reverse('post-detail', kwargs={'pk': self.pk})
