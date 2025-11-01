# appointments/serializers.py
from rest_framework import serializers
from .models import Appointment
from django.db.models import Q


class AppointmentSerializer(serializers.ModelSerializer):
    """
    Serializer for appointments.
    Handles both patient-linked and 'block time' appointments.
    """

    # Optional read-only display fields
    patient_name = serializers.SerializerMethodField()
    provider_name = serializers.CharField(source="provider.__str__", read_only=True)
    office_display = serializers.CharField(source="get_office_display", read_only=True)

    class Meta:
        model = Appointment
        fields = [
            "id",
            "patient",
            "provider",
            "office",
            "office_display",
            "appointment_type",
            "color_code",
            "chief_complaint",
            "date",
            "start_time",
            "end_time",
            "duration",
            "is_recurring",
            "repeat_days",
            "repeat_interval_weeks",
            "repeat_end_date",
            "repeat_occurrences",
            "created_at",
            "updated_at",
            "patient_name",
            "provider_name",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    # ---- Derived Display Fields ----
    def get_patient_name(self, obj):
        """Return the patient's string representation or None."""
        return str(obj.patient) if obj.patient else None

    # ---- Validation Rules ----
    def validate(self, data):
        """
        Ensure logical appointment rules:
        - End time must be after start time.
        - Patient required unless it's a block time.
        """
        start = data.get("start_time")
        end = data.get("end_time")
        patient = data.get("patient")

        # Time logic
        if start and end and end <= start:
            raise serializers.ValidationError(
                {"end_time": "End time must be after start time."}
            )

        # Patient logic (allow None only for block time)
        if not patient and data.get("appointment_type") != "Block Time":
            raise serializers.ValidationError(
                {"patient": "Patient is required unless creating a block time."}
            )
        
        # Check for overlaps with same provider + date
        if start and end and data.get("provider"):
            overlapping = Appointment.objects.filter(
                provider=data["provider"],
                date=data["date"],
            ).filter(
                Q(start_time__lt=end) & Q(end_time__gt=start)
            )

            if self.instance:
                overlapping = overlapping.exclude(pk=self.instance.pk)

            if overlapping.exists():
                raise serializers.ValidationError(
                    {"non_field_errors": ["This time overlaps with another appointment or block time."]}
                )

        return data
