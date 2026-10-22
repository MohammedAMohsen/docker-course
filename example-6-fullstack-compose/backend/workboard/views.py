import calendar
from datetime import datetime

from django.db.models import Count, Q, Sum
from django.utils import timezone
from rest_framework import filters, status, viewsets
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import FocusSession, Task
from .serializers import (
    FocusSessionCreateSerializer,
    FocusSessionSerializer,
    TaskSerializer,
)


class TaskViewSet(viewsets.ModelViewSet):
    serializer_class = TaskSerializer
    queryset = Task.objects.all()
    search_fields = ["title", "description", "category"]
    ordering_fields = ["created_at", "updated_at", "due_date", "title", "priority", "status"]
    ordering = ["-created_at", "-id"]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]

    def get_queryset(self):
        queryset = super().get_queryset()
        status_value = self.request.query_params.get("status")
        priority_value = self.request.query_params.get("priority")
        category_value = self.request.query_params.get("category")

        valid_statuses = {value for value, _ in Task.Status.choices}
        valid_priorities = {value for value, _ in Task.Priority.choices}
        if status_value:
            if status_value not in valid_statuses:
                return queryset.none()
            queryset = queryset.filter(status=status_value)
        if priority_value:
            if priority_value not in valid_priorities:
                return queryset.none()
            queryset = queryset.filter(priority=priority_value)
        if category_value:
            queryset = queryset.filter(category__iexact=category_value.strip())
        return queryset


class SummaryView(APIView):
    def get(self, request):
        today = timezone.localdate()
        totals = Task.objects.aggregate(
            total=Count("id"),
            todo=Count("id", filter=Q(status=Task.Status.TODO)),
            in_progress=Count("id", filter=Q(status=Task.Status.IN_PROGRESS)),
            completed=Count("id", filter=Q(status=Task.Status.DONE)),
        )
        totals["overdue"] = Task.objects.filter(
            due_date__lt=today,
            status__in=[Task.Status.TODO, Task.Status.IN_PROGRESS],
        ).count()
        totals["due_today"] = Task.objects.filter(
            due_date=today,
            status__in=[Task.Status.TODO, Task.Status.IN_PROGRESS],
        ).count()
        totals["completion_rate"] = (
            round(totals["completed"] * 100 / totals["total"])
            if totals["total"]
            else 0
        )
        focus_today = FocusSession.objects.filter(completed_at__date=today).aggregate(
            minutes=Sum("duration_minutes"), count=Count("id")
        )
        totals["focus_minutes_today"] = focus_today["minutes"] or 0
        totals["focus_sessions_today"] = focus_today["count"]
        return Response(totals)


class CalendarTasksView(APIView):
    """Return dated tasks for one month; the bounded response powers the calendar."""

    def get(self, request):
        month_value = request.query_params.get("month")
        if month_value is None:
            month_value = timezone.localdate().strftime("%Y-%m")
        try:
            month_start = datetime.strptime(month_value, "%Y-%m").date().replace(day=1)
        except (TypeError, ValueError):
            return Response(
                {"month": ["استخدم صيغة الشهر YYYY-MM."]},
                status=status.HTTP_400_BAD_REQUEST,
            )
        last_day = calendar.monthrange(month_start.year, month_start.month)[1]
        month_end = month_start.replace(day=last_day)
        tasks = Task.objects.filter(
            due_date__gte=month_start,
            due_date__lte=month_end,
        ).order_by("due_date", "-created_at", "-id")
        return Response(
            {
                "month": month_value,
                "count": tasks.count(),
                "results": TaskSerializer(tasks, many=True).data,
            }
        )


class FocusSessionsView(APIView):
    def get(self, request):
        sessions = FocusSession.objects.select_related("task").all()[:12]
        return Response(FocusSessionSerializer(sessions, many=True).data)

    def post(self, request):
        serializer = FocusSessionCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        session = serializer.save()
        return Response(
            FocusSessionSerializer(session).data,
            status=status.HTTP_201_CREATED,
        )
