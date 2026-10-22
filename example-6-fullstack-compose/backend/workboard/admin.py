from django.contrib import admin

from .models import Task


@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ("title", "status", "priority", "category", "due_date", "updated_at")
    list_filter = ("status", "priority", "category")
    search_fields = ("title", "description", "category")
    ordering = ("status", "-created_at")
    readonly_fields = ("created_at", "updated_at")
