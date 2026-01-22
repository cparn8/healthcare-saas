# Known Limitations & Future Work

## Purpose of This Document

This document explicitly records **known system limitations** and **intentional omissions**, along with a structured roadmap for future improvements.

Rather than presenting an artificially “complete” system, this project documents:

- What is deliberately out of scope
- Why those decisions were made
- How the system could be evolved in a real production context

This document is intended for:

- Hiring managers evaluating engineering judgment
- QA professionals assessing residual risk
- Engineers onboarding or extending the system
- Technical reviewers validating architectural maturity

---

## Known Limitations

### 1. Limited Automated Test Coverage Scope

#### Current State

The automated test suite focuses on:

- Backend API behavior
- Authentication and authorization enforcement
- Business rule validation (scheduling conflicts, deletion constraints)
- Negative and failure scenarios

It does **not** include:

- End-to-end UI automation
- Load or stress testing
- Cross-browser compatibility testing

#### Rationale

- Backend correctness represents the highest risk surface
- UI behavior is deterministic and backend-driven
- Manual test cases are fully documented and traceable

This reflects a **risk-based testing strategy**, not an absence of testing discipline.

---

### 2. Single-Tenant Architecture

#### Current State

The system operates as a **single-tenant application** with shared global data.

There is no concept of:

- Tenant isolation
- Organization-level data partitioning
- Per-tenant configuration

#### Rationale

- Multi-tenancy adds significant architectural complexity
- Not required to demonstrate scheduling domain mastery
- Would obscure core correctness concerns

This is a **scope containment decision**, not a technical oversight.

---

### 3. No Persistent Audit Log

#### Current State

The system does not maintain an immutable audit trail for:

- Appointment creation or modification
- Overlap overrides
- Location or configuration changes

#### Rationale

- Audit logging introduces schema, storage, and compliance complexity
- Not essential for portfolio objectives
- Would distract from core scheduling logic

All override flows are still **explicit and intentional**, even without persistence.

---

### 4. Recurring Appointments Not Materialized

#### Current State

Recurring appointments are stored as **metadata**, not expanded into individual appointment instances.

As a result:

- Conflicts are evaluated per instance, not across future recurrences
- UI does not display future generated occurrences

#### Rationale

- Prevents uncontrolled data growth
- Avoids complex cascading update logic
- Keeps conflict detection deterministic and understandable

This is a **deliberate correctness-first design choice**.

---

### 5. No Role-Based Admin UI

#### Current State

While admin permissions exist at the API level, there is no dedicated administrative UI for:

- Managing providers
- Editing locations and hours
- Reviewing system configuration

#### Rationale

- Admin functionality is backend-verified
- UI development would add limited incremental value
- Admin workflows are validated via API and tests

---

## Future Work Roadmap

The following enhancements are realistic, incremental extensions of the current system.

They are **not speculative** and align with the existing architecture.

---

### 1. Expanded Automated Testing

#### Planned Improvements

- Add additional pytest groups:
  - `@pytest.mark.permissions`
  - `@pytest.mark.business_rules`

- Increase negative-path coverage
- Add test data factories (model-bakery expansion)

#### Optional Extensions

- Cypress-based UI smoke tests
- Contract tests between frontend and backend

---

### 2. Audit Logging

#### Proposed Approach

- Immutable `AuditEvent` model
- Append-only write strategy
- Capture:
  - Actor
  - Action
  - Affected object
  - Timestamp
  - Metadata snapshot

This would support compliance-style review without altering core logic.

---

### 3. Multi-Tenant Enablement

#### Proposed Approach

- Introduce `Tenant` or `Organization` model
- Scope providers, locations, and appointments per tenant
- Enforce tenant isolation at the queryset level

This would build directly on existing permission patterns.

---

### 4. Recurrence Expansion Engine

#### Proposed Approach

- Background job to materialize recurrences
- Sliding window generation (e.g., next 90 days)
- Idempotent regeneration logic

This would preserve performance while enabling full visualization.

---

### 5. Operational Hardening

#### Potential Enhancements

- Rate limiting
- Structured logging
- Metrics (Prometheus / CloudWatch)
- Alerting on error thresholds

---

## Why These Limitations Are Acceptable

Every limitation documented here is:

- Known
- Intentional
- Justified
- Documented with a clear upgrade path

This reflects **real-world engineering discipline**, where tradeoffs are explicit and revisited over time.

---

## Final Note

This project is **feature-complete for its stated goals**:

- Demonstrating scheduling domain mastery
- Showing backend-enforced correctness
- Exhibiting professional QA practices
- Communicating architectural judgment clearly

Future work would extend — not repair — the system.
