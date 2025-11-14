from rest_framework import viewsets, permissions, filters
from .models import Appointment
from .serializers import AppointmentSerializer
from rest_framework.exceptions import ValidationError
from schedule.models import ScheduleSettings


class AppointmentViewSet(viewsets.ModelViewSet):
    """
    Provides list, create, retrieve, update, and delete for appointments.
    """
    queryset = Appointment.objects.all().order_by("-start_time")
    serializer_class = AppointmentSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["patient__first_name", "patient__last_name", "chief_complaint"]
    ordering_fields = ["start_time", "end_time", "created_at", "status", "date"]

    def perform_create(self, serializer):
        """
        Ensure every appointment gets a valid provider, respecting the ID sent from frontend.
        """
        from providers.models import Provider
        from schedule.models import ScheduleSettings

        # Try normal serializer behavior first
        provider = serializer.validated_data.get("provider")

        # Fallback to raw ID in request data if DRF stripped it
        if not provider:
            provider_id = self.request.data.get("provider")
            if provider_id:
                try:
                    provider = Provider.objects.get(pk=int(provider_id))
                except (Provider.DoesNotExist, ValueError):
                    raise ValidationError({"provider": f"Invalid provider ID: {provider_id}"})

        # Still no provider? fallback to logged-in provider
        if not provider and hasattr(self.request.user, "provider"):
            provider = self.request.user.provider

        if not provider:
            raise ValidationError({"provider": "No provider found for this user."})

        # Apply appointment type defaults
        appt_type = serializer.validated_data.get("appointment_type", "")
        color = serializer.validated_data.get("color_code") or "#3B82F6"
        duration = serializer.validated_data.get("duration") or 30

        ss = ScheduleSettings.objects.first()
        if ss and isinstance(ss.appointment_types, list):
            match = next((t for t in ss.appointment_types if t.get("name") == appt_type), None)
            if match:
                color = match.get("color_code", color)
                duration = match.get("default_duration", duration)

        serializer.save(provider=provider, color_code=color, duration=duration)


