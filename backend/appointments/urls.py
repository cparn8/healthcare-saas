from rest_framework import routers
from .views import AppointmentViewSet

router = routers.DefaultRouter()
router.register(r'appointments', AppointmentViewSet)

urlpatterns = router.urls