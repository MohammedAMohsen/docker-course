from django.contrib import admin
from django.db import DatabaseError, connection
from django.http import JsonResponse
from django.urls import include, path
from django.utils import timezone
from rest_framework.routers import DefaultRouter
from rest_framework.views import APIView

from workboard.views import CalendarTasksView, FocusSessionsView, SummaryView, TaskViewSet


router = DefaultRouter()
router.register("tasks", TaskViewSet, basename="task")


class HealthView(APIView):
    authentication_classes = []
    permission_classes = []

    def get(self, request):
        try:
            with connection.cursor() as cursor:
                cursor.execute("SELECT 1")
                cursor.fetchone()
        except DatabaseError:
            return JsonResponse(
                {"status": "unavailable", "database": "unavailable"},
                status=503,
            )
        return JsonResponse(
            {"status": "ok", "database": "ok", "date": timezone.localdate().isoformat()}
        )


urlpatterns = [
    path("admin/", admin.site.urls),
    path("health/", HealthView.as_view(), name="health"),
    path("api/v1/summary/", SummaryView.as_view(), name="task-summary"),
    path("api/v1/calendar/", CalendarTasksView.as_view(), name="task-calendar"),
    path("api/v1/focus-sessions/", FocusSessionsView.as_view(), name="focus-sessions"),
    path("api/v1/", include(router.urls)),
]
