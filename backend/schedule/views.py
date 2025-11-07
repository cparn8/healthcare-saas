from rest_framework import viewsets, permissions
from .models import ScheduleSettings
from .serializers import ScheduleSettingsSerializer

class ScheduleSettingsViewSet(viewsets.ModelViewSet):
    """
    CRUD for settings. In practice there will be a single row.
    GET /api/schedule-settings/        -> list (usually length 1)
    GET /api/schedule-settings/1/      -> retrieve
    PUT /api/schedule-settings/1/      -> update
    """
    queryset = ScheduleSettings.objects.all().order_by("-updated_at")
    serializer_class = ScheduleSettingsSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = super().get_queryset()
        # Auto-create one if none exist (so the frontend never sees 404)
        if not qs.exists():
            ScheduleSettings.objects.create()
            qs = super().get_queryset()
        return qs
