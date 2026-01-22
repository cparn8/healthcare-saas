# Security Considerations

## Purpose of This Document

This document outlines the **security posture, design decisions, and safeguards** implemented in the Healthcare Scheduling SaaS.

The goal is not to claim regulatory compliance, but to demonstrate **professional security awareness**, **defense-in-depth**, and **correct handling of sensitive domains** in a healthcare-adjacent system.

This document is written for:

- Security-conscious engineers
- QA reviewers validating negative and failure cases
- Hiring managers evaluating risk awareness
- Portfolio reviewers assessing production readiness

---

## Security Philosophy

The system is built around the following principles:

- **Backend authority over frontend trust**
- **Explicit permission checks over implicit assumptions**
- **Deterministic behavior over ambiguous state**
- **Minimization of sensitive data exposure**

Security is treated as a **system property**, not a feature.

---

## Authentication Security

### JWT-Based Authentication

The application uses **JSON Web Tokens (JWT)** for stateless authentication.

#### Token Types

| Token Type    | Purpose              | Lifetime              |
| ------------- | -------------------- | --------------------- |
| Access Token  | API authorization    | Short-lived           |
| Refresh Token | Session continuation | Longer-lived, rotated |

---

### Access Tokens

- Short-lived by design
- Included via `Authorization: Bearer <token>`
- Required for all protected endpoints

Short lifetimes reduce risk in case of token leakage.

---

### Refresh Tokens

- Rotated on every refresh
- Invalidated after use
- Stored securely client-side
- Used only to obtain new access tokens

This reduces replay risk and long-term credential exposure.

---

## Authorization & Permissions

### Default Policy

- All API endpoints require authentication unless explicitly marked `AllowAny`
- Authorization is enforced **server-side**

---

### Role-Based Access Control

| Role      | Capabilities                  |
| --------- | ----------------------------- |
| Admin     | Full access to all resources  |
| Provider  | Access scoped to own data     |
| Anonymous | Authentication endpoints only |

---

### Object-Level Permissions

The backend enforces object ownership:

- Providers may only modify their own records
- Cross-provider access is blocked
- UI state is never trusted to imply authorization

This is validated via automated permission tests.

---

## API Security Controls

### Input Validation

All write operations include:

- Required field validation
- Type validation
- Domain-specific validation (e.g., scheduling conflicts)

Invalid or malformed requests are rejected with **explicit error responses**.

---

### Business Rule Enforcement

Critical rules enforced server-side include:

- Time overlap detection
- Office-scoped conflicts
- Patient requirements for non-block appointments
- Explicit override requirements for double-booking

These rules **cannot be bypassed by client manipulation**.

---

## Data Protection & Privacy

### PHI Avoidance

The system intentionally stores **no real PHI**.

Measures include:

- Synthetic patient data only
- Fake emails (`example.test`)
- Fake phone numbers and addresses
- No medical records or diagnoses

This makes the system safe for public demonstration and review.

---

### Database Security

- PostgreSQL hosted via RDS
- Encrypted at rest
- Encrypted in transit (SSL enforced)
- Network-restricted access (private subnets)

The database is **never exposed publicly**.

---

## Transport Security

### TLS Enforcement

- All production traffic uses HTTPS
- TLS terminated at the Application Load Balancer
- Certificates managed by AWS ACM

---

### CORS Restrictions

| Environment | CORS Policy               |
| ----------- | ------------------------- |
| Local       | Open for development      |
| Production  | Locked to frontend origin |

This prevents unauthorized browser-based access in production.

---

## Environment & Secrets Management

- Secrets are injected via environment variables
- No secrets are committed to version control
- Separate configurations for dev and prod
- Sensitive defaults overridden in production

---

## Demo & Reset Safeguards

The demo reset functionality is protected by:

- Authentication requirements
- Server-side enforcement
- Transactional execution
- Idempotent logic

This prevents accidental or malicious misuse.

---

## Logging & Observability Considerations

- No sensitive data is logged
- Errors are explicit but non-leaking
- Authentication failures do not expose internal state

---

## QA & Security Validation

Security concerns are validated through:

- Negative test cases
- Permission enforcement tests
- Unauthorized access attempts
- CI-enforced automated test execution

Security is treated as **testable behavior**, not assumed correctness.

---

## Known Security Limitations

The following are **explicitly acknowledged tradeoffs**:

- No audit log persistence
- No multi-tenant isolation
- No intrusion detection
- No rate limiting

These are documented and intentional for portfolio scope.

---

## Summary

This system demonstrates:

- Strong authentication hygiene
- Explicit authorization enforcement
- Secure deployment practices
- Privacy-aware data modeling
- QA-validated security behavior

The design reflects how **production SaaS systems are responsibly secured**, even when operating with synthetic data.
