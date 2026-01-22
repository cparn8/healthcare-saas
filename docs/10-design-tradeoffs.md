# Design Tradeoffs

## Purpose of This Document

This document records **intentional architectural and product tradeoffs** made during the design and implementation of the Healthcare Scheduling SaaS.

Rather than hiding limitations, this project **documents them explicitly**, demonstrating:

- Engineering maturity
- Risk awareness
- Scope discipline
- Real-world prioritization skills

This document is written for:

- Hiring managers evaluating judgment and ownership
- Engineers onboarding to the system
- QA professionals assessing risk and coverage
- Reviewers comparing architectural alternatives

---

## Guiding Principle

> Every non-trivial system is defined as much by what it **does not do** as by what it does.

Tradeoffs were chosen to maximize **correctness, clarity, and demonstrability**, rather than raw feature count.

---

## Backend-Authoritative Scheduling Logic

### Decision

All scheduling rules — including overlap detection, office scoping, and patient requirements — are enforced **exclusively in the backend**.

### Alternative Considered

- Client-side validation with optimistic saves
- UI-only conflict detection

### Reasoning

- Prevents rule bypass via direct API calls
- Eliminates frontend/backend drift
- Centralizes correctness in one place

### Impact

- Slightly more API round-trips
- Clearer, testable business logic
- Stronger data integrity guarantees

**This tradeoff prioritizes correctness over perceived UI responsiveness.**

---

## JSON-Based Configuration Fields

### Decision

Certain configuration elements (e.g., appointment types, default durations, color codes) are stored as structured JSON rather than normalized relational tables.

### Alternative Considered

- Fully normalized schema with multiple join tables

### Reasoning

- Configuration changes are infrequent
- JSON simplifies migrations and seeding
- Reduces schema churn during iteration

### Impact

- Less relational rigidity
- Slightly more application-level validation
- Faster iteration and demo resets

This reflects a **pragmatic balance** between purity and flexibility.

---

## No Materialized Recurring Appointments

### Decision

Recurring appointments are stored as **metadata**, not expanded into individual appointment rows.

### Alternative Considered

- Pre-expanding all recurrences into discrete rows

### Reasoning

- Prevents data explosion
- Avoids complex cascade updates
- Keeps conflict logic simple and deterministic

### Impact

- Recurring logic not fully visualized
- Future expansion required for production scale

This decision favors **data integrity and maintainability** over feature completeness.

---

## Deterministic Demo Data Strategy

### Decision

All demo data is **deterministic, fixed, and resettable** via a management command.

### Alternative Considered

- Randomized seed data
- Manual demo environments

### Reasoning

- Enables repeatable interviews
- Guarantees known UI states
- Eliminates demo flakiness

### Impact

- Less “organic” randomness
- Far greater reliability for demonstrations

This tradeoff explicitly favors **predictability over realism**.

---

## Single-Tenant Architecture

### Decision

The system is implemented as a **single-tenant application**.

### Alternative Considered

- Full multi-tenant isolation

### Reasoning

- Multi-tenancy introduces significant complexity
- Not required for demonstrating scheduling logic
- Would dilute focus from core domain challenges

### Impact

- No tenant isolation
- Simplified authorization model
- Clearer learning and review surface

This is a **scope containment decision**, not a technical limitation.

---

## No Persistent Audit Log

### Decision

The system does not persist audit logs for scheduling changes.

### Alternative Considered

- Immutable audit event storage

### Reasoning

- Adds significant schema and storage complexity
- Requires long-term retention policies
- Not essential for portfolio goals

### Impact

- Reduced traceability
- Explicitly documented limitation
- Clear future extension path

---

## Minimal Frontend State Authority

### Decision

The frontend is treated as a **rendering and interaction layer**, not a rule authority.

### Alternative Considered

- Rich frontend validation and prediction

### Reasoning

- Prevents state divergence
- Simplifies QA testing
- Avoids duplicated business logic

### Impact

- More backend dependency
- Stronger consistency guarantees

---

## Testing Scope Tradeoffs

### Decision

The test strategy emphasizes:

- Business rule correctness
- Negative and failure cases
- Permission enforcement
- API-level validation

### Deferred Areas

- Full UI automation (Cypress)
- Load and performance testing
- Chaos testing

### Reasoning

- Backend correctness is higher risk
- UI behavior is deterministic and rule-driven
- QA artifacts focus on risk coverage

---

## Summary of Key Tradeoffs

| Area               | Chosen Path     | Reason                 |
| ------------------ | --------------- | ---------------------- |
| Backend logic      | Server-enforced | Prevent bypass         |
| Configuration      | JSON fields     | Flexibility            |
| Recurrence         | Metadata only   | Prevent data explosion |
| Demo data          | Deterministic   | Repeatability          |
| Tenancy            | Single-tenant   | Scope control          |
| Audit logging      | Deferred        | Complexity vs value    |
| Frontend authority | Minimal         | Consistency            |

---

## Why This Matters

These tradeoffs demonstrate:

- Awareness of production realities
- Intentional scope control
- Clear prioritization of correctness
- Honest documentation of limitations

This is **how real systems are designed**, not how toy projects are built.
