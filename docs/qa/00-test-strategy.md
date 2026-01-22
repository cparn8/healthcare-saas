# Test Strategy

## Purpose

This document defines the quality assurance strategy for the Healthcare Scheduling SaaS.
It outlines how quality is ensured across authentication, scheduling, permissions, and
business-critical workflows using a combination of manual and automated testing.

This strategy is designed to reflect **production-grade SaaS QA practices**, not academic testing.

---

## Quality Objectives

Primary objectives of the test strategy:

- Ensure patient scheduling integrity (no silent double-booking)
- Enforce authentication and role-based authorization
- Validate backend business rules independently of the UI
- Detect regressions prior to release
- Provide traceability between requirements, risks, and tests

---

## Test Levels

### 1. Manual Testing

Manual tests focus on:

- End-to-end user flows
- Cross-feature interactions
- UX validation and edge-case discovery

Covered areas:

- Login and token lifecycle
- Scheduling workflows (day/week views)
- Location-based scheduling rules
- Error handling and user feedback

### 2. Automated Backend Testing

Automated tests are implemented using **pytest + pytest-django** and focus on:

- API contract validation
- Authentication and authorization enforcement
- Core business rules (overlaps, permissions, required fields)
- Failure and negative paths

Tests are executed against a **Dockerized PostgreSQL-backed Django environment** to ensure
parity with production behavior.

---

## Test Types

| Type        | Description                                 |
| ----------- | ------------------------------------------- |
| Smoke       | Critical paths validating system viability  |
| Functional  | Core feature correctness                    |
| API         | REST contract validation                    |
| Negative    | Invalid inputs and failure paths            |
| Permissions | Role-based access enforcement               |
| Regression  | Protection against previously fixed defects |

---

## Entry / Exit Criteria

### Entry Criteria

- Docker services build successfully
- Database migrations complete
- Demo data seeding is functional

### Exit Criteria

- All automated tests pass
- No open Critical or High severity defects
- Smoke checklist completed successfully

---

## Tools & Frameworks

- pytest
- pytest-django
- Django REST Framework test client
- Docker Compose
- PostgreSQL

---

## Ownership

The test strategy, test cases, and automation suite were **designed and implemented by a single engineer**
acting as both Software Engineer and QA Engineer, reflecting real-world startup and small-team environments.
