import pytest
from django.contrib.auth.models import User
from providers.models import Provider


@pytest.mark.auth
@pytest.mark.api
@pytest.mark.django_db
# QA-AUTH-001
# Requirement: Valid users can log in
def test_login_success(api_client):
    user = User.objects.create_user(username="prov1", password="Pass1234!")
    Provider.objects.create(
        user=user,
        first_name="A",
        last_name="B",
        specialty="General Practice",
        email="a.b@example.test",
    )

    res = api_client.post("/api/auth/login/", {"username": "prov1", "password": "Pass1234!"}, format="json")
    assert res.status_code == 200
    assert "access" in res.data
    assert "refresh" in res.data
    assert "provider" in res.data


@pytest.mark.auth
@pytest.mark.api
@pytest.mark.django_db
# QA-AUTH-002
# Requirement: Invalid credentials are rejected
def test_login_rejects_invalid_credentials(api_client):
    res = api_client.post("/api/auth/login/", {"username": "nope", "password": "bad"}, format="json")
    assert res.status_code in (400, 401)


@pytest.mark.auth
@pytest.mark.api
@pytest.mark.django_db
# QA-AUTH-003
# Requirement: Valid JWT tokens can be verified
def test_verify_token_valid(api_client):
    user = User.objects.create_user(username="prov2", password="Pass1234!")
    Provider.objects.create(
        user=user,
        first_name="A",
        last_name="B",
        specialty="General Practice",
        email="a2.b2@example.test",
    )

    login = api_client.post("/api/auth/login/", {"username": "prov2", "password": "Pass1234!"}, format="json")
    token = login.data["access"]

    res = api_client.post("/api/auth/verify/", {"token": token}, format="json")
    assert res.status_code == 200
