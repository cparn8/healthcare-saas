# authapp/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from providers.models import Provider
from rest_framework_simplejwt.serializers import TokenVerifySerializer


class ProviderLoginView(APIView):
    """
    Public endpoint — allows providers to log in using username/password.
    Returns JWT tokens and basic provider info.
    """
    permission_classes = [AllowAny]  # ✅ route-specific override

    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")

        if not username or not password:
            return Response(
                {"detail": "Username and password are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = authenticate(username=username, password=password)
        if not user:
            return Response(
                {"detail": "Invalid credentials."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        provider = Provider.objects.filter(user=user).first()
        if not provider:
            return Response(
                {"detail": "No linked provider account found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        refresh = RefreshToken.for_user(user)

        return Response(
            {
                "access": str(refresh.access_token),
                "refresh": str(refresh),
                "provider": {
                    "id": provider.id,
                    "first_name": provider.first_name,
                    "last_name": provider.last_name,
                    "email": provider.email,
                    "specialty": provider.specialty,
                },
            },
            status=status.HTTP_200_OK,
        )


class ChangePasswordView(APIView):
    """
    Protected endpoint — authenticated providers can change their password.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        old_password = request.data.get("old_password")
        new_password = request.data.get("new_password")
        confirm_password = request.data.get("confirm_password")

        if not old_password or not new_password:
            return Response(
                {"detail": "All fields are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if new_password != confirm_password:
            return Response(
                {"detail": "Passwords do not match."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not user.check_password(old_password):
            return Response(
                {"detail": "Old password is incorrect."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user.set_password(new_password)
        user.save()
        return Response({"detail": "Password updated successfully."}, status=200)

class VerifyTokenView(APIView):
    """
    Public endpoint — checks if a given access token is still valid.
    Used by the React app on page load to auto-login.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = TokenVerifySerializer(data=request.data)
        try:
            serializer.is_valid(raise_exception=True)
            return Response({"detail": "Token is valid."}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(
                {"detail": "Token is invalid or expired."},
                status=status.HTTP_401_UNAUTHORIZED,
            )