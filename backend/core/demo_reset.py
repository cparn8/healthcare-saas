# backend/core/demo_reset.py
from __future__ import annotations

from dataclasses import dataclass
from datetime import date, datetime, time, timedelta
from typing import Iterable, List, Tuple

from django.contrib.auth.models import User
from django.db import transaction
from django.utils import timezone

from appointments.models import Appointment
from locations.models import BusinessSettings, Location, LocationHours
from patients.models import Patient
from providers.models import Provider
from schedule.models import ScheduleSettings


# -----------------------------
# Deterministic seed constants
# -----------------------------

APPOINTMENT_TYPES = [
    {"name": "Consult",     "default_duration": 30, "color_code": "#2E7D32"},
    {"name": "Follow-up",   "default_duration": 30, "color_code": "#9A8700"},
    {"name": "Pre-op",      "default_duration": 60, "color_code": "#006064"},
    {"name": "Post-op",     "default_duration": 30, "color_code": "#5E2B97"},
    {"name": "X-Ray",       "default_duration": 15, "color_code": "#5F6F52"},
    {"name": "Procedure",   "default_duration": 60, "color_code": "#003366"},
    {"name": "Phlebotomy",  "default_duration": 15, "color_code": "#B23A48"},
]

BLOCK_COLOR = "#737373"  # Block times only; appointment types remain per approved list.

DEMO_LOCATIONS = [
    {"name": "North Office", "slug": "north"},
    {"name": "South Office", "slug": "south"},
]

# Passwords must pass validate_password_strength (upper/lower/number/special, >= 8)
DEMO_PASSWORD_A = "DemoPass1!"
DEMO_PASSWORD_B = "AdminPass1!"
DEMO_PASSWORD_C_F = "StaffPass1!"


# -----------------------------
# NEW: deterministic fake contact helpers
# -----------------------------

def _fake_phone(n: int) -> str:
    """
    Deterministic, clearly fake US phone numbers.
    555-01xx style is commonly used for demo purposes.
    """
    return f"(555) 01{n:02d}-{2000 + n}"


def _fake_email(first: str, last: str) -> str:
    """
    Deterministic fake email using example.test (non-routable).
    """
    return f"{first.lower()}.{last.lower()}@example.test"


def _fake_address(idx: int) -> str:
    """
    Deterministic fake but realistic-looking address string.
    """
    streets = [
        "Maple Ave",
        "Oak Street",
        "Pine Road",
        "Cedar Lane",
        "Elm Drive",
        "Birch Way",
        "Willow Blvd",
        "Spruce Court",
    ]
    street = streets[idx % len(streets)]
    number = 100 + (idx * 7)
    suite = (idx % 8) + 1
    return f"{number} {street}, Apt {suite}"


@dataclass(frozen=True)
class DemoProviderSpec:
    label: str
    first_name: str
    last_name: str
    email: str
    specialty: str
    is_staff: bool
    is_superuser: bool
    password: str


DEMO_PROVIDERS: List[DemoProviderSpec] = [
    DemoProviderSpec(
        label="A",
        first_name="Avery",
        last_name="Demouser",
        email="avery.demouser@example.test",
        specialty="General Practice",
        is_staff=True,
        is_superuser=False,
        password=DEMO_PASSWORD_A,
    ),
    DemoProviderSpec(
        label="B",
        first_name="Clay",
        last_name="Adminton",
        email="clay.adminton@example.test",
        specialty="Administration",
        is_staff=True,
        is_superuser=True,
        password=DEMO_PASSWORD_B,
    ),
    DemoProviderSpec(
        label="C",
        first_name="Casey",
        last_name="Hart",
        email="casey.hart@example.test",
        specialty="Orthopedics",
        is_staff=False,
        is_superuser=False,
        password=DEMO_PASSWORD_C_F,
    ),
    DemoProviderSpec(
        label="D",
        first_name="Drew",
        last_name="Nguyen",
        email="drew.nguyen@example.test",
        specialty="Radiology",
        is_staff=False,
        is_superuser=False,
        password=DEMO_PASSWORD_C_F,
    ),
    DemoProviderSpec(
        label="E",
        first_name="Elliot",
        last_name="Patel",
        email="elliot.patel@example.test",
        specialty="Surgery",
        is_staff=False,
        is_superuser=False,
        password=DEMO_PASSWORD_C_F,
    ),
    DemoProviderSpec(
        label="F",
        first_name="Finley",
        last_name="Kline",
        email="finley.kline@example.test",
        specialty="Family Medicine",
        is_staff=False,
        is_superuser=False,
        password=DEMO_PASSWORD_C_F,
    ),
]

# 24 synthetic patients, deterministic, balanced genders, DOB spanning young adult -> elderly.
# Keep fields minimal to reduce PHI risk (no phone/address required).
DEMO_PATIENTS: List[dict] = [
    # Male (12)
    {"first_name": "Miles", "last_name": "Rowan", "gender": "Male", "date_of_birth": date(1994, 7, 30)},
    {"first_name": "Noah", "last_name": "Keats", "gender": "Male", "date_of_birth": date(1988, 2, 12)},
    {"first_name": "Ethan", "last_name": "Blake", "gender": "Male", "date_of_birth": date(1979, 9, 4)},
    {"first_name": "Caleb", "last_name": "Morris", "gender": "Male", "date_of_birth": date(1966, 5, 21)},
    {"first_name": "Owen", "last_name": "Reed", "gender": "Male", "date_of_birth": date(1954, 11, 2)},
    {"first_name": "Lucas", "last_name": "Hale", "gender": "Male", "date_of_birth": date(2001, 3, 18)},
    {"first_name": "Henry", "last_name": "Price", "gender": "Male", "date_of_birth": date(1991, 12, 9)},
    {"first_name": "Jack", "last_name": "Foster", "gender": "Male", "date_of_birth": date(1983, 8, 27)},
    {"first_name": "Wyatt", "last_name": "Turner", "gender": "Male", "date_of_birth": date(1972, 1, 15)},
    {"first_name": "Levi", "last_name": "Sutton", "gender": "Male", "date_of_birth": date(1960, 6, 7)},
    {"first_name": "Theo", "last_name": "Carter", "gender": "Male", "date_of_birth": date(1948, 10, 25)},
    {"first_name": "Finn", "last_name": "Dawson", "gender": "Male", "date_of_birth": date(1998, 4, 3)},
    # Female (12)
    {"first_name": "Maya", "last_name": "Sterling", "gender": "Female", "date_of_birth": date(1993, 1, 14)},
    {"first_name": "Nora", "last_name": "Wells", "gender": "Female", "date_of_birth": date(1989, 6, 30)},
    {"first_name": "Ivy", "last_name": "Bennett", "gender": "Female", "date_of_birth": date(1977, 12, 5)},
    {"first_name": "Elena", "last_name": "Park", "gender": "Female", "date_of_birth": date(1968, 3, 22)},
    {"first_name": "Sofia", "last_name": "Quinn", "gender": "Female", "date_of_birth": date(1956, 7, 11)},
    {"first_name": "Ava", "last_name": "Hughes", "gender": "Female", "date_of_birth": date(2002, 9, 8)},
    {"first_name": "Chloe", "last_name": "James", "gender": "Female", "date_of_birth": date(1990, 11, 19)},
    {"first_name": "Lila", "last_name": "Fleming", "gender": "Female", "date_of_birth": date(1984, 5, 2)},
    {"first_name": "Renee", "last_name": "Cross", "gender": "Female", "date_of_birth": date(1971, 2, 26)},
    {"first_name": "Tessa", "last_name": "Hayden", "gender": "Female", "date_of_birth": date(1962, 8, 16)},
    {"first_name": "Vivian", "last_name": "Shaw", "gender": "Female", "date_of_birth": date(1949, 4, 28)},
    {"first_name": "Jade", "last_name": "Larson", "gender": "Female", "date_of_birth": date(1997, 10, 1)},
]


def _daterange(start: date, end: date) -> Iterable[date]:
    """Inclusive range."""
    d = start
    while d <= end:
        yield d
        d += timedelta(days=1)


def _is_weekday(d: date) -> bool:
    return d.weekday() < 5  # Mon=0..Fri=4


def _time(h: int, m: int = 0) -> time:
    return time(hour=h, minute=m)


def _choose_location_pattern(provider_idx: int, d: date) -> Tuple[str, str]:
    """
    Deterministic location assignment.
    Returns: (morning_slug, afternoon_slug)
    Some days are full-day one office; some split.
    """
    week_index = (d.toordinal() // 7)  # stable across runs
    # Alternate between full-day and split-day patterns
    if (provider_idx + week_index) % 3 == 0:
        # full-day
        full = "north" if (provider_idx + week_index) % 2 == 0 else "south"
        return (full, full)
    # split
    return ("north", "south") if (provider_idx + week_index) % 2 == 0 else ("south", "north")


def _slot_plan() -> List[Tuple[time, time]]:
    """
    7 patient appointments/day: 4 morning + 3 afternoon.
    Leaves space for lunch and an admin block.
    """
    return [
        (_time(8, 0),  _time(8, 30)),
        (_time(8, 45), _time(9, 15)),
        (_time(9, 30), _time(10, 0)),
        (_time(10, 15), _time(10, 45)),
        (_time(13, 0), _time(13, 30)),
        (_time(13, 45), _time(14, 15)),
        (_time(14, 30), _time(15, 0)),
    ]


def _block_plan(d: date, provider_idx: int) -> List[Tuple[str, time, time]]:
    """
    Deterministic blocks:
    - Lunch daily 12:00–13:00
    - Admin daily 15:15–15:45
    - Some half-day out-of-office patterns by provider/date to demo density variation
    """
    blocks = [
        ("Lunch", _time(12, 0), _time(13, 0)),
        ("Admin", _time(15, 15), _time(15, 45)),
    ]

    # Add occasional out-of-office half-days deterministically:
    # e.g., Provider C (idx 2) every other Wednesday afternoon
    if d.weekday() == 2 and provider_idx == 2 and (d.toordinal() % 2 == 0):
        blocks.append(("Out of Office", _time(13, 0), _time(17, 0)))

    # Provider E (idx 4) every third Friday morning
    if d.weekday() == 4 and provider_idx == 4 and (d.toordinal() % 3 == 0):
        blocks.append(("Out of Office", _time(8, 0), _time(12, 0)))

    return blocks


def _status_for_slot(i: int) -> str:
    # Curated variety, deterministic
    cycle = ["pending", "arrived", "in_lobby", "seen", "tentative"]
    return cycle[i % len(cycle)]


def _intake_for_slot(i: int) -> str:
    return "submitted" if (i % 3 == 0) else "not_submitted"


def reset_and_seed_demo_data() -> dict:
    """
    Performs a full deterministic wipe + recreate.
    Returns a summary dict for the API response.
    """
    today = timezone.localdate()
    start = today - timedelta(weeks=3)
    end = today + timedelta(weeks=3)

    with transaction.atomic():
        # -------------------------
        # Delete in FK-safe order
        # -------------------------
        Appointment.objects.all().delete()
        Patient.objects.all().delete()

        provider_user_ids = list(
            Provider.objects.exclude(user__isnull=True).values_list("user_id", flat=True)
        )
        Provider.objects.all().delete()
        if provider_user_ids:
            User.objects.filter(id__in=provider_user_ids).delete()

        Location.objects.all().delete()
        ScheduleSettings.objects.all().delete()
        BusinessSettings.objects.all().delete()

        # -------------------------
        # Recreate core config
        # -------------------------
        BusinessSettings.objects.get_or_create(
            pk=1,
            defaults={"name": "", "show_name_in_nav": True},
        )

        locations_by_slug = {}
        WEEKDAYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"]

        for spec in DEMO_LOCATIONS:
            loc = Location.objects.create(
                name=spec["name"],
                slug=spec["slug"],
                is_active=True,
            )
            locations_by_slug[loc.slug] = loc

            # Override default hours: open Mon–Fri only
            for day in WEEKDAYS:
                is_open = day in ["mon", "tue", "wed", "thu", "fri"]

                LocationHours.objects.update_or_create(
                    location=loc,
                    weekday=day,
                    defaults={
                        "open": is_open,
                        "start": time(8, 0),
                        "end": time(17, 0),
                    },
                )

        ScheduleSettings.objects.all().delete()
        ScheduleSettings.objects.create(
            appointment_types=APPOINTMENT_TYPES
        )

        # -------------------------
        # Providers (A–F)
        # -------------------------
        providers: List[Provider] = []
        for idx, p in enumerate(DEMO_PROVIDERS):
            username = (p.first_name[0] + p.last_name).lower()

            user = User.objects.create_user(
                username=username,
                email=p.email,
                password=p.password,
                first_name=p.first_name,
                last_name=p.last_name,
            )
            user.is_staff = bool(p.is_staff)
            user.is_superuser = bool(p.is_superuser)
            user.save()

            prov = Provider.objects.create(
                user=user,
                first_name=p.first_name,
                last_name=p.last_name,
                specialty=p.specialty,
                email=p.email,
                phone=_fake_phone(idx + 1),
            )
            providers.append(prov)

        # -------------------------
        # Patients (24)
        # -------------------------
        patients: List[Patient] = []
        for idx, spec in enumerate(DEMO_PATIENTS):
            patients.append(
                Patient.objects.create(
                    **spec,
                    email=_fake_email(spec["first_name"], spec["last_name"]),
                    phone=_fake_phone(idx + 20),
                    address=_fake_address(idx),
                )
            )

        # -------------------------
        # Appointments & blocks
        # -------------------------
        patient_cursor = 0
        appt_count = 0
        block_count = 0

        slot_plan = _slot_plan()

        for d in _daterange(start, end):
            if not _is_weekday(d):
                continue

            for p_idx, provider in enumerate(providers):
                morning_slug, afternoon_slug = _choose_location_pattern(p_idx, d)

                # Blocks first (so we can skip patient slots that would overlap out-of-office)
                blocks = _block_plan(d, p_idx)
                for label, b_start, b_end in blocks:
                    # decide office based on start time (morning vs afternoon)
                    office_slug = morning_slug if b_start < _time(12, 0) else afternoon_slug
                    Appointment.objects.create(
                        patient=None,
                        provider=provider,
                        location=locations_by_slug.get(office_slug),
                        office=office_slug,
                        appointment_type=label,
                        is_block=True,
                        status="pending",
                        room="",
                        intake_status="not_submitted",
                        notes="",
                        color_code=BLOCK_COLOR,
                        chief_complaint="",
                        date=d,
                        start_time=b_start,
                        end_time=b_end,
                        duration=int(
                            (datetime.combine(d, b_end) - datetime.combine(d, b_start)).total_seconds() / 60
                        ),
                        is_recurring=False,
                    )
                    block_count += 1

                # Patient appointments (7/day target), skipping anything that overlaps blocks
                for slot_i, (s, e) in enumerate(slot_plan):
                    # Respect half-day out-of-office by skipping overlapping patient slots
                    overlaps_block = any((s < b_end and e > b_start) for _lbl, b_start, b_end in blocks)
                    if overlaps_block:
                        continue

                    office_slug = morning_slug if s < _time(12, 0) else afternoon_slug

                    t = APPOINTMENT_TYPES[(d.toordinal() + slot_i + p_idx) % len(APPOINTMENT_TYPES)]
                    patient = patients[patient_cursor % len(patients)]
                    patient_cursor += 1

                    Appointment.objects.create(
                        patient=patient,
                        provider=provider,
                        location=locations_by_slug.get(office_slug),
                        office=office_slug,
                        appointment_type=t["name"],
                        is_block=False,
                        status=_status_for_slot(slot_i),
                        room="2" if _status_for_slot(slot_i) == "in_room" else "",
                        intake_status=_intake_for_slot(slot_i),
                        notes="",
                        color_code=t["color_code"],
                        chief_complaint="",
                        date=d,
                        start_time=s,
                        end_time=e,
                        duration=t["default_duration"],
                        is_recurring=False,
                    )
                    appt_count += 1

        return {
            "ok": True,
            "seeded_for_date": str(today),
            "window_start": str(start),
            "window_end": str(end),
            "locations": Location.objects.count(),
            "providers": Provider.objects.count(),
            "patients": Patient.objects.count(),
            "appointments": appt_count,
            "blocks": block_count,
        }
