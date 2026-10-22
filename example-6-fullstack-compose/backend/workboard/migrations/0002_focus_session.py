# Generated for the Nawa learning project.
import django.db.models.deletion
import django.utils.timezone
from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("workboard", "0001_initial"),
    ]

    operations = [
        migrations.CreateModel(
            name="FocusSession",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("task_title", models.CharField(max_length=180)),
                ("duration_minutes", models.PositiveSmallIntegerField()),
                (
                    "completed_at",
                    models.DateTimeField(db_index=True, default=django.utils.timezone.now),
                ),
                (
                    "task",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name="focus_sessions",
                        to="workboard.task",
                    ),
                ),
            ],
            options={"ordering": ["-completed_at", "-id"]},
        ),
    ]
