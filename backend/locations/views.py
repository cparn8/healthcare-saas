# backend/locations/views.py
from rest_framework import viewsets, generics, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import BusinessSettings, Location, LocationHours
from .serializers import (
    BusinessSettingsSerializer,
    LocationSerializer,
    LocationHoursSerializer,
)


class IsAdminOrReadOnly(permissions.BasePermission):
    """
    Read for any authenticated user, write for admins only.
    Adjust as needed based on your auth scheme.
    """

    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return request.user and request.user.is_authenticated
        return request.user and request.user.is_staff


class BusinessSettingsView(generics.RetrieveUpdateAPIView):
    """
    Singleton-style endpoint for BusinessSettings.

    GET   /api/business/settings/
    PATCH /api/business/settings/
    """

    serializer_class = BusinessSettingsSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminOrReadOnly]

    def get_object(self):
        obj, _ = BusinessSettings.objects.get_or_create(pk=1)
        return obj


class LocationViewSet(viewsets.ModelViewSet):
    """
    CRUD for locations.

    - GET    /api/locations/
    - POST   /api/locations/
    - GET    /api/locations/{id}/
    - PATCH  /api/locations/{id}/
    - DELETE /api/locations/{id}/

    Plus:

    - PATCH  /api/locations/{id}/hours/   (bulk-update hours for a location)
    """

    queryset = Location.objects.all().order_by("name")
    serializer_class = LocationSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminOrReadOnly]

    @action(detail=True, methods=["patch"], url_path="hours")
    def update_hours(self, request, pk=None):
        """
        Bulk update hours for this location.

        Expected payload shape:
        {
          "hours": [
            { "weekday": "mon", "open": true,  "start": "08:00", "end": "17:00" },
            { "weekday": "tue", "open": false, "start": "08:00", "end": "17:00" },
            ...
          ]
        }
        """
        location = self.get_object()
        hours_data = request.data.get("hours", [])

        if not isinstance(hours_data, list):
            return Response(
                {"detail": "Expected 'hours' to be a list."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = LocationHoursSerializer(data=hours_data, many=True)
        serializer.is_valid(raise_exception=True)

        # Upsert each weekday
        seen_weekdays = set()
        for item in serializer.validated_data:
            weekday = item["weekday"]
            seen_weekdays.add(weekday)

            LocationHours.objects.update_or_create(
                location=location,
                weekday=weekday,
                defaults={
                    "open": item["open"],
                    "start": item["start"],
                    "end": item["end"],
                },
            )

        # Optional: you could enforce that all 7 weekdays are present.
        # For now we allow partial updates; missing days keep existing values.

        location.refresh_from_db()
        return Response(LocationSerializer(location).data)

    def destroy(self, request, *args, **kwargs):
        """
        Prevent deletion if any Appointment rows still reference this location's slug.
        """
        instance = self.get_object()

        # Lazy import to avoid circular dependencies.
        from appointments.models import Appointment

        in_use = Appointment.objects.filter(office=instance.slug).exists()
        if in_use:
            return Response(
                {
                    "detail": (
                        "Cannot delete this location because there are existing "
                        "appointments referencing it."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        return super().destroy(request, *args, **kwargs)
