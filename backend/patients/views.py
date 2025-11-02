# patients/views.py
from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend
from .models import Patient
from .serializers import PatientSerializer

class PatientViewSet(viewsets.ModelViewSet):
    """
    Provides CRUD and search for patients.
    Used by predictive search bar in appointment creation.
    """
    queryset = Patient.objects.all()
    serializer_class = PatientSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]

    # prefix search for names, flexible for PRN and DOB
    search_fields = ["^first_name", "^last_name", "prn", "date_of_birth"]
    ordering_fields = ["last_name", "first_name", "date_of_birth"]
    ordering = ["last_name"]
