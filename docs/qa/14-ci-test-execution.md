# CI Test Execution

## Purpose

This document defines how automated tests are executed locally and in
continuous integration to prevent regressions and enforce quality gates.

---

## Local Execution

Developers and testers execute the full backend test suite using Docker:

docker compose exec backend pytest

Targeted execution is supported via markers:

docker compose exec backend pytest -m permissions  
docker compose exec backend pytest -m business_rules

---

## Continuous Integration Strategy

The CI pipeline is designed to:

- Build the backend Docker image
- Apply database migrations
- Execute automated tests
- Fail fast on any test failure

Tests act as a hard gate for merge and deployment.

---

## Planned GitHub Actions Flow

1. Checkout repository
2. Build Docker images
3. Start services via Docker Compose
4. Run pytest inside backend container
5. Capture logs on failure

---

## Failure Handling

- Any failing test fails the pipeline
- Logs are retained for debugging
- No partial or soft-fail behavior

This ensures that broken business rules or permission regressions
cannot be silently deployed.

---

## Future Enhancements

- Code coverage reporting
- Test artifacts (JUnit XML)
- Parallel test execution
- Nightly full regression runs
