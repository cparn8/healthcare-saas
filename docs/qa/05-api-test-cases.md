# API Test Cases

## Purpose

This document defines manual and automated API-level test cases for the
Healthcare Scheduling SaaS backend.

These tests validate:

- Endpoint behavior
- Request/response contracts
- Authentication and authorization enforcement
- Core scheduling business rules

API tests serve as the primary automation surface for backend quality assurance.

---

## Scope

Covered APIs:

- Authentication
  - Login
  - Token verification
  - Token refresh

- Appointments
  - Create
  - Overlap detection
  - Business rule validation

- Locations
  - CRUD operations
  - Referential integrity enforcement

Out of scope:

- Frontend rendering
- Browser compatibility
- Performance/load testing

---

## Conventions

Each test case includes:

- Test ID
- Endpoint
- Method
- Preconditions
- Steps
- Expected Result
- Automation Status

---

## Authentication API Tests

### QA-AUTH-001 — Provider Login Success

Endpoint:
POST /api/auth/login/

Preconditions:

- Provider user exists with valid credentials
- Provider is linked to User model

Steps:

1. Submit username and password
2. Observe response

Expected Result:

- HTTP 200 OK
- Access token returned
- Refresh token returned
- Provider object included

Automation:

- Yes (pytest)

---

### QA-AUTH-002 — Login Rejects Invalid Credentials

Endpoint:
POST /api/auth/login/

Preconditions:

- No matching user credentials

Steps:

1. Submit invalid username/password

Expected Result:

- HTTP 401 Unauthorized or 400 Bad Request
- No tokens returned

Automation:

- Yes (pytest)

---

### QA-AUTH-003 — Token Verification Success

Endpoint:
POST /api/auth/verify/

Preconditions:

- Valid access token obtained from login

Steps:

1. Submit token to verify endpoint

Expected Result:

- HTTP 200 OK
- Token accepted

Automation:

- Yes (pytest)

---

## Appointment API Tests

### QA-APPT-001 — Appointment Creation Requires Authentication

Endpoint:
POST /api/appointments/

Preconditions:

- No authentication header

Steps:

1. Submit valid appointment payload

Expected Result:

- HTTP 401 Unauthorized

Automation:

- Yes (pytest)

---

### QA-APPT-002 — Reject Missing Office Field

Endpoint:
POST /api/appointments/

Preconditions:

- Authenticated provider

Steps:

1. Submit appointment payload without office

Expected Result:

- HTTP 400 Bad Request
- Error references missing office field

Automation:

- Yes (pytest)

---

### QA-APPT-003 — Reject Non-Block Appointment Without Patient

Endpoint:
POST /api/appointments/

Preconditions:

- Authenticated provider

Steps:

1. Submit non-block appointment with patient = null

Expected Result:

- HTTP 400 Bad Request
- Error references patient requirement

Automation:

- Yes (pytest)

---

### QA-APPT-004 — Overlap Rejected by Default

Endpoint:
POST /api/appointments/

Preconditions:

- Existing appointment occupies same time slot
- allow_overlap = false or omitted

Steps:

1. Submit overlapping appointment

Expected Result:

- HTTP 400 Bad Request
- Error references overlap conflict

Automation:

- Yes (pytest)

---

### QA-APPT-005 — Overlap Allowed When Explicitly Approved

Endpoint:
POST /api/appointments/

Preconditions:

- Existing appointment occupies same time slot
- allow_overlap = true

Steps:

1. Submit overlapping appointment with allow_overlap = true

Expected Result:

- HTTP 201 Created
- Appointment saved successfully

Automation:

- Yes (pytest)

---

## Location API Tests

### QA-LOC-001 — Prevent Deleting Location in Use

Endpoint:
DELETE /api/locations/{id}/

Preconditions:

- Appointment exists referencing location slug
- User is admin

Steps:

1. Attempt to delete location

Expected Result:

- HTTP 400 Bad Request
- Error explains location is in use

Automation:

- Yes (pytest)

---

### QA-LOC-002 — Non-Admin Cannot Delete Location

Endpoint:
DELETE /api/locations/{id}/

Preconditions:

- Authenticated non-admin user

Steps:

1. Attempt to delete location

Expected Result:

- HTTP 403 Forbidden

Automation:

- Yes (pytest)

---

## Notes for QA Reviewers

- API tests are intentionally business-focused rather than CRUD-exhaustive
- Negative and edge cases are prioritized over happy-path redundancy
- Tests map directly to documented domain rules
