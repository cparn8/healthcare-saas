from django.db import models

def default_day():
    return {"open": True, "start": "08:00", "end": "17:00"}

def default_week():
    return {
        "mon": default_day(),
        "tue": default_day(),
        "wed": default_day(),
        "thu": default_day(),
        "fri": default_day(),
        "sat": default_day(),
        "sun": default_day(),
    }

def default_business_hours():
    return {
        "north": default_week(),
        "south": default_week(),
    }

class ScheduleSettings(models.Model):
    """
    Singleton-ish site settings for schedule config.
    """
    business_hours = models.JSONField(default=default_business_hours)
    # [{ name: str, default_duration: 15|30|60, color_code: "#RRGGBB" }, ...]
    appointment_types = models.JSONField(default=list)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Schedule Settings (updated {self.updated_at:%Y-%m-%d %H:%M})"

    class Meta:
        verbose_name = "Schedule Settings"
        verbose_name_plural = "Schedule Settings"
