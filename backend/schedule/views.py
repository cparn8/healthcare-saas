# backend/schedule/views.py
from rest_framework import viewsets, permissions
from rest_framework.response import Response

from .models import ScheduleSettings
from .serializers import ScheduleSettingsSerializer

from locations.models import Location, LocationHours
from locations.serializers import LocationSerializer

WEEKDAYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"]
DEFAULT_DAY = {"open": True, "start": "08:00", "end": "17:00"}


def build_business_hours_from_locations() -> dict:
    """
    Authoritative business_hours projection from LocationHours.
    Shape:
      {
        "<location_slug>": {
          "mon": {open,start,end}, ...
        }
      }
    """
    hours_by_slug: dict = {}

    locations = Location.objects.filter(is_active=True).order_by("name")
    for loc in locations:
        loc_map = {d: dict(DEFAULT_DAY) for d in WEEKDAYS}

        rows = LocationHours.objects.filter(location=loc)
        for h in rows:
            loc_map[h.weekday] = {
                "open": bool(h.open),
                "start": h.start.strftime("%H:%M"),
                "end": h.end.strftime("%H:%M"),
            }

        hours_by_slug[loc.slug] = loc_map

    return hours_by_slug


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
        if not qs.exists():
            ScheduleSettings.objects.create()
            qs = super().get_queryset()
        return qs

    def _inject_location_projection(self, base_data: dict) -> dict:
        """
        Backend truth:
        - appointment_types come from ScheduleSettings
        - business_hours come from LocationHours
        - dynamic_locations come from Location
        """
        base_data["business_hours"] = build_business_hours_from_locations()
        base_data["dynamic_locations"] = LocationSerializer(
            Location.objects.filter(is_active=True).order_by("name"),
            many=True,
        ).data
        return base_data

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        data = self.get_serializer(instance).data
        return Response(self._inject_location_projection(data))

    def list(self, request, *args, **kwargs):
        qs = self.get_queryset()
        serializer = self.get_serializer(qs, many=True)
        data = serializer.data

        # In practice there is one row. Inject projections into each item for consistency.
        if isinstance(data, list):
            data = [self._inject_location_projection(dict(item)) for item in data]

        return Response(data)
