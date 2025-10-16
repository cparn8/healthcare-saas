# authapp/urls.py
from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import ProviderLoginView, CurrentProviderView, ChangePasswordView, VerifyTokenView

urlpatterns = [
    path("login/", ProviderLoginView.as_view(), name="provider_login"),
    path("refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("verify/", VerifyTokenView.as_view(), name="token_verify"), 
    path("change-password/", ChangePasswordView.as_view(), name="change_password"),
    path("me/", CurrentProviderView.as_view(), name="current_provider"),
]
