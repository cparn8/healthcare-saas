# patients/serializers.py
from rest_framework import serializers
from .models import Patient

class PatientSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = Patient
        fields = [
            "id",
            "first_name",
            "last_name",
            "full_name",
            "prn",
            "date_of_birth",
            "phone",
            "email",
        ]

    def get_full_name(self, obj):
        return f"{obj.first_name} {obj.last_name}"
