# backend/appointments/models.py

from django.db import models
from django.utils import timezone
from locations.models import Location
from patients.models import Patient
from providers.models import Provider


class Appointment(models.Model):
    # ---------------------------
    # Choices
    # ---------------------------
    STATUS_CHOICES = [
        ("pending", "Pending arrival"),
        ("arrived", "Arrived"),
        ("in_room", "In room"),
        ("no_show", "No show"),
        ("cancelled", "Cancelled"),
        ("in_lobby", "In lobby"),
        ("seen", "Seen"),
        ("tentative", "Tentative"),
    ]

    INTAKE_STATUS_CHOICES = [
        ("not_submitted", "Not Submitted"),
        ("submitted", "Submitted"),
    ]

    # ---------------------------
    # Core Relationships
    # ---------------------------
    patient = models.ForeignKey(
        Patient,
        on_delete=models.CASCADE,
        related_name="appointments",
        null=True,
        blank=True,
        help_text="Linked patient if this is a patient appointment. Null for block times."
    )

    provider = models.ForeignKey(
        Provider,
        on_delete=models.CASCADE,
        related_name="appointments"
    )

    # ---------------------------
    # Location (normalized)
    # ---------------------------
    location = models.ForeignKey(
        Location,
        on_delete=models.PROTECT,
        related_name="appointments",
        help_text="Normalized location reference for this appointment.",
        null=True,          # TEMPORARY
        blank=True,         # TEMPORARY
    )

    # ---------------------------
    # Location (legacy / slug)
    # ---------------------------
    office = models.CharField(
        max_length=64,
        help_text="Location slug for this appointment (dynamic)."
    )

    # ---------------------------
    # Appointment Metadata
    # ---------------------------
    appointment_type = models.CharField(
        max_length=100,
        default="Wellness Exam",
        help_text="Type of appointment (e.g., Wellness Exam, Follow-up, Consultation)."
    )

    is_block = models.BooleanField(
        default=False,
        help_text="True if this record represents a provider block of time."
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="pending",
        help_text="Workflow status used on the schedule Appointments tab.",
    )

    room = models.CharField(
        max_length=6,
        blank=True,
        default="",
        help_text="Optional room number when status is 'in_room' (e.g. '2' or '309B').",
    )

    intake_status = models.CharField(
        max_length=20,
        choices=INTAKE_STATUS_CHOICES,
        default="not_submitted",
        help_text="Intake form status used on the schedule Appointments tab.",
    )

    notes = models.TextField(blank=True, help_text="Internal staff notes.")

    color_code = models.CharField(
        max_length=20,
        default="#FF6B6B",
        help_text="Color used for this appointment type on the schedule."
    )

    chief_complaint = models.TextField(blank=True)

    date = models.DateField(default=timezone.now)
    start_time = models.TimeField(null=True, blank=True)
    end_time = models.TimeField(null=True, blank=True)
    duration = models.PositiveIntegerField(default=30)

    is_recurring = models.BooleanField(default=False)
    repeat_days = models.JSONField(null=True, blank=True)
    repeat_interval_weeks = models.PositiveSmallIntegerField(default=1)
    repeat_end_date = models.DateField(null=True, blank=True)
    repeat_occurrences = models.PositiveIntegerField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True, null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True, null=True, blank=True)

    class Meta:
        ordering = ["date", "start_time"]
