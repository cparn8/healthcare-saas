
from rest_framework import viewsets, permissions, filters
from .models import Appointment
from .serializers import AppointmentSerializer


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
        # Auto-assign the logged-in provider if not manually selected
        provider = getattr(self.request.user, "provider", None)
        serializer.save(provider=provider)
