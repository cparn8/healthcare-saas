from rest_framework import viewsets, filters
from rest_framework.pagination import PageNumberPagination
from .models import Provider
from .serializers import ProviderSerializer
from rest_framework.permissions import IsAdminUser


class ProviderPagination(PageNumberPagination):
    page_size = 20  # adjust as needed
    page_size_query_param = 'page_size'
    max_page_size = 100


class ProviderViewSet(viewsets.ModelViewSet):
    """
    Provides list, create, retrieve, update, and delete endpoints for Providers.
    Supports search and ordering on key fields.
    """
    queryset = Provider.objects.all().order_by('last_name')
    serializer_class = ProviderSerializer
    permission_classes = [IsAdminUser]
    pagination_class = ProviderPagination
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['first_name', 'last_name', 'specialty', 'email']
    ordering_fields = ['first_name', 'last_name', 'created_at']