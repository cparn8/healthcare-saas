import pytest
from datetime import date, time

from appointments.models import Appointment


@pytest.mark.auth
@pytest.mark.api
@pytest.mark.django_db
# QA-APPT-001
# Requirement: Creating appointments requires authentication
def test_create_requires_auth(api_client, location_north, provider_user):
    _user, provider = provider_user
    payload = {
        "provider": provider.id,
        "patient": None,
        "office": "north",
        "appointment_type": "Lunch",
        "is_block": True,
        "date": str(date.today()),
        "start_time": "12:00",
        "end_time": "13:00",
    }
    res = api_client.post("/api/appointments/", payload, format="json")
    assert res.status_code == 401


@pytest.mark.business_rules
@pytest.mark.api
@pytest.mark.django_db
# QA-APPT-002
# Requirement: Office is required when creating appointments
def test_create_rejects_missing_office(auth_client, provider_user):
    _user, provider = provider_user
    payload = {
        "provider": provider.id,
        "appointment_type": "Consult",
        "date": str(date.today()),
        "start_time": "09:00",
        "end_time": "09:30",
    }
    res = auth_client.post("/api/appointments/", payload, format="json")
    assert res.status_code == 400
    assert "office" in res.data


@pytest.mark.business_rules
@pytest.mark.api
@pytest.mark.django_db
# QA-APPT-003
# Requirement: Non-block appointments require a patient
def test_create_rejects_no_patient_for_non_block(auth_client, provider_user, location_north):
    _user, provider = provider_user
    payload = {
        "provider": provider.id,
        "patient": None,
        "office": "north",
        "appointment_type": "Consult",
        "date": str(date.today()),
        "start_time": "09:00",
        "end_time": "09:30",
    }
    res = auth_client.post("/api/appointments/", payload, format="json")
    assert res.status_code == 400
    assert "patient" in res.data


@pytest.mark.business_rules
@pytest.mark.api
@pytest.mark.django_db
# QA-APPT-004
# Requirement: Overlapping appointments are rejected by default
def test_overlap_rejected_by_default(auth_client, provider_user, location_north):
    _user, provider = provider_user
    d = date.today()

    Appointment.objects.create(
        patient=None,
        provider=provider,
        location=location_north,
        office="north",
        appointment_type="Lunch",
        is_block=True,
        date=d,
        start_time=time(12, 0),
        end_time=time(13, 0),
        duration=60,
    )

    payload = {
        "provider": provider.id,
        "patient": None,
        "office": "north",
        "appointment_type": "Lunch",
        "is_block": True,
        "date": str(d),
        "start_time": "12:30",
        "end_time": "13:00",
        "allow_overlap": False,
    }
    res = auth_client.post("/api/appointments/", payload, format="json")
    assert res.status_code == 400
    assert "overlaps" in str(res.data.get("non_field_errors", "")).lower()


@pytest.mark.business_rules
@pytest.mark.api
@pytest.mark.django_db
# QA-APPT-005
# Requirement: Overlaps may be explicitly allowed
def test_overlap_allowed_when_allow_overlap_true(auth_client, provider_user, location_north):
    _user, provider = provider_user
    d = date.today()

    Appointment.objects.create(
        patient=None,
        provider=provider,
        location=location_north,
        office="north",
        appointment_type="Lunch",
        is_block=True,
        date=d,
        start_time=time(12, 0),
        end_time=time(13, 0),
        duration=60,
    )

    payload = {
        "provider": provider.id,
        "patient": None,
        "office": "north",
        "appointment_type": "Lunch",
        "is_block": True,
        "date": str(d),
        "start_time": "12:30",
        "end_time": "13:00",
        "allow_overlap": True,
    }
    res = auth_client.post("/api/appointments/", payload, format="json")
    assert res.status_code == 201
