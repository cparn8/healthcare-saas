# backend/core/views_demo.py
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from .demo_reset import reset_and_seed_demo_data


class DemoResetView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        # Admin-only
        if not (request.user and request.user.is_authenticated and request.user.is_staff):
            return Response({"detail": "Admin only."}, status=status.HTTP_403_FORBIDDEN)

        summary = reset_and_seed_demo_data()
        return Response(summary, status=status.HTTP_200_OK)
