# Automated Test Architecture

## Overview

This document describes the structure, execution model, and design principles
of the automated backend test suite for the Healthcare Scheduling SaaS.

The automation suite is intentionally backend-focused to validate
authentication, authorization, and business rules independently of the UI.

---

## Technology Stack

- pytest
- pytest-django
- Django REST Framework test client
- PostgreSQL
- Docker / Docker Compose

All tests execute inside the same Dockerized environment as the application
to ensure production-parity behavior.

---

## Test Directory Structure

backend/

- appointments/tests/
- auth/tests/
- locations/tests/
- conftest.py
- pytest.ini

Tests are grouped by domain area to reflect ownership and responsibility
boundaries in a real engineering organization.

---

## pytest Configuration

Key configuration elements:

- DJANGO_SETTINGS_MODULE is explicitly set
- Database access is managed via pytest-django
- Custom markers enable targeted test execution
- Environment flags distinguish test runtime

---

## Test Categorization (Markers)

Tests are categorized using pytest markers to support selective execution
and traceability.

Markers in use:

- auth  
  Authentication and token lifecycle tests

- permissions  
  Role-based and authorization enforcement tests

- business_rules  
  Core domain and data integrity rules

- api  
  REST endpoint behavior and contracts

Example usage:

pytest -m permissions  
pytest -m "api and not auth"

---

## Test IDs and Traceability

Each automated test is associated with:

- A unique Test ID (e.g., QA-APPT-004)
- A documented requirement or rule
- A corresponding entry in the Traceability Matrix

This enables:

- Audit-ready coverage mapping
- Risk-based prioritization
- Clear communication with non-engineering stakeholders

---

## Execution Model

- Tests run inside Docker via docker compose exec
- PostgreSQL is used (not SQLite)
- Database state is isolated per test
- Authentication uses real JWT flows

This avoids false positives common in mocked or unit-only approaches.

---

## Design Principles

- Fail fast and loudly
- Prefer realistic integration over mocks
- Validate negative paths explicitly
- Treat backend as the system of record
