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
    ordering_fields = ["start_time", "end_time", "created_at"]

    def perform_create(self, serializer):
        """
        Ensure every appointment gets a valid provider.
        Use the logged-in user's linked provider if not explicitly set in the payload.
        """
        provider = serializer.validated_data.get("provider")

        # Fallback to authenticated provider if missing
        if not provider and hasattr(self.request.user, "provider"):
            provider = self.request.user.provider

        if not provider:
            raise ValidationError({"provider": "No provider found for this user."})
        
        # Pull color/duration from ScheduleSettings
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
