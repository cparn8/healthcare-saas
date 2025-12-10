# core/urls.py
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework import routers
from patients.views import PatientViewSet
from providers.views import ProviderViewSet
from appointments.views import AppointmentViewSet
from schedule.urls import router as schedule_router
from locations.urls import router as locations_router
from locations.views import BusinessSettingsView

router = routers.DefaultRouter()
router.register(r"patients", PatientViewSet)
router.register(r"providers", ProviderViewSet)
router.register(r"appointments", AppointmentViewSet)
router.registry.extend(schedule_router.registry)
router.registry.extend(locations_router.registry)

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include(router.urls)),
    path("api/business/settings/", BusinessSettingsView.as_view(),
         name="business-settings"),
    path("api/auth/", include("authapp.urls")),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)