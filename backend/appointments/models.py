from django.db import models
from patients.models import Patient

# Create your models here.
class Appointment(models.Model):
    patient =models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='appointments')
    date = models.DateTimeField()
    reason = models.CharField(max_length=255)
    status = models.CharField(max_length=20, choices=[('scheduled', 'Scheduled'), ('completed', 'Completed'), ('cancelled', 'Cancelled')], default='scheduled')

    def __str__(self):
        return f"{self.patient.first_name} - {self.date.strftime('%Y-%m-%d %H:%M')}"