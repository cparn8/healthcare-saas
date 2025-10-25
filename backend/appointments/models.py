from django.db import models
from django.utils import timezone
from patients.models import Patient
from providers.models import Provider


class Appointment(models.Model):
    # ---------------------------
    # Choices
    # ---------------------------
    OFFICE_CHOICES = [
        ("north", "North Office"),
        ("south", "South Office"),
    ]

    # ---------------------------
    # Core Relationships
    # ---------------------------
    patient = models.ForeignKey(
        Patient,
        on_delete=models.CASCADE,
        related_name="appointments",
        null=True,  # optional for "Block time" tab
        blank=True,
        help_text="Linked patient if this is a patient appointment. Null for block times."
    )

    provider = models.ForeignKey(
        Provider,
        on_delete=models.CASCADE,
        related_name="appointments"
    )

    # ---------------------------
    # Office Info
    # ---------------------------
    office = models.CharField(
        max_length=20,
        choices=OFFICE_CHOICES,
        default="north",
        help_text="Which office location this appointment belongs to."
    )

    # ---------------------------
    # Appointment Metadata
    # ---------------------------
    appointment_type = models.CharField(
        max_length=100,
        default="Wellness Exam",  # placeholder until Settings tab allows customization
        help_text="Type of appointment (e.g., Wellness Exam, Follow-up, Consultation)."
    )

    color_code = models.CharField(
        max_length=20,
        default="#FF6B6B",  # placeholder color (red tone)
        help_text="Color used for this appointment type on the schedule."
    )

    chief_complaint = models.TextField(
        blank=True,
        help_text="Brief description of the patient's reason for visit."
    )

    # ---------------------------
    # Time Information
    # ---------------------------
    date = models.DateField(default=timezone.now)
    start_time = models.TimeField(null=True, blank=True)
    end_time = models.TimeField(null=True, blank=True)
    duration = models.PositiveIntegerField(default=30, help_text="Duration in minutes.")

    # ---------------------------
    # Recurrence (repeat visits)
    # ---------------------------
    is_recurring = models.BooleanField(default=False)
    repeat_days = models.JSONField(
        null=True,
        blank=True,
        help_text="Array of days (e.g. ['Mon', 'Wed', 'Fri']) if recurring."
    )
    repeat_interval_weeks = models.PositiveSmallIntegerField(
        default=1,
        help_text="Number of weeks between recurring appointments."
    )
    repeat_end_date = models.DateField(null=True, blank=True)
    repeat_occurrences = models.PositiveIntegerField(null=True, blank=True)

    # ---------------------------
    # System Fields
    # ---------------------------
    created_at = models.DateTimeField(auto_now_add=True, null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True, null=True, blank=True)

    # ---------------------------
    # Derived Fields & String Representation
    # ---------------------------
    def __str__(self):
        if self.patient:
            return f"{self.patient} with {self.provider} on {self.date}"
        return f"Block time for {self.provider} on {self.date}"

    class Meta:
        ordering = ["date", "start_time"]
