import uuid
from django.db import models


def generate_prn():
    return str(uuid.uuid4())[:8].upper()


class Patient(models.Model):
    GENDER_CHOICES = [
        ("Male", "Male"),
        ("Female", "Female"),
        ("Nonbinary", "Nonbinary"),
        ("Other", "Other"),
        ("Prefer not to say", "Prefer not to say"),
    ]

    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    date_of_birth = models.DateField()
    gender = models.CharField(
        max_length=32, choices=GENDER_CHOICES, blank=True, null=True
    )
    email = models.EmailField(blank=True, null=True)
    phone = models.CharField(max_length=20, blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    prn = models.CharField(max_length=8, unique=True, default=generate_prn, editable=False)

    class Meta:
        ordering = ["last_name", "first_name"]

    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.prn})"
