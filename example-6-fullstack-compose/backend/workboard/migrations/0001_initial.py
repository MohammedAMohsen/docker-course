# Generated for the Nawa learning project.
from django.db import migrations, models


def create_starter_tasks(apps, schema_editor):
    Task = apps.get_model("workboard", "Task")
    Task.objects.using(schema_editor.connection.alias).bulk_create(
        [
            Task(
                title="تجهيز مساحة العمل للمشروع",
                description="ترتيب الملفات والتأكد من وضوح مسؤولية كل خدمة.",
                status="done",
                priority="medium",
                category="تطوير",
            ),
            Task(
                title="ربط الواجهة بواجهة المهام",
                description="اختبار تحميل البيانات من API وإظهار حالات التحميل والخطأ.",
                status="in_progress",
                priority="high",
                category="تطوير",
            ),
            Task(
                title="إنشاء أول مهمة تجريبية",
                description="جرّب إضافة مهمة ثم تعديل حالتها وأولويتها.",
                status="todo",
                priority="medium",
                category="تجربة",
            ),
            Task(
                title="مراجعة أساسيات PostgreSQL",
                description="تحقق من حفظ السجلات واستمرارها بعد إعادة تحميل الصفحة.",
                status="todo",
                priority="low",
                category="تعلّم",
            ),
            Task(
                title="تنظيم إعدادات البيئة",
                description="افصل القيم المحلية عن الكود ولا تضع كلمات مرور فعلية في Git.",
                status="todo",
                priority="high",
                category="تهيئة",
            ),
        ]
    )


def remove_starter_tasks(apps, schema_editor):
    Task = apps.get_model("workboard", "Task")
    Task.objects.using(schema_editor.connection.alias).filter(
        title__in=[
            "تجهيز مساحة العمل للمشروع",
            "ربط الواجهة بواجهة المهام",
            "إنشاء أول مهمة تجريبية",
            "مراجعة أساسيات PostgreSQL",
            "تنظيم إعدادات البيئة",
        ]
    ).delete()


class Migration(migrations.Migration):
    initial = True
    dependencies = []
    operations = [
        migrations.CreateModel(
            name="Task",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("title", models.CharField(max_length=180)),
                ("description", models.TextField(blank=True, max_length=1200)),
                ("status", models.CharField(choices=[("todo", "قيد الانتظار"), ("in_progress", "قيد التنفيذ"), ("done", "مكتملة")], default="todo", max_length=20)),
                ("priority", models.CharField(choices=[("low", "منخفضة"), ("medium", "متوسطة"), ("high", "عالية")], default="medium", max_length=10)),
                ("category", models.CharField(default="عام", max_length=48)),
                ("due_date", models.DateField(blank=True, null=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
            ],
            options={"ordering": ["-created_at", "-id"]},
        ),
        migrations.AddIndex(
            model_name="task",
            index=models.Index(fields=["status", "-created_at"], name="tasks_status_created_idx"),
        ),
        migrations.AddIndex(
            model_name="task",
            index=models.Index(fields=["due_date", "status"], name="tasks_due_status_idx"),
        ),
        migrations.RunPython(create_starter_tasks, remove_starter_tasks),
    ]
