from datetime import timedelta

from django.test import TestCase
from django.urls import reverse
from django.utils import timezone
from rest_framework.test import APIClient

from .models import FocusSession, Task


class TaskApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        Task.objects.all().delete()
        self.todo = Task.objects.create(
            title="مراجعة الشبكات",
            description="مهمة للتعلّم",
            status=Task.Status.TODO,
            priority=Task.Priority.HIGH,
            category="تعلّم",
            due_date=timezone.localdate() - timedelta(days=1),
        )
        self.done = Task.objects.create(
            title="إعداد البيئة",
            status=Task.Status.DONE,
            priority=Task.Priority.LOW,
            category="تطوير",
        )

    def test_list_returns_paginated_tasks(self):
        response = self.client.get(reverse("task-list"))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["count"], 2)
        self.assertEqual(len(response.data["results"]), 2)

    def test_list_exposes_the_next_page_without_duplicate_records(self):
        Task.objects.bulk_create(
            [Task(title=f"مهمة تجريبية {index}") for index in range(50)]
        )
        first_page = self.client.get(reverse("task-list"))
        second_page = self.client.get(reverse("task-list"), {"page": 2})
        self.assertEqual(first_page.data["count"], 52)
        self.assertIsNotNone(first_page.data["next"])
        self.assertEqual(len(first_page.data["results"]), 50)
        self.assertEqual(len(second_page.data["results"]), 2)
        first_ids = {row["id"] for row in first_page.data["results"]}
        second_ids = {row["id"] for row in second_page.data["results"]}
        self.assertTrue(first_ids.isdisjoint(second_ids))

    def test_status_and_priority_filters_are_applied(self):
        response = self.client.get(reverse("task-list"), {"status": "todo", "priority": "high"})
        self.assertEqual(response.status_code, 200)
        self.assertEqual([row["id"] for row in response.data["results"]], [self.todo.id])

    def test_invalid_status_returns_empty_collection(self):
        response = self.client.get(reverse("task-list"), {"status": "unknown"})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["count"], 0)

    def test_search_matches_description(self):
        response = self.client.get(reverse("task-list"), {"search": "للتعلّم"})
        self.assertEqual(response.data["count"], 1)
        self.assertEqual(response.data["results"][0]["id"], self.todo.id)

    def test_create_trims_title_and_returns_created_record(self):
        response = self.client.post(
            reverse("task-list"),
            {"title": "  مهمة جديدة  ", "category": "تجربة", "status": "todo", "priority": "medium"},
            format="json",
        )
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data["title"], "مهمة جديدة")
        self.assertEqual(Task.objects.filter(title="مهمة جديدة").count(), 1)

    def test_blank_title_is_rejected(self):
        response = self.client.post(reverse("task-list"), {"title": "   "}, format="json")
        self.assertEqual(response.status_code, 400)
        self.assertIn("title", response.data)

    def test_patch_updates_only_requested_field(self):
        response = self.client.patch(
            reverse("task-detail", args=[self.todo.id]), {"status": "in_progress"}, format="json"
        )
        self.assertEqual(response.status_code, 200)
        self.todo.refresh_from_db()
        self.assertEqual(self.todo.status, Task.Status.IN_PROGRESS)
        self.assertEqual(self.todo.title, "مراجعة الشبكات")

    def test_delete_removes_record(self):
        response = self.client.delete(reverse("task-detail", args=[self.done.id]))
        self.assertEqual(response.status_code, 204)
        self.assertFalse(Task.objects.filter(pk=self.done.id).exists())

    def test_summary_counts_overdue_and_completion_rate(self):
        response = self.client.get(reverse("task-summary"))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["total"], 2)
        self.assertEqual(response.data["todo"], 1)
        self.assertEqual(response.data["completed"], 1)
        self.assertEqual(response.data["overdue"], 1)
        self.assertEqual(response.data["completion_rate"], 50)

    def test_calendar_returns_only_tasks_in_requested_month(self):
        Task.objects.all().delete()
        due_this_month = timezone.localdate().replace(day=10)
        due_next_month = due_this_month + timedelta(days=35)
        current_month_task = Task.objects.create(title="موعد الشهر", due_date=due_this_month)
        Task.objects.create(title="موعد الشهر القادم", due_date=due_next_month)
        month_key = due_this_month.strftime("%Y-%m")

        response = self.client.get(reverse("task-calendar"), {"month": month_key})

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["count"], 1)
        self.assertEqual(response.data["results"][0]["id"], current_month_task.id)

    def test_calendar_rejects_invalid_month(self):
        response = self.client.get(reverse("task-calendar"), {"month": "not-a-month"})
        self.assertEqual(response.status_code, 400)
        self.assertIn("month", response.data)

    def test_focus_session_is_saved_and_included_in_daily_summary(self):
        response = self.client.post(
            reverse("focus-sessions"),
            {"task_id": self.todo.id, "duration_minutes": 25},
            format="json",
        )
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data["task_title"], self.todo.title)
        self.assertEqual(FocusSession.objects.count(), 1)

        summary = self.client.get(reverse("task-summary"))
        self.assertEqual(summary.data["focus_minutes_today"], 25)
        self.assertEqual(summary.data["focus_sessions_today"], 1)

    def test_focus_session_validates_duration_and_rejects_completed_tasks(self):
        invalid_duration = self.client.post(
            reverse("focus-sessions"),
            {"task_id": self.todo.id, "duration_minutes": 0},
            format="json",
        )
        self.assertEqual(invalid_duration.status_code, 400)

        completed_task = self.client.post(
            reverse("focus-sessions"),
            {"task_id": self.done.id, "duration_minutes": 25},
            format="json",
        )
        self.assertEqual(completed_task.status_code, 400)
        self.assertEqual(FocusSession.objects.count(), 0)

    def test_health_check_reports_database_connection(self):
        response = self.client.get(reverse("health"))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["database"], "ok")
