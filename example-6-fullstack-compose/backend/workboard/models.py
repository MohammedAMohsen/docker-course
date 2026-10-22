from django.db import models
from django.utils import timezone


class Task(models.Model):
    class Status(models.TextChoices):
        TODO = "todo", "قيد الانتظار"
        IN_PROGRESS = "in_progress", "قيد التنفيذ"
        DONE = "done", "مكتملة"

    class Priority(models.TextChoices):
        LOW = "low", "منخفضة"
        MEDIUM = "medium", "متوسطة"
        HIGH = "high", "عالية"

    title = models.CharField(max_length=180)
    description = models.TextField(max_length=1200, blank=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.TODO)
    priority = models.CharField(max_length=10, choices=Priority.choices, default=Priority.MEDIUM)
    category = models.CharField(max_length=48, default="عام")
    due_date = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at", "-id"]
        indexes = [
            models.Index(fields=["status", "-created_at"], name="tasks_status_created_idx"),
            models.Index(fields=["due_date", "status"], name="tasks_due_status_idx"),
        ]

    def __str__(self) -> str:
        return self.title


class FocusSession(models.Model):
    """A completed focus block, retained even if its task is later removed."""

    task = models.ForeignKey(
        Task,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="focus_sessions",
    )
    task_title = models.CharField(max_length=180)
    duration_minutes = models.PositiveSmallIntegerField()
    completed_at = models.DateTimeField(default=timezone.now, db_index=True)

    class Meta:
        ordering = ["-completed_at", "-id"]

    def __str__(self) -> str:
        return f"{self.task_title} ({self.duration_minutes} min)"
