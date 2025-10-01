from rest_framework import viewsets, filters
from .models import Provider
from .serializers import ProviderSerializer

class ProviderViewSet(viewsets.ModelViewSet):
    queryset = Provider.objects.all().order_by('last_name')
    serializer_class = ProviderSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['first_name', 'last_name', 'specialty', 'email']
    ordering_fields = ['first_name', 'last_name', 'created_at']