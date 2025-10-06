from django.db import models
from django.contrib.auth.models import User
import random


class Provider(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="provider_profile", null=True, blank=True)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    specialty = models.CharField(max_length=100, blank=True, null=True)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=20, blank=True, null=True)
    profile_picture = models.ImageField(upload_to="providers/", blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if self.user and not self.user.username:
            base = f"{self.first_name[0].lower()}{self.last_name.lower()}"
            username = base
            while User.objects.filter(username=username).exists():
                username = f"{base}{random.randint(1, 9999)}"
            self.user.username = username
            self.user.save()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.first_name} {self.last_name}"