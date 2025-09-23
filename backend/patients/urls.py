from rest_framework import routers
from .views import PatientViewSet

router = routers.DefaultRouter()
router.register(r'patients', PatientViewSet)

urlpatterns = router.urls