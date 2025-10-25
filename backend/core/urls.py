# core/urls.py
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework import routers
from patients.views import PatientViewSet
from providers.views import ProviderViewSet
from appointments.views import AppointmentViewSet

router = routers.DefaultRouter()
router.register(r"patients", PatientViewSet)
router.register(r"providers", ProviderViewSet)
router.register(r"appointments", AppointmentViewSet)

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include(router.urls)),
    path("api/auth/", include("authapp.urls")),  # includes login, verify, refresh, etc.
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)