# Negative Test Cases

## Purpose

This document defines negative and failure-mode test cases for the
Healthcare Scheduling SaaS.

Negative testing validates that the system:

- Fails safely
- Rejects invalid input
- Enforces business rules
- Prevents unauthorized or inconsistent states

These cases are critical for demonstrating QA rigor and production readiness.

---

## Scope

Negative test coverage includes:

- Authentication failures
- Authorization violations
- Invalid scheduling inputs
- Referential integrity enforcement
- Overlap and conflict handling

These tests complement:

- Functional test cases
- API test cases
- Automated backend tests

---

## Authentication & Authorization Failures

### QA-NEG-AUTH-001 — Missing Authentication Token

Area:
Authentication

Scenario:
API request made without Authorization header

Steps:

1. Call protected endpoint (e.g., POST /api/appointments/)
2. Omit Authorization header

Expected Result:

- HTTP 401 Unauthorized
- No data modification occurs

Status:
Automated

---

### QA-NEG-AUTH-002 — Invalid JWT Token

Area:
Authentication

Scenario:
Malformed or expired token used

Steps:

1. Submit request with invalid token

Expected Result:

- HTTP 401 Unauthorized
- Token rejected

Status:
Manual / Automated (partial)

---

### QA-NEG-PERM-001 — Non-Admin Attempts Admin Action

Area:
Authorization

Scenario:
Non-admin provider attempts to delete a location

Steps:

1. Authenticate as non-admin
2. DELETE /api/locations/{id}/

Expected Result:

- HTTP 403 Forbidden
- No deletion occurs

Status:
Automated

---

## Appointment Validation Failures

### QA-NEG-APPT-001 — Missing Required Fields

Area:
Appointments

Scenario:
Create appointment without required fields

Steps:

1. Submit appointment payload missing office or date

Expected Result:

- HTTP 400 Bad Request
- Field-level validation errors returned

Status:
Automated

---

### QA-NEG-APPT-002 — End Time Before Start Time

Area:
Appointments

Scenario:
Appointment end_time <= start_time

Steps:

1. Submit appointment with invalid time range

Expected Result:

- HTTP 400 Bad Request
- Error references invalid time ordering

Status:
Manual (candidate for automation)

---

### QA-NEG-APPT-003 — Patient Required for Non-Block Appointments

Area:
Appointments

Scenario:
Non-block appointment submitted without patient

Steps:

1. Submit appointment_type = Consult
2. patient = null

Expected Result:

- HTTP 400 Bad Request
- Error references patient requirement

Status:
Automated

---

### QA-NEG-APPT-004 — Overlapping Appointment Without Approval

Area:
Appointments

Scenario:
Overlapping appointment created without allow_overlap

Steps:

1. Create baseline appointment
2. Submit overlapping appointment with allow_overlap=false

Expected Result:

- HTTP 400 Bad Request
- Overlap error returned

Status:
Automated

---

### QA-NEG-APPT-005 — Invalid Location Slug

Area:
Appointments

Scenario:
Office slug does not match existing location

Steps:

1. Submit appointment with unknown office slug

Expected Result:

- HTTP 400 Bad Request
- Error references invalid location

Status:
Manual (recommended automation)

---

## Location Integrity Failures

### QA-NEG-LOC-001 — Delete Location Referenced by Appointments

Area:
Locations

Scenario:
Admin attempts to delete location with existing appointments

Steps:

1. Create appointment referencing location
2. DELETE location

Expected Result:

- HTTP 400 Bad Request
- Error explains referential constraint

Status:
Automated

---

## System Safety Failures

### QA-NEG-SYS-001 — Partial Payload Submission

Area:
API robustness

Scenario:
Payload contains unexpected or extra fields

Steps:

1. Submit appointment payload with unknown fields

Expected Result:

- HTTP 400 Bad Request or ignored fields
- System remains stable

Status:
Manual

---

## Notes for QA Reviewers

- Negative tests intentionally emphasize _prevention of invalid states_
- These cases demonstrate production-grade failure handling
- Several manual cases are excellent candidates for future automation

This document supports claims of:

- Defensive testing
- Risk-based QA design
- Production SaaS readiness
