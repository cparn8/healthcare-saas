# Backend Architecture

## Purpose of This Document

This document describes the **backend architecture** of the Healthcare Scheduling SaaS, with emphasis on:

- Domain boundaries and app responsibilities
- Enforcement of business rules
- Data integrity guarantees
- Authentication and authorization flow
- Deterministic demo and bootstrap behavior
- Testability and production-readiness

The backend is the **authoritative source of truth** for all scheduling behavior.

---

## Backend Architectural Goals

The backend is intentionally designed to:

1. **Enforce correctness regardless of UI behavior**
2. **Prevent invalid or ambiguous scheduling states**
3. **Provide deterministic, testable behavior**
4. **Model real-world healthcare constraints**
5. **Support QA verification and traceability**

No client is trusted to enforce business logic.

---

## Technology Stack

### Core Technologies

- **Python**
- **Django** – ORM, migrations, lifecycle management
- **Django REST Framework (DRF)** – API serialization, validation, permissions
- **SimpleJWT** – Access + refresh token authentication
- **PostgreSQL** – Relational data store

### Runtime & Infrastructure

- **Gunicorn** – WSGI server (production)
- **Docker** – Containerized execution
- **Docker Compose** – Local orchestration

---

## Application Layering

The backend follows a **domain-driven app structure**, with each Django app owning a well-defined responsibility.

```
backend/
├── appointments/
├── authapp/
├── locations/
├── patients/
├── providers/
├── schedule/
└── core/
```

Each app contains:

- Models
- Serializers
- ViewSets / API endpoints
- Domain-specific validation

---

## App Responsibilities

### `appointments`

**Primary scheduling domain**

Responsibilities:

- Appointment persistence
- Time overlap detection
- Block vs patient appointment rules
- Conflict enforcement
- Explicit override handling (`allow_overlap`)

This app is the **most critical correctness boundary** in the system.

---

### `schedule`

**Global scheduling configuration**

Responsibilities:

- Appointment type definitions
- System-wide schedule settings
- Projection of business hours from locations
- Providing backend-authoritative configuration to the frontend

Only a single `ScheduleSettings` row is expected (singleton semantics).

---

### `locations`

**Physical and logical practice locations**

Responsibilities:

- Location identity (`slug`)
- Per-location business hours
- Enforcement of referential integrity
- Protection against deletion while in use

Location slugs are treated as **stable scheduling identifiers**.

---

### `providers`

**Provider identity and ownership**

Responsibilities:

- Link between Django `User` and scheduling provider
- Provider metadata (name, specialty)
- Permission scoping

Providers are the primary actors in scheduling workflows.

---

### `patients`

**Patient records (synthetic-only)**

Responsibilities:

- Minimal patient identity
- No PHI storage
- Deterministic demo creation

Patient data exists only to support scheduling realism.

---

### `authapp`

**Authentication boundary**

Responsibilities:

- Login endpoint
- Token issuance
- Token verification
- Provider context embedding

All auth flows integrate with SimpleJWT.

---

### `core`

**System lifecycle and demo control**

Responsibilities:

- Deterministic demo reset
- Bootstrap accounts
- Environment-safe startup logic
- Idempotent seed behavior

This app ensures the system is **always demo- and test-ready**.

---

## Request Lifecycle

A typical write request follows this path:

```
Request
 → Authentication (JWT)
 → Permission checks
 → Serializer validation
 → Domain rule enforcement
 → Database transaction
 → Response
```

At no point does the system rely on frontend assumptions.

---

## Business Rule Enforcement

### Overlap Detection

Appointments conflict if all are true:

- Same provider
- Same date
- Same office
- Overlapping time range

Behavior:

- Conflict → 400 error
- Explicit override required (`allow_overlap=true`)
- Override must be intentional and retried

This design ensures **auditability and intentionality**.

---

### Block Appointments

- Blocks do not require patients
- Blocks still participate in overlap detection
- Blocks are rendered differently but enforced equally

---

### Location Deletion Safeguards

- Locations cannot be deleted if referenced by appointments
- Admin-only deletion
- Explicit error returned if blocked

This prevents orphaned scheduling data.

---

## Authentication & Authorization

### Authentication

- JWT-based
- Short-lived access tokens
- Refresh tokens supported
- Token verification endpoint provided

### Authorization

- Object-level permission enforcement
- Admin-only operations (e.g., location deletion)
- Provider-scoped data access

Permission failures return **403**, not masked as validation errors.

---

## Transactional Integrity

- All scheduling writes occur within atomic DB transactions
- Partial writes are prevented
- Errors fail fast and visibly

This protects against race conditions and partial state.

---

## Deterministic Demo & Bootstrap Behavior

### Bootstrap Accounts

On startup:

- Demo and admin accounts are ensured
- Provider records are linked idempotently
- Safe during migrations

### Demo Reset

- Full wipe + reseed
- Deterministic time window
- Stable identities
- Idempotent execution

This enables:

- QA reproducibility
- CI testing
- Interview demos

---

## Error Handling Strategy

- Validation errors returned with field specificity
- Business rule violations returned as non-field errors
- Authorization errors return 403
- Authentication errors return 401

Error semantics are consistent and testable.

---

## Backend Testability

The backend is explicitly designed for:

- Pytest-based API testing
- Business-rule-focused test cases
- Deterministic fixtures
- Permission and negative testing

Test cases validate **behavior**, not implementation.

---

## Explicit Non-Goals

The backend intentionally does **not**:

- Auto-resolve conflicts
- Soft-delete critical records
- Store PHI
- Perform client-side trust validation

These decisions reduce ambiguity and risk.

---

## Summary

The backend architecture emphasizes:

- Correctness over convenience
- Determinism over flexibility
- Clear domain ownership
- QA-verifiable behavior

It reflects **real-world production backend decision-making**, particularly suited for scheduling-heavy healthcare-style systems.
