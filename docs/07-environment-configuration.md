# Environment Configuration

## Purpose of This Document

This document describes how the Healthcare Scheduling SaaS is configured across **local development**, **testing**, and **production** environments.

The environment strategy is designed to:

- Mirror real-world SaaS deployment patterns
- Support deterministic QA and CI execution
- Enforce security boundaries appropriately per environment
- Minimize configuration drift between stages

---

## Environment Overview

| Environment | Purpose                              |
| ----------- | ------------------------------------ |
| Local       | Active development & debugging       |
| CI / Test   | Automated test execution             |
| Production  | Live, publicly accessible deployment |

Each environment uses **the same codebase**, with behavior controlled exclusively via environment variables.

---

## Local Development Environment

### Goals

The local environment prioritizes:

- Fast iteration
- Developer visibility
- Minimal setup friction
- Full feature parity with production

---

### Tooling

- Docker
- Docker Compose
- Django development server
- PostgreSQL container

---

### Configuration Characteristics

| Setting    | Value / Behavior               |
| ---------- | ------------------------------ |
| Web server | Django `runserver`             |
| Database   | Local PostgreSQL container     |
| SSL/TLS    | Disabled                       |
| CORS       | Open (development convenience) |
| Debug mode | Enabled                        |
| Hot reload | Enabled via volume mounts      |

---

### Startup Flow

```bash
docker-compose up --build
```

This performs:

1. Image build
2. Database startup
3. Django migrations
4. Django server startup

The backend is available at:

```
http://localhost:8000
```

---

### Environment Variables

Local configuration is injected via:

```text
backend/.env.dev
```

Typical values include:

- `DEBUG=1`
- `DJANGO_SECRET_KEY=dev-only-secret`
- `ALLOWED_HOSTS=*`

Secrets in this file are **never used in production**.

---

## Test / CI Environment

### Goals

The test environment is optimized for:

- Repeatability
- Isolation
- Deterministic execution
- Zero manual intervention

---

### Key Properties

| Setting    | Value / Behavior                  |
| ---------- | --------------------------------- |
| Database   | Ephemeral PostgreSQL              |
| Migrations | Applied automatically             |
| Demo data  | Disabled unless explicitly seeded |
| Logging    | Reduced verbosity                 |
| Debug mode | Disabled                          |

---

### Pytest Integration

The system uses:

- `pytest`
- `pytest-django`
- Django test database creation

Tests are run inside Docker to ensure:

- Environment parity
- No host-machine dependencies
- Consistent results across machines

---

### CI Safety Guards

The application detects test execution via:

```text
PYTEST_RUNNING=1
```

This prevents:

- Bootstrap demo account creation
- Unintended data writes
- Side effects during import time

---

## Production Environment

### Goals

Production configuration prioritizes:

- Security
- Stability
- Observability
- Correctness under load

---

### Infrastructure Overview

- AWS ECS Fargate
- Gunicorn application server
- PostgreSQL (RDS)
- Application Load Balancer (ALB)
- TLS via ACM
- DNS via Route 53

---

### Backend Configuration

| Setting    | Production Value      |
| ---------- | --------------------- |
| Web server | Gunicorn              |
| Workers    | Configured per CPU    |
| Debug      | Disabled              |
| SSL/TLS    | Enforced end-to-end   |
| Database   | RDS with SSL enforced |

Gunicorn is used to:

- Support concurrency
- Improve reliability
- Mirror real SaaS deployments

---

### Frontend Configuration

- Built as static assets
- Served via Nginx
- SPA routing enabled
- No runtime secrets exposed

All API communication occurs over HTTPS.

---

### Security Controls

| Control             | Status                            |
| ------------------- | --------------------------------- |
| HTTPS enforced      | Yes                               |
| Secure cookies      | Yes                               |
| CORS restricted     | Yes                               |
| Environment secrets | Injected via ECS task definitions |
| PHI protection      | Synthetic-only data               |

---

## Configuration Consistency Strategy

The project enforces:

- **Same code in all environments**
- **Behavior driven only by env vars**
- **No environment-specific branching logic**

This minimizes:

- “Works on my machine” failures
- Production-only bugs
- QA drift

---

## Failure Isolation

Each environment is isolated such that:

- Local failures cannot impact production
- CI failures block merges
- Production secrets never appear in local or test configs

---

## QA & CI Alignment

Environment configuration directly supports QA by:

- Allowing tests to run in Docker
- Ensuring deterministic DB state
- Preventing demo logic from polluting test runs
- Supporting GitHub Actions execution

All automated tests assume this configuration model.

---

## Summary

The environment configuration strategy ensures:

- Realistic production parity
- Safe local experimentation
- Deterministic CI execution
- Strong security boundaries

It reflects **industry-standard SaaS environment discipline**, not ad-hoc setup.
