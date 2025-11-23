# appointments/serializers.py
from rest_framework import serializers
from .models import Appointment
from django.db.models import Q
from datetime import datetime, time
from django.utils import timezone
from providers.models import Provider  # needed for PrimaryKeyRelatedField


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

    # --- IMPORTANT FIXES ---
    provider = serializers.PrimaryKeyRelatedField(
        queryset=Provider.objects.all(),
        required=True
    )

    status = serializers.CharField(required=False)
    room = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    intake_status = serializers.CharField(required=False)

    notes = serializers.CharField(required=False, allow_blank=True, allow_null=True)

    class Meta:
        model = Appointment
        fields = [
            "id",
            "patient",
            "provider",
            "office",
            "office_display",
            "appointment_type",
            "is_block",
            "status",
            "room",
            "intake_status",
            "notes",
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
        appointment_type = (data.get("appointment_type") or "").lower()
        block_reasons = ["block time", "out of office", "meeting", "surgery", "lunch", "other"]

        if not patient and appointment_type not in block_reasons:
            raise serializers.ValidationError(
                {"patient": "Patient is required unless creating a block time."}
            )

        # --- Overlap validation ---
        allow_overlap = data.get("allow_overlap")
        if allow_overlap is None:
            allow_overlap = self.initial_data.get("allow_overlap", False)

        if (
            not allow_overlap
            and start
            and end
            and data.get("provider")
            and data.get("date")
            and data.get("office")
        ):
            overlapping = Appointment.objects.filter(
                provider=data["provider"],
                date=data["date"],
                office=data["office"],  # Only conflict if same office
            ).filter(
                Q(start_time__lt=end) & Q(end_time__gt=start)
            )

            if self.instance:
                overlapping = overlapping.exclude(pk=self.instance.pk)

            if overlapping.exists():
                raise serializers.ValidationError(
                    {
                        "non_field_errors": [
                            f"This time overlaps with another appointment in {data['office']}."
                        ]
                    }
                )


        # --- Repeat logic validation ---
        if data.get("is_recurring"):
            start_date = data.get("date")
            end_date = data.get("repeat_end_date")
            occurrences = data.get("repeat_occurrences")
            repeat_days = data.get("repeat_days", [])

            if end_date and start_date and end_date < start_date:
                raise serializers.ValidationError({
                    "repeat_end_date": "Repeat end date cannot be before the initial appointment date."
                })

            if occurrences is not None and occurrences < 1:
                raise serializers.ValidationError({
                    "repeat_occurrences": "Must have at least one repeat occurrence."
                })

            if not repeat_days:
                raise serializers.ValidationError({
                    "repeat_days": "At least one day must be selected for recurring appointments."
                })

        return data

    def to_representation(self, instance):
        """
        Ensure date fields are returned as local (TIME_ZONE) midnights
        instead of naive UTC midnights, preventing one-day drift in frontend.
        """
        data = super().to_representation(instance)

        if "date" in data and data["date"]:
            try:
                local_dt = timezone.localtime(
                    timezone.make_aware(datetime.combine(instance.date, time.min))
                )
                data["date"] = local_dt.date().isoformat()
            except Exception:
                pass

        return data

    def create(self, validated_data):
        validated_data.pop("allow_overlap", None)

        # Automatically assign gray color for block times
        appt_type = (validated_data.get("appointment_type") or "").lower()
        if appt_type in ["block time", "out of office", "meeting", "surgery", "lunch", "other"]:
            validated_data["color_code"] = "#737373"

        return super().create(validated_data)

    def update(self, instance, validated_data):
        # --- Status rule: clear room on "seen" ---
        new_status = validated_data.get("status", instance.status)
        if new_status == "seen":
            validated_data["room"] = ""

        # --- Intake status default rule ---
        if "intake_status" not in validated_data:
            validated_data["intake_status"] = instance.intake_status

        return super().update(instance, validated_data)
