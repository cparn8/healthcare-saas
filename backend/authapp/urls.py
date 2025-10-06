# authapp/urls.py
from django.urls import path
from .views import ProviderLoginView, ChangePasswordView
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path("login/", ProviderLoginView.as_view(), name="provider_login"),
    path("refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("change-password/", ChangePasswordView.as_view(), name="change_password"),
]
