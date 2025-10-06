from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Provider
from authapp.validators import validate_password_strength  # ✅ password rules


def generate_unique_username(first_name: str, last_name: str) -> str:
    """
    Generates a unique username in the format: first initial + lastname (lowercase).
    If the username already exists, append an incrementing number.
    """
    base_username = (first_name[0] + last_name).lower()
    username = base_username
    counter = 1
    while User.objects.filter(username=username).exists():
        username = f"{base_username}{counter}"
        counter += 1
    return username


class ProviderSerializer(serializers.ModelSerializer):
    # Read-only username (auto-generated)
    username = serializers.CharField(read_only=True)

    # Password and confirm password required for creation
    password = serializers.CharField(write_only=True, required=True, min_length=8)
    confirm_password = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = Provider
        fields = [
            "id",
            "first_name",
            "last_name",
            "specialty",
            "email",
            "phone",
            "profile_picture",
            "username",
            "password",
            "confirm_password",
            "created_at",
        ]
        read_only_fields = ["id", "username", "created_at"]

    def validate(self, data):
        """
        Ensure passwords match and meet strength requirements.
        """
        password = data.get("password")
        confirm_password = data.get("confirm_password")

        if password != confirm_password:
            raise serializers.ValidationError(
                {"confirm_password": "Passwords do not match."}
            )

        # ✅ enforce password strength
        validate_password_strength(password)
        return data

    def create(self, validated_data):
        """
        On provider creation:
        - generate unique username
        - create linked User with validated password
        - associate User with Provider
        """
        password = validated_data.pop("password")
        validated_data.pop("confirm_password", None)

        first_name = validated_data.get("first_name")
        last_name = validated_data.get("last_name")
        email = validated_data.get("email")

        # Generate unique username
        username = generate_unique_username(first_name, last_name)

        # Create User account
        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            first_name=first_name,
            last_name=last_name,
        )

        # Link user to provider
        provider = Provider.objects.create(user=user, **validated_data)

        return provider
