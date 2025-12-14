# backend/locations/models.py
from django.db import models
from django.utils.text import slugify


class BusinessSettings(models.Model):
    """
    Global business-level settings (singleton semantics).
    We will always use the first row; you can enforce true singleton later if desired.
    """
    name = models.CharField(max_length=255, blank=True, null=True)
    show_name_in_nav = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self) -> str:
        return self.name or "Business Settings"

DEFAULT_DAY = {
    "open": True,
    "start": "08:00",
    "end": "17:00",
}

WEEKDAYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"]

class Location(models.Model):
    """
    A physical or logical practice location (what you currently call 'north'/'south' offices).
    slug will act as the stable key used by scheduling & appointments.
    """

    name = models.CharField(max_length=255)
    slug = models.SlugField(max_length=50, unique=True, blank=True)

    phone = models.CharField(max_length=50, blank=True, null=True)
    email = models.EmailField(blank=True, null=True)
    address = models.TextField(blank=True, null=True)

    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def ensure_default_hours(self):
        """
        Guarantee that the location has 7 LocationHours rows.
        Called on save() and can be safely re-run.
        """
        existing = {h.weekday: h for h in self.hours.all()}

        to_create = []
        for day in WEEKDAYS:
            if day not in existing:
                to_create.append(LocationHours(
                    location=self,
                    weekday=day,
                    open=DEFAULT_DAY["open"],
                    start=DEFAULT_DAY["start"],
                    end=DEFAULT_DAY["end"],
                ))

        if to_create:
            LocationHours.objects.bulk_create(to_create)


    class Meta:
        ordering = ["name"]

    def __str__(self) -> str:
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug and self.name:
            base = slugify(self.name) or "location"
            candidate = base
            idx = 1

            while Location.objects.filter(slug=candidate).exclude(pk=self.pk).exists():
                idx += 1
                candidate = f"{base}-{idx}"

            self.slug = candidate

        super().save(*args, **kwargs)

        # After saving, ensure hours exist (idempotent)
        self.ensure_default_hours()


class LocationHours(models.Model):
    """
    Per-location, per-weekday hours.
    weekday is a 3-char code: mon, tue, wed, thu, fri, sat, sun.
    """

    WEEKDAY_CHOICES = [
        ("sun", "Sunday"),
        ("mon", "Monday"),
        ("tue", "Tuesday"),
        ("wed", "Wednesday"),
        ("thu", "Thursday"),
        ("fri", "Friday"),
        ("sat", "Saturday"),
    ]

    location = models.ForeignKey(
        Location,
        related_name="hours",
        on_delete=models.CASCADE,
    )
    weekday = models.CharField(max_length=3, choices=WEEKDAY_CHOICES)
    open = models.BooleanField(default=True)
    start = models.TimeField()
    end = models.TimeField()

    class Meta:
        unique_together = ("location", "weekday")
        ordering = ["location", "weekday"]

    def __str__(self) -> str:
        return f"{self.location.slug} {self.weekday} ({'open' if self.open else 'closed'})"
