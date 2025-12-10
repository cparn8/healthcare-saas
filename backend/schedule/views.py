from rest_framework import viewsets, permissions
from rest_framework.response import Response
from .models import ScheduleSettings
from .serializers import ScheduleSettingsSerializer
from locations.models import Location
from locations.serializers import LocationSerializer

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
    
    def retrieve(self, request, *args, **kwargs):
        """
        Extend the ScheduleSettings output with dynamic_locations.
        This preserves backward compatibility with existing office-based logic.
        """
        instance = self.get_object()
        data = self.get_serializer(instance).data

            # Add dynamic locations + hours
        data["dynamic_locations"] = LocationSerializer(
            Location.objects.filter(is_active=True).order_by("name"),
            many=True
        ).data

        return Response(data)

