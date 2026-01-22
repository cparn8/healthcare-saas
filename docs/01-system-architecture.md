# System Architecture

## Purpose of This Document

This document describes the **end-to-end system architecture** of the Healthcare Scheduling SaaS, including:

- Component boundaries
- Data flow
- Trust boundaries
- Deployment topology
- Architectural rationale

It explains _why_ the system is structured the way it is, not just _what_ technologies are used.

---

## High-Level Architecture Overview

The system follows a **modern, decoupled SPA + API architecture** with a clear separation between presentation, business logic, and persistence layers.

```
Client Browser
   |
   | HTTPS + JWT (Access / Refresh)
   v
React Single-Page Application
(Nginx, Containerized)
   |
   | REST API (JSON)
   v
Django REST API
(Gunicorn, Containerized)
   |
   | ORM / SQL
   v
PostgreSQL
(RDS in Production / Docker locally)
```

---

## Core Architectural Goals

The architecture is designed to satisfy the following non-functional requirements:

1. **Backend authority over business rules**
2. **Deterministic behavior across environments**
3. **Clear security and trust boundaries**
4. **Testability and QA traceability**
5. **Production realism without unnecessary complexity**

---

## Component Breakdown

### 1. Client (Browser)

**Responsibilities**

- Render schedules (Day / Week views)
- Collect user input (drag-to-select, filters, modals)
- Display backend-validated results
- Handle authentication token storage and refresh

**Explicit Non-Responsibilities**

- Enforcing scheduling rules
- Validating conflicts
- Determining business hours
- Making authorization decisions

The browser is considered **untrusted** and **non-authoritative**.

---

### 2. Frontend Application (React SPA)

**Key Characteristics**

- Single-Page Application (SPA)
- Written in TypeScript
- Deterministic rendering based on backend data
- No speculative or optimistic writes

**Responsibilities**

- UI state management
- Visualization of dense schedules
- Conflict visualization and clustering
- Explicit confirmation workflows (e.g., double booking)

**Design Decision**
The frontend intentionally avoids duplicating backend business logic.
This prevents **logic drift**, **false positives**, and **security bypasses**.

---

### 3. API Layer (Django REST Framework)

The API layer is the **authoritative core of the system**.

**Responsibilities**

- Authentication and authorization
- Business rule enforcement
- Scheduling conflict detection
- Data validation
- Permission checks
- Error signaling

**Key Properties**

- Stateless (JWT-based auth)
- Explicit error responses
- Deterministic validation outcomes
- Defensive defaults (reject unless explicitly allowed)

**Example**
Overlapping appointments are **rejected by default** and can only be created if:

- A conflict is detected
- The backend signals the conflict
- The client explicitly retries with `allow_overlap=true`

---

### 4. Database Layer (PostgreSQL)

**Role**

- Single source of truth for system state

**Key Characteristics**

- Relational schema
- Enforced constraints (e.g., uniqueness)
- Transactional integrity
- Referential consistency

**Design Choice**
All scheduling logic depends on persisted state, not cached or inferred data, ensuring **correctness under concurrency and reloads**.

---

## Data Flow Summary

### Read Path (Typical)

1. Client requests schedule data
2. API:
   - Authenticates user
   - Applies permission filters
   - Injects authoritative business hours

3. Database returns persisted state
4. API serializes validated response
5. Frontend renders deterministic UI

---

### Write Path (Appointment Creation)

1. User selects time slot in UI
2. Client submits request
3. API:
   - Validates payload
   - Checks permissions
   - Detects conflicts
   - Rejects or accepts based on rules

4. Database transaction commits
5. API returns authoritative result
6. UI re-renders based on backend truth

---

## Security & Trust Boundaries

| Layer        | Trust Level  | Notes               |
| ------------ | ------------ | ------------------- |
| Browser      | Untrusted    | User-controlled     |
| Frontend SPA | Semi-trusted | No authority        |
| API          | Trusted      | Enforces all rules  |
| Database     | Trusted      | Authoritative state |

No layer below the API trusts any upstream layer for correctness.

---

## Environment Parity

The architecture is designed to behave consistently across:

- Local development (Docker Compose)
- CI (GitHub Actions)
- Production (AWS ECS + RDS)

Key mechanisms ensuring parity:

- Containerization
- Environment-driven configuration
- Deterministic demo seeding
- Backend-driven rules

---

## QA & Testability Considerations

This architecture explicitly supports QA objectives:

- Clear seams for API testing
- Deterministic demo state
- Backend-testable business rules
- CI-enforced validation
- Traceability from requirements → tests → risks

The architecture intentionally avoids hidden coupling that would obscure test coverage.

---

## Architectural Tradeoffs

| Decision                | Benefit               | Tradeoff                      |
| ----------------------- | --------------------- | ----------------------------- |
| Backend-enforced rules  | Security, correctness | More backend complexity       |
| No optimistic UI        | Data integrity        | Slightly less perceived speed |
| SPA + API               | Scalability           | Requires coordination         |
| Deterministic demo data | Reliable QA           | Less randomness               |

These tradeoffs are **documented and intentional**, not accidental.

---

## Summary

This system architecture reflects **real-world SaaS patterns** while remaining intentionally scoped for portfolio evaluation.

It demonstrates:

- Backend ownership
- Security-first thinking
- Testability
- Clear responsibility boundaries
- Production-grade architectural judgment
