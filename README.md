# Healthcare Scheduling SaaS

![Backend CI](https://github.com/cparn8/healthcare-saas/actions/workflows/backend-tests.yml/badge.svg)

A **production-deployed, portfolio-grade Healthcare Scheduling SaaS** designed to model real-world clinical scheduling complexity with a strong emphasis on **backend-enforced correctness, deterministic behavior, and industry-standard QA practices**.

This project intentionally prioritizes **engineering depth, testability, and system ownership** over superficial feature breadth, reflecting how real production SaaS systems are **designed, validated, and defended**.

---

## Table of Contents

- [Overview](#overview)
- [Key Capabilities](#key-capabilities)
- [Architecture Summary](#architecture-summary)
- [Tech Stack](#tech-stack)
- [Scheduling Model](#scheduling-model)
- [Authentication & Security](#authentication--security)
- [Quality Assurance & Testing](#quality-assurance--testing)
- [Continuous Integration](#continuous-integration)
- [Demo & Deterministic Data](#demo--deterministic-data)
- [Local Development](#local-development)
- [Production Deployment](#production-deployment)
- [Documentation](#documentation)
- [Design Philosophy](#design-philosophy)
- [Known Limitations](#known-limitations)
- [Status](#status)

---

## Overview

This application is a **multi-provider, multi-location scheduling system** modeled after healthcare workflows. It supports:

- Dense appointment schedules
- Explicitly authorized overlapping bookings
- Provider-scoped and admin-scoped permissions
- Dynamic business hours per location
- Deterministic demo resets for safe demonstrations

All data is **synthetic and non-PHI**, making the project safe for public demonstration while still modeling realistic healthcare constraints.

---

## Key Capabilities

### Scheduling

- Day and Week schedule views
- Drag-to-select appointment creation
- Visual clustering for overlapping appointments
- Block times (lunch, admin, out-of-office)
- Backend-driven double-booking confirmation workflow

### Multi-Location Support

- Normalized `Location` model
- Per-location business hours (`LocationHours`)
- Office-scoped scheduling conflicts
- Dynamic office selection in the UI

### Provider-Centric Design

- Providers authenticate individually
- Schedules filtered by provider(s)
- Role-based permissions (provider vs admin)
- Backend-enforced authorization rules

### Deterministic Demo Mode

- One-command demo reset
- Fixed providers, patients, and locations
- Rolling multi-week appointment window
- Idempotent and repeatable demo behavior

---

## Architecture Summary

```
Browser (React SPA)
        |
        | JWT (access + refresh)
        v
Django REST API
        |
        v
PostgreSQL
```

### Architectural Principles

- **Backend is authoritative**
  All scheduling rules, conflicts, and permissions are enforced server-side.

- **Frontend reflects backend truth**
  The UI does not speculate or bypass backend validation.

- **Configuration is data-driven**
  Business hours and appointment types are stored as data, not hardcoded logic.

- **Demo safety is first-class**
  Demo resets are deterministic, atomic, and safe to run repeatedly.

---

## Tech Stack

### Frontend

- React
- TypeScript
- Tailwind CSS
- Axios
- Nginx (production)

### Backend

- Python
- Django
- Django REST Framework
- SimpleJWT (access + refresh tokens)
- Gunicorn (production)

### Database

- PostgreSQL

### Infrastructure

- Docker & Docker Compose (local development)
- AWS ECS, ALB, and RDS (production)
- Route 53 & ACM for TLS

---

## Scheduling Model

Appointments follow explicit healthcare-style conflict rules.

### Conflict Definition

An appointment conflicts if **all** are true:

- Same provider
- Same date
- Same office
- Overlapping time window

Conflicts **cannot be created accidentally**.

### Double Booking Workflow

To intentionally double-book:

1. User attempts to save
2. Backend rejects with overlap error
3. User explicitly confirms override
4. Save retried with `allow_overlap=true`

This guarantees **intentionality, backend authority, and operational safety**.

---

## Authentication & Security

- JWT-based authentication
- Short-lived access tokens
- Refresh token rotation
- Object-level permission enforcement
- Admin-only destructive actions
- No PHI stored
- Synthetic demo credentials only

Security decisions are enforced **exclusively on the backend**.

---

## Quality Assurance & Testing

This project includes a **formal QA strategy and executable test suite**, designed and implemented as if supporting a real production SaaS.

### QA Ownership Highlights

- Designed and authored a **complete QA test strategy**
- Defined test scope, assumptions, risks, and release criteria
- Created comprehensive **manual test cases** covering:
  - Core user flows
  - Edge cases
  - Failure and negative scenarios

- Implemented **automated backend tests** validating:
  - Authentication and authorization
  - API contract enforcement
  - Business rules and data integrity

- Established **traceability mapping** from requirements to tests

### Automated Testing

- Pytest + pytest-django
- Database-backed integration tests
- Role-based permission validation
- Explicit negative and failure-path coverage
- Pytest markers (`auth`, `permissions`, `business_rules`, `api`) for targeted execution

Run tests locally:

```bash
docker compose exec backend pytest
```

---

## Continuous Integration

The backend test suite runs automatically via **GitHub Actions CI**.

### CI Characteristics

- Triggered on:
  - Push to `main`
  - Pull requests targeting `main`

- Dockerized test execution (environment parity)
- PostgreSQL service container
- Django migrations executed in CI
- Pytest run inside the backend container

This ensures **regressions are detected early** and deployment confidence remains high.

---

## Demo & Deterministic Data

The system is always demo-ready.

### Demo Reset

```bash
python manage.py seed_demo
```

### Demo Guarantees

- Fixed providers and locations
- 24 synthetic patients
- Deterministic scheduling patterns
- Safe fake emails, phones, and addresses

---

## Local Development

### Prerequisites

- Docker
- Docker Compose

### Start Backend & Database

```bash
docker-compose up --build
```

Backend runs at:

```
http://localhost:8000
```

### Frontend

```bash
npm install
npm start
```

---

## Production Deployment

- Backend served via Gunicorn
- Frontend served via Nginx
- Environment variables injected via `.env.prod`
- TLS terminated at the load balancer
- PostgreSQL hosted separately

The deployment architecture mirrors real SaaS systems while remaining cost-conscious.

---

## Documentation

All system and QA documentation lives in `/docs`.

### Core Documentation

```
/docs/00-executive-summary.md
```

### QA Documentation

```
/docs/qa/
```

Includes:

- Test strategy
- Risk analysis
- Manual test cases
- API test cases
- Negative test scenarios
- Regression scenarios
- Traceability matrix
- Release readiness checklist

---

## Design Philosophy

This project emphasizes:

- Correctness over convenience
- Explicit workflows over implicit behavior
- Backend authority over frontend trust
- Testability as a first-class concern

It is intentionally designed to reflect **how production scheduling systems are engineered, tested, and maintained**.

---

## Known Limitations

- Single-tenant architecture
- No persistent audit log
- Recurring appointments not materialized
- Frontend automated tests not yet implemented

These tradeoffs are documented explicitly in `/docs/10-design-tradeoffs.md`.

---

## Status

**Feature-complete and QA-validated for portfolio demonstration.**

This project demonstrates:

- End-to-end system ownership
- Backend correctness under edge conditions
- Professional QA strategy and execution
- CI-backed confidence in changes
