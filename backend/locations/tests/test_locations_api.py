import pytest
from datetime import date, time

from appointments.models import Appointment


@pytest.mark.permissions
@pytest.mark.business_rules
@pytest.mark.api
@pytest.mark.django_db
# QA-LOC-001
# Requirement: Locations with existing appointments cannot be deleted
def test_cannot_delete_location_if_office_slug_in_use(
    admin_client,
    provider_user,
    location_north,
):
    _user, provider = provider_user

    Appointment.objects.create(
        patient=None,
        provider=provider,
        location=location_north,
        office=location_north.slug,
        appointment_type="Lunch",
        is_block=True,
        date=date.today(),
        start_time=time(12, 0),
        end_time=time(13, 0),
        duration=60,
    )

    res = admin_client.delete(f"/api/locations/{location_north.id}/")

    assert res.status_code == 400
    assert "Cannot delete this location" in res.data["detail"]


@pytest.mark.permissions
@pytest.mark.api
@pytest.mark.django_db
# QA-LOC-002
# Requirement: Non-admin users cannot delete locations
def test_non_admin_cannot_delete_location(auth_client, location_north):
    res = auth_client.delete(f"/api/locations/{location_north.id}/")
    assert res.status_code == 403
