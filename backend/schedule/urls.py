from rest_framework.routers import DefaultRouter
from .views import ScheduleSettingsViewSet

router = DefaultRouter()
router.register(r"schedule-settings", ScheduleSettingsViewSet, basename="schedule-settings")

urlpatterns = router.urls
