# backend/locations/migrations/0002_seed_locations_from_schedule.py
from django.db import migrations


DEFAULT_DAY = {
    "open": True,
    "start": "08:00",
    "end": "17:00",
}

WEEKDAYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"]


def seed_locations_from_schedule(apps, schema_editor):
    Location = apps.get_model("locations", "Location")
    LocationHours = apps.get_model("locations", "LocationHours")
    BusinessSettings = apps.get_model("locations", "BusinessSettings")
    ScheduleSettings = apps.get_model("schedule", "ScheduleSettings")

    # Ensure a BusinessSettings row exists
    BusinessSettings.objects.get_or_create(
        pk=1,
        defaults={
            "name": "",
            "show_name_in_nav": True,
        },
    )

    settings = (
        ScheduleSettings.objects.all()
        .order_by("-updated_at")
        .first()
    )

    # Safely pull business_hours if present; otherwise None
    business_hours = getattr(settings, "business_hours", None) or {}

    def upsert_location(name: str, slug: str):
        location, _created = Location.objects.get_or_create(
            slug=slug,
            defaults={"name": name},
        )

        # Use hours from schedule settings if present, else default
        source_hours = business_hours.get(slug) if isinstance(business_hours, dict) else None

        for day in WEEKDAYS:
            src = (source_hours or {}).get(day) if source_hours else None

            open_val = bool((src or {}).get("open", DEFAULT_DAY["open"]))
            start_val = (src or {}).get("start", DEFAULT_DAY["start"])
            end_val = (src or {}).get("end", DEFAULT_DAY["end"])

            LocationHours.objects.update_or_create(
                location=location,
                weekday=day,
                defaults={
                    "open": open_val,
                    "start": start_val,
                    "end": end_val,
                },
            )

    # Seed the two legacy offices
    upsert_location("North Office", "north")
    upsert_location("South Office", "south")


class Migration(migrations.Migration):

    dependencies = [
        ("schedule", "0001_initial"),   # adjust to the latest schedule migration
        ("locations", "0001_initial"),
    ]

    operations = [
        migrations.RunPython(
            seed_locations_from_schedule,
            migrations.RunPython.noop,
        ),
    ]
