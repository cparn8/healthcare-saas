from rest_framework import routers
from .views import ProviderViewSet

router = routers.DefaultRouter()
router.register(r'providers', ProviderViewSet)

urlpatterns = router.urls