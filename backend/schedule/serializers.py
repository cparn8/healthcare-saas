# backend/schedule/serializers.py
from rest_framework import serializers
from .models import ScheduleSettings
import re


def normalize_appointment_types(payload: dict) -> list:
    """
    Normalize appointment_types only.
    We intentionally do NOT normalize or validate business_hours here because
    LocationHours is the source of truth for hours.
    """
    data = payload or {}
    types = data.get("appointment_types")
    HEX_RE = re.compile(r"^#[0-9A-Fa-f]{6}$")

    if not isinstance(types, list):
        types = []

    normalized_types = []
    for t in types:
        if not isinstance(t, dict):
            t = {}

        name = (t.get("name") or "").strip()
        if not name:
            name = "Untitled"

        dur = t.get("default_duration", 30)
        try:
            dur = int(dur)
        except Exception:
            dur = 30
        if dur not in (15, 30, 60):
            dur = 30

        color = t.get("color_code") or "#000000"
        if not isinstance(color, str) or not HEX_RE.match(color):
            color = "#000000"

        normalized_types.append(
            {"name": name, "default_duration": dur, "color_code": color}
        )

    return normalized_types


class ScheduleSettingsSerializer(serializers.ModelSerializer):
    """
    ScheduleSettings stores non-hour schedule configuration.
    Location hours are authoritative via LocationHours and are injected
    dynamically by the ViewSet on reads.

    On writes, accept appointment_types (normalized) and ignore business_hours.
    """

    class Meta:
        model = ScheduleSettings
        fields = ["id", "appointment_types", "updated_at"]
        read_only_fields = ["id", "updated_at"]

    def to_internal_value(self, data):
        # Normalize appointment_types BEFORE validation.
        incoming = dict(data)
        incoming["appointment_types"] = normalize_appointment_types(incoming)
        # Intentionally drop any business_hours passed from frontend (if any).
        incoming.pop("business_hours", None)
        return super().to_internal_value(incoming)
