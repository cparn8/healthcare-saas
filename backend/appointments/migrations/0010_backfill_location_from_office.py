from django.db import migrations


def backfill_location_from_office(apps, schema_editor):
    Appointment = apps.get_model("appointments", "Appointment")
    Location = apps.get_model("locations", "Location")

    # Build slug → Location map
    location_map = {
        loc.slug: loc
        for loc in Location.objects.all()
    }

    for appt in Appointment.objects.filter(location__isnull=True):
        if appt.office and appt.office in location_map:
            appt.location = location_map[appt.office]
            appt.save(update_fields=["location"])


class Migration(migrations.Migration):

    dependencies = [
        ("appointments", "0009_appointment_location"),
        ("locations", "0002_seed_locations_from_schedule"),
    ]

    operations = [
        migrations.RunPython(
            backfill_location_from_office,
            migrations.RunPython.noop,
        ),
    ]