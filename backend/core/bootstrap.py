from __future__ import annotations

from django.contrib.auth.models import User
from django.db import connection
from django.db.utils import OperationalError, ProgrammingError

from providers.models import Provider


# These must match demo_reset.py exactly (same usernames/passwords).
DEMO_USERNAME = "ademouser"
DEMO_EMAIL = "avery.demouser@example.test"
DEMO_PASSWORD = "DemoPass1!"

ADMIN_USERNAME = "cadminton"
ADMIN_EMAIL = "clay.adminton@example.test"
ADMIN_PASSWORD = "AdminPass1!"


def _tables_exist(required: set[str]) -> bool:
    try:
        existing = set(connection.introspection.table_names())
        return required.issubset(existing)
    except Exception:
        return False


def ensure_bootstrap_accounts() -> None:
    """
    Ensures the Demo and Admin accounts exist so the system is always log-in-able.

    Safe properties:
    - Idempotent (will not create duplicates)
    - Guarded during migrate/startup (won’t crash if tables don’t exist yet)
    - Creates BOTH User and linked Provider records (login requires Provider linkage)
    """
    # Avoid crashing during migrations / first boot before tables exist
    required_tables = {"auth_user", "providers_provider"}
    if not _tables_exist(required_tables):
        return

    try:
        _ensure_one(
            username=DEMO_USERNAME,
            email=DEMO_EMAIL,
            password=DEMO_PASSWORD,
            first_name="Avery",
            last_name="Demouser",
            specialty="General Practice",
            is_staff=True,
            is_superuser=False,
            phone="(555) 0101-2001",
        )
        _ensure_one(
            username=ADMIN_USERNAME,
            email=ADMIN_EMAIL,
            password=ADMIN_PASSWORD,
            first_name="Clay",
            last_name="Adminton",
            specialty="Administration",
            is_staff=True,
            is_superuser=True,
            phone="(555) 0102-2002",
        )
    except (OperationalError, ProgrammingError):
        # DB not ready yet; ignore safely
        return


def _ensure_one(
    *,
    username: str,
    email: str,
    password: str,
    first_name: str,
    last_name: str,
    specialty: str,
    is_staff: bool,
    is_superuser: bool,
    phone: str | None = None,
) -> None:
    user, created = User.objects.get_or_create(
        username=username,
        defaults={
            "email": email,
            "first_name": first_name,
            "last_name": last_name,
            "is_staff": bool(is_staff),
            "is_superuser": bool(is_superuser),
        },
    )

    # If the user existed already, keep them aligned to our intended bootstrap state.
    # We do NOT forcibly overwrite password on every startup unless missing/unusable.
    updated = False
    if user.email != email:
        user.email = email
        updated = True
    if user.first_name != first_name:
        user.first_name = first_name
        updated = True
    if user.last_name != last_name:
        user.last_name = last_name
        updated = True
    if user.is_staff != bool(is_staff):
        user.is_staff = bool(is_staff)
        updated = True
    if user.is_superuser != bool(is_superuser):
        user.is_superuser = bool(is_superuser)
        updated = True

    # Ensure password is set at least once
    if created or not user.has_usable_password():
        user.set_password(password)
        updated = True

    if updated:
        user.save()

    # Ensure Provider linked to the user
    Provider.objects.get_or_create(
        user=user,
        defaults={
            "first_name": first_name,
            "last_name": last_name,
            "specialty": specialty,
            "email": email,
            "phone": phone,
        },
    )
