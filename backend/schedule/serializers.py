from rest_framework import serializers
from .models import ScheduleSettings, default_business_hours, default_week

WEEKDAYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"]

def normalize_settings(payload: dict) -> dict:
    """
    Deep-normalize incoming settings so DB always stays valid.
    """
    data = payload or {}

    # --- business_hours ---
    bh = data.get("business_hours") or {}
    # ensure offices
    for office in ("north", "south"):
        if office not in bh or not isinstance(bh.get(office), dict):
            bh[office] = default_week()
        else:
            # ensure weekdays
            for d in WEEKDAYS:
                if d not in bh[office] or not isinstance(bh[office][d], dict):
                    bh[office][d] = {"open": True, "start": "08:00", "end": "17:00"}
                else:
                    # coerce fields
                    day = bh[office][d]
                    day["open"] = bool(day.get("open", True))
                    day["start"] = str(day.get("start", "08:00"))
                    day["end"] = str(day.get("end", "17:00"))
    data["business_hours"] = bh

    # --- appointment_types ---
    types = data.get("appointment_types")
    if not isinstance(types, list):
        types = []
    normalized_types = []
    for t in types:
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
        if not isinstance(color, str) or len(color) != 7 or color[0] != "#":
            color = "#000000"
        # (Optionally tighten hex validation)
        normalized_types.append(
            {"name": name, "default_duration": dur, "color_code": color}
        )
    data["appointment_types"] = normalized_types

    return data


class ScheduleSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = ScheduleSettings
        fields = ["id", "business_hours", "appointment_types", "updated_at"]
        read_only_fields = ["id", "updated_at"]

    def to_internal_value(self, data):
        # Normalize BEFORE validation so .validate() receives a correct shape
        normalized = normalize_settings(dict(data))
        return super().to_internal_value(normalized)

    def validate(self, attrs):
        # Final sanity: ensure business_hours shape has both offices & weekdays
        bh = attrs.get("business_hours") or {}
        for office in ("north", "south"):
            if office not in bh:
                raise serializers.ValidationError({"business_hours": f"Missing '{office}'"})
            for d in WEEKDAYS:
                if d not in bh[office]:
                    raise serializers.ValidationError({"business_hours": f"Missing day '{d}' in '{office}'"})
        return attrs
