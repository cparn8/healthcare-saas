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
    allow_overlap = serializers.BooleanField(write_only=True, required=False, default=False)

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
            "allow_overlap",
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
        - Optionally allow overlapping appointments if allow_overlap=True.
        """
        start = data.get("start_time")
        end = data.get("end_time")
        patient = data.get("patient")

        # --- Time validation ---
        if start and end and end <= start:
            raise serializers.ValidationError(
                {"end_time": "End time must be after start time."}
            )

        # --- Patient validation ---
        if not patient and data.get("appointment_type") != "Block Time":
            raise serializers.ValidationError(
                {"patient": "Patient is required unless creating a block time."}
            )

        # --- Overlap validation ---
        allow_overlap = data.get("allow_overlap")
        if allow_overlap is None:
            # handle case where initial_data contains it (common for write-only fields)
            allow_overlap = self.initial_data.get("allow_overlap", False)

        if not allow_overlap and start and end and data.get("provider") and data.get("date"):
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
    
    def create(self, validated_data):
        # Remove 'allow_overlap' if present since it's not a DB field
        validated_data.pop("allow_overlap", None)
        return super().create(validated_data)


