from django.db import models
from django.contrib.auth.models import User


class AuditLog(models.Model):
    """
    Lightweight audit trail for high-value actions (ex: demo resets).
    Not a full compliance log — just a professional activity record.
    """
    action = models.CharField(max_length=64)
    actor = models.ForeignKey(User, null=True, blank=True, on_delete=models.SET_NULL)
    created_at = models.DateTimeField(auto_now_add=True)
    metadata = models.JSONField(blank=True, null=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self) -> str:
        actor_str = self.actor.username if self.actor else "unknown"
        return f"{self.action} by {actor_str} @ {self.created_at}"
