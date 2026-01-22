# Authentication & Authorization

## Purpose of This Document

This document defines how **identity, authentication, and authorization** are implemented in the Healthcare Scheduling SaaS. It explains:

- How users authenticate
- How sessions are maintained securely
- How permissions are enforced
- How provider identity is tied to scheduling data
- How the system prevents privilege escalation

These mechanisms are **foundational to system correctness and security**.

---

## Identity Model

### User vs Provider

The system distinguishes between:

- **User** (Django `auth.User`)
- **Provider** (domain-specific identity)

Every authenticated scheduler **must** have:

- A valid `User`
- A linked `Provider` record

This ensures:

- Authentication is handled by Django’s proven auth system
- Domain logic (scheduling, permissions) operates on Providers

Login is considered **invalid** unless both exist.

---

## Authentication Mechanism

### Credentials

- Username + password
- Passwords stored using Django’s secure hashing
- Demo credentials are synthetic and non-sensitive

---

### JWT-Based Authentication

The system uses **JSON Web Tokens (JWT)** for stateless authentication.

#### Token Types

1. **Access Token**
   - Short-lived
   - Sent with every API request
   - Used for authorization decisions

2. **Refresh Token**
   - Longer-lived
   - Used to obtain new access tokens
   - Rotated to reduce replay risk

---

### Login Flow

1. Client submits username/password
2. Backend validates credentials
3. Backend verifies Provider linkage
4. Backend returns:
   - Access token
   - Refresh token
   - Provider metadata

5. Client stores tokens securely

This flow is fully covered by automated API tests.

---

### Token Verification

- `/auth/verify/` endpoint validates access tokens
- Used on application startup for auto-login
- Invalid or expired tokens force logout

This ensures **session correctness** even after refresh cycles.

---

## Authorization Model

### Default Rule

> **All API endpoints require authentication unless explicitly exempted.**

There is no anonymous scheduling access.

---

### Role-Based Authorization

Authorization is enforced at multiple layers:

#### 1. Global Role (User Flags)

- `is_staff`
- `is_superuser`

These flags determine **administrative privileges**.

---

#### 2. Domain Role (Provider Ownership)

Providers:

- May view their own schedules
- May modify their own appointments
- Are restricted from editing others unless elevated

Admins:

- May view and modify all records
- May manage locations, hours, and system settings

---

### Permission Enforcement Strategy

- Permissions are enforced **server-side**
- No frontend trust assumptions
- API requests are validated against:
  - Authenticated user
  - Linked provider
  - Object ownership
  - Role flags

This prevents:

- Token spoofing
- UI manipulation
- Privilege escalation

---

## Object-Level Authorization Examples

### Appointments

- Providers may create appointments only for themselves
- Providers may edit only their own appointments
- Admins may edit all appointments

### Locations

- Readable by all authenticated users
- Writable (create/update/delete) by admins only
- Deletion blocked if referenced by appointments

### Schedule Settings

- Readable by all authenticated users
- Writable only by admins

---

## Admin vs Non-Admin Behavior

| Action                      | Provider | Admin |
| --------------------------- | -------- | ----- |
| View schedule               | Yes      | Yes   |
| Edit own appointments       | Yes      | Yes   |
| Edit others’ appointments   | No       | Yes   |
| Manage locations            | No       | Yes   |
| Delete locations in use     | No       | No    |
| Update system configuration | No       | Yes   |

These rules are **explicitly tested** in automated and manual QA.

---

## Security Principles

### Backend Authority

The backend is the **sole authority** for:

- Authentication state
- Token validity
- Permission enforcement
- Role resolution

Frontend behavior cannot override backend rules.

---

### Defense-in-Depth

Security is enforced at:

- Authentication layer
- Permission classes
- Viewset logic
- Serializer validation

This layered approach reduces the blast radius of any single failure.

---

## Demo & Bootstrap Accounts

The system includes a **bootstrap mechanism** to ensure:

- Demo accounts always exist
- Admin access is always available
- Credentials are deterministic

This logic is:

- Idempotent
- Safe during migrations
- Disabled from creating duplicates

---

## QA & Testability Alignment

Authentication and authorization are validated via:

- Automated API tests
- Negative credential tests
- Permission boundary tests
- Admin vs non-admin behavior tests

Every rule in this document maps to:

- Test cases
- Traceability matrix entries
- CI validation

---

## Summary

The authentication and authorization system is designed to be:

- Secure by default
- Explicit in intent
- Resistant to UI bypass
- Fully testable
- Aligned with production SaaS patterns

It demonstrates **real-world identity and access control practices** expected in healthcare-adjacent systems.
