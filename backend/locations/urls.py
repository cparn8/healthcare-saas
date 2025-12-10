# backend/locations/urls.py

from rest_framework import routers
from .views import LocationViewSet

router = routers.DefaultRouter()
router.register(r"locations", LocationViewSet, basename="location")
