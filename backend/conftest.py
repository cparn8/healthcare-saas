import pytest
from django.contrib.auth.models import User
from rest_framework.test import APIClient

from providers.models import Provider
from locations.models import Location, LocationHours
from schedule.models import ScheduleSettings


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def location_north(db):
    loc, _ = Location.objects.get_or_create(
        slug="north",
        defaults={
            "name": "North Office",
            "is_active": True,
        },
    )
    return loc


@pytest.fixture
def provider_user(db):
    user = User.objects.create_user(username="prov", password="Pass1234!")
    provider = Provider.objects.create(
        user=user,
        first_name="Test",
        last_name="Provider",
        specialty="General Practice",
        email="test.provider@example.test",
    )
    return user, provider


@pytest.fixture
def auth_client(api_client, provider_user):
    user, _provider = provider_user
    # Use your login endpoint to obtain JWT tokens (realistic integration test)
    res = api_client.post("/api/auth/login/", {"username": user.username, "password": "Pass1234!"}, format="json")
    assert res.status_code == 200, res.data
    token = res.data["access"]
    api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")
    return api_client


@pytest.fixture
def schedule_settings(db):
    return ScheduleSettings.objects.create(appointment_types=[
        {"name": "Consult", "default_duration": 30, "color_code": "#2E7D32"}
    ])
