# Test Scope & Assumptions

## In Scope

- Backend REST APIs
- Authentication and JWT lifecycle
- Scheduling and appointment rules
- Role-based authorization
- Location and office integrity rules
- Dockerized execution environment

---

## Out of Scope

- Browser compatibility testing
- Load and stress testing
- Accessibility compliance (WCAG)
- Third-party integrations (email, SMS)

---

## Assumptions

- Frontend behavior is validated manually
- Backend is treated as the source of truth
- API tests reflect production-like behavior
- One provider user per session context

---

## Risk Acceptance

Certain non-critical UI-only defects may be accepted temporarily if backend data integrity
and authorization rules remain intact.
