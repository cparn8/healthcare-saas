from rest_framework import viewsets, permissions, filters
from .models import Appointment
from .serializers import AppointmentSerializer
from rest_framework.exceptions import ValidationError


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

        serializer.save(provider=provider)
