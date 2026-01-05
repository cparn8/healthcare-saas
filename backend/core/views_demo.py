# backend/core/views_demo.py
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from .demo_reset import reset_and_seed_demo_data
from .models import AuditLog


class DemoResetView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        # Admin-only
        if not (request.user and request.user.is_authenticated and request.user.is_staff):
            return Response({"detail": "Admin only."}, status=status.HTTP_403_FORBIDDEN)

        summary = reset_and_seed_demo_data()

        try:
            AuditLog.objects.create(
                action="demo_reset",
                actor=request.user,
                metadata={
                    "window_start": summary.get("window_start"),
                    "window_end": summary.get("window_end"),
                    "providers": summary.get("providers"),
                    "patients": summary.get("patients"),
                    "appointments": summary.get("appointments"),
                    "blocks": summary.get("blocks"),
                },
            )
        except Exception:
            # Audit logging should never break demo reset.
            pass

        return Response(summary, status=status.HTTP_200_OK)
