# Requirements Traceability Matrix (RTM)

## Purpose

This Requirements Traceability Matrix (RTM) maps **system requirements and core features** to their corresponding **manual and automated test cases**.

The RTM demonstrates:

- Test coverage completeness
- Alignment between requirements and verification
- Audit- and hiring-manager-ready QA discipline

This is a critical artifact for QA, compliance, and regulated-domain software.

---

## Scope of Traceability

This matrix covers:

- Authentication & authorization
- Scheduling and appointments
- Location management
- Business rules and conflict detection
- Security and access controls

Each requirement is traced to:

- One or more test cases
- Manual and/or automated validation

---

## Traceability Matrix

| Requirement ID | Feature / Requirement                       | Test Case IDs                | Test Type          |
| -------------- | ------------------------------------------- | ---------------------------- | ------------------ |
| REQ-AUTH-001   | Provider can log in using username/password | QA-AUTH-001, QA-REG-AUTH-001 | Manual + Automated |
| REQ-AUTH-002   | Invalid credentials are rejected            | QA-AUTH-002                  | Automated          |
| REQ-AUTH-003   | JWT token verification endpoint             | QA-AUTH-003                  | Automated          |
| REQ-AUTH-004   | Access token refresh supported              | QA-REG-AUTH-002              | Manual             |
| REQ-AUTH-005   | Unauthorized requests are blocked           | QA-API-001                   | Automated          |

---

### Appointment Management

| Requirement ID | Feature / Requirement                       | Test Case IDs                | Test Type          |
| -------------- | ------------------------------------------- | ---------------------------- | ------------------ |
| REQ-APPT-001   | Create patient appointment                  | QA-APPT-001                  | Manual             |
| REQ-APPT-002   | Create provider block time                  | QA-APPT-002, QA-REG-APPT-002 | Manual + Automated |
| REQ-APPT-003   | Reject appointment without office           | QA-API-002                   | Automated          |
| REQ-APPT-004   | Reject missing patient for non-block        | QA-API-003                   | Automated          |
| REQ-APPT-005   | Prevent overlapping appointments by default | QA-API-004                   | Automated          |
| REQ-APPT-006   | Allow overlap with explicit confirmation    | QA-API-005                   | Automated          |
| REQ-APPT-007   | Edit existing appointment                   | QA-REG-APPT-003              | Manual             |

---

### Scheduling Logic

| Requirement ID | Feature / Requirement                     | Test Case IDs                  | Test Type |
| -------------- | ----------------------------------------- | ------------------------------ | --------- |
| REQ-SCHED-001  | Day View displays appointments correctly  | QA-SCHED-001, QA-REG-SCHED-001 | Manual    |
| REQ-SCHED-002  | Week View respects open days only         | QA-SCHED-002, QA-REG-SCHED-002 | Manual    |
| REQ-SCHED-003  | Appointment clustering in dense schedules | QA-SCHED-003                   | Manual    |
| REQ-SCHED-004  | Business hours enforced                   | QA-NEG-003                     | Manual    |

---

### Location & Settings

| Requirement ID | Feature / Requirement                   | Test Case IDs              | Test Type          |
| -------------- | --------------------------------------- | -------------------------- | ------------------ |
| REQ-LOC-001    | Create and manage locations             | QA-LOC-001                 | Manual             |
| REQ-LOC-002    | Prevent deletion of location in use     | QA-API-006, QA-REG-LOC-001 | Automated          |
| REQ-LOC-003    | Non-admin users cannot delete locations | QA-API-007                 | Automated          |
| REQ-SET-001    | Appointment type defaults applied       | QA-SET-001, QA-REG-SET-001 | Manual + Automated |

---

## Test Coverage Summary

- Authentication: ✔ Fully Covered
- Appointment Creation: ✔ Fully Covered
- Overlap Detection: ✔ Fully Covered
- Location Deletion Safety: ✔ Fully Covered
- Schedule Rendering: ✔ Covered (manual emphasis)

---

## QA Maturity Signal

This traceability matrix demonstrates:

- Explicit requirement ownership
- Audit-ready documentation
- Industry-standard QA practices

It supports claims such as:

> “I designed and maintained a traceable QA strategy for a production SaaS.”

---

## Maintenance Notes

- RTM should be updated whenever new features are introduced
- Test IDs must remain stable across releases
- Deprecated requirements should be archived, not deleted
