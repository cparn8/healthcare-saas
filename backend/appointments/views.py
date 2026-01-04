from rest_framework import viewsets, permissions, filters
from rest_framework.pagination import PageNumberPagination
from rest_framework.exceptions import ValidationError

from .models import Appointment
from .serializers import AppointmentSerializer
from schedule.models import ScheduleSettings


class AppointmentPagination(PageNumberPagination):
    """
    Appointments are dense time-series data.
    Use a larger page size to reduce request fan-out in schedule views.
    """
    page_size = 200
    page_size_query_param = "page_size"
    max_page_size = 500


class AppointmentViewSet(viewsets.ModelViewSet):
    """
    Provides list, create, retrieve, update, and delete for appointments.
    """
    queryset = Appointment.objects.all().order_by("-start_time")
    serializer_class = AppointmentSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = AppointmentPagination

    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["patient__first_name", "patient__last_name", "chief_complaint"]
    ordering_fields = ["start_time", "end_time", "created_at", "status", "date"]
    filterset_fields = ["provider", "office", "status"]

    def perform_create(self, serializer):
        """
        Create appointment using validated serializer data only.
        Provider must be provided by the client payload (source of truth).
        Applies appointment type defaults from ScheduleSettings.appointment_types.
        """
        provider = serializer.validated_data.get("provider")
        if not provider:
            raise ValidationError({"provider": "Provider is required."})

        appt_type = serializer.validated_data.get("appointment_type", "") or ""
        color = serializer.validated_data.get("color_code") or "#3B82F6"
        duration = serializer.validated_data.get("duration") or 30

        ss = ScheduleSettings.objects.first()
        if ss and isinstance(ss.appointment_types, list):
            match = next(
                (t for t in ss.appointment_types if t.get("name") == appt_type),
                None,
            )
            if match:
                color = match.get("color_code", color)
                duration = match.get("default_duration", duration)

        serializer.save(color_code=color, duration=duration)

    def get_queryset(self):
        qs = super().get_queryset()

        # ---- Office Filtering ----
        office = self.request.query_params.get("office")
        if office:
            qs = qs.filter(office__iexact=str(office).strip())

        # ---- Single-provider filter (backward compatible) ----
        provider = self.request.query_params.get("provider")
        if provider:
            qs = qs.filter(provider_id=provider)

        # ---- Multi-provider filter (schedule view) ----
        provider_ids = self.request.query_params.getlist("providers")
        if provider_ids:
            qs = qs.filter(provider_id__in=provider_ids)

        # ---- Date Range Filtering ----
        start_date = self.request.query_params.get("start_date")
        end_date = self.request.query_params.get("end_date")
        if start_date and end_date:
            qs = qs.filter(date__gte=start_date, date__lte=end_date)

        return qs
