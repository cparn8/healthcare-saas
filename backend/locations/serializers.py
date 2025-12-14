# backend/locations/serializers.py
from rest_framework import serializers
from .models import BusinessSettings, Location, LocationHours


class BusinessSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = BusinessSettings
        fields = [
            "id",
            "name",
            "show_name_in_nav",
        ]


class LocationHoursSerializer(serializers.ModelSerializer):
    class Meta:
        model = LocationHours
        fields = ["weekday", "open", "start", "end"]

    def validate(self, data):
        if data.get("open") and data["start"] >= data["end"]:
            raise serializers.ValidationError(
                "Start time must be earlier than end time when location is open."
            )
        return data


class LocationSerializer(serializers.ModelSerializer):
    hours = LocationHoursSerializer(many=True, read_only=True)

    class Meta:
        model = Location
        fields = [
            "id",
            "name",
            "slug",
            "phone",
            "email",
            "address",
            "is_active",
            "hours",
        ]
        extra_kwargs = {
            "slug": {"required": False, "allow_blank": True},
        }
