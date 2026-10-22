from rest_framework import serializers

from .models import FocusSession, Task


class TaskSerializer(serializers.ModelSerializer):
    title = serializers.CharField(max_length=180, trim_whitespace=True)
    description = serializers.CharField(max_length=1200, allow_blank=True, required=False)
    category = serializers.CharField(max_length=48, trim_whitespace=True, required=False)

    class Meta:
        model = Task
        fields = [
            "id",
            "title",
            "description",
            "status",
            "priority",
            "category",
            "due_date",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def validate_title(self, value: str) -> str:
        value = value.strip()
        if not value:
            raise serializers.ValidationError("عنوان المهمة مطلوب.")
        return value

    def validate_category(self, value: str) -> str:
        value = value.strip()
        if not value:
            raise serializers.ValidationError("اكتب تصنيفاً أو استخدم «عام».")
        return value


class FocusSessionCreateSerializer(serializers.Serializer):
    task_id = serializers.PrimaryKeyRelatedField(
        source="task", queryset=Task.objects.all(), required=True
    )
    duration_minutes = serializers.IntegerField(min_value=1, max_value=180)

    def validate_task_id(self, task: Task) -> Task:
        if task.status == Task.Status.DONE:
            raise serializers.ValidationError("لا يمكن تسجيل جلسة تركيز لمهمة مكتملة.")
        return task

    def create(self, validated_data):
        task = validated_data["task"]
        return FocusSession.objects.create(
            task=task,
            task_title=task.title,
            duration_minutes=validated_data["duration_minutes"],
        )


class FocusSessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = FocusSession
        fields = ["id", "task", "task_title", "duration_minutes", "completed_at"]
        read_only_fields = fields
