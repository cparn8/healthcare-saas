from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Provider
from authapp.validators import validate_password_strength


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
    username = serializers.CharField(read_only=True)
    password = serializers.CharField(write_only=True, required=False, min_length=8)
    confirm_password = serializers.CharField(write_only=True, required=False)
    is_staff = serializers.SerializerMethodField()
    is_superuser = serializers.SerializerMethodField()
    is_admin = serializers.SerializerMethodField()

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
            "is_staff",
            "is_superuser",
            "is_admin",
        ]
        read_only_fields = ["id", "username", "created_at", "is_staff", "is_superuser", "is_admin"]

    def get_is_staff(self, obj):
        return obj.user.is_staff if obj.user else False

    def get_is_superuser(self, obj):
        return obj.user.is_superuser if obj.user else False
    
    def get_is_admin(self, obj):
        if not obj.user:
            return False
        return obj.user.is_staff or obj.user.is_superuser

    def validate(self, data):
        """
        Enforce password match and strength only if password provided.
        """
        password = data.get("password")
        confirm_password = data.get("confirm_password")

        # Only validate passwords if user is trying to change them
        if password or confirm_password:
            if password != confirm_password:
                raise serializers.ValidationError(
                    {"confirm_password": "Passwords do not match."}
                )
            validate_password_strength(password)

        return data

    def create(self, validated_data):
        """
        On provider creation:
        - Generate unique username
        - Create linked User with validated password
        - Associate User with Provider
        """
        password = validated_data.pop("password", None)
        validated_data.pop("confirm_password", None)

        first_name = validated_data.get("first_name")
        last_name = validated_data.get("last_name")
        email = validated_data.get("email")

        # Generate unique username
        username = generate_unique_username(first_name, last_name)

        # Create User
        user = User.objects.create_user(
            username=username,
            email=email,
            password=password or User.objects.make_random_password(),
            first_name=first_name,
            last_name=last_name,
        )

        provider = Provider.objects.create(user=user, **validated_data)
        return provider

    def update(self, instance, validated_data):
        """
        Allow updating provider details.
        Password change is optional — only applied if provided.
        """
        password = validated_data.pop("password", None)
        validated_data.pop("confirm_password", None)

        # Update Provider model fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # Update linked User info
        user = instance.user
        if "email" in validated_data:
            user.email = validated_data["email"]
            user.username = validated_data["email"]  # keep username in sync

        if password:
            user.set_password(password)
        user.first_name = instance.first_name
        user.last_name = instance.last_name
        user.save()

        return instance
