# Demo Data Strategy

## Purpose of This Document

This document explains how the system generates, manages, and protects **demo data** for the Healthcare Scheduling SaaS.

The demo data strategy is designed to satisfy **four competing goals simultaneously**:

1. Always be demo-ready
2. Be fully deterministic and repeatable
3. Eliminate all PHI / HIPAA risk
4. Accurately reflect real-world scheduling complexity

This strategy is a **core architectural feature**, not an afterthought.

---

## Design Principles

### 1. Determinism Over Randomness

All demo data is:

- Generated using fixed inputs
- Repeatable across environments
- Stable across resets

Running the demo reset multiple times produces **the same structural patterns**, enabling:

- Consistent screenshots
- Reliable QA execution
- Predictable interviews and walkthroughs

---

### 2. Safety by Construction

No real patient or provider data exists in the system.

All demo data is:

- Synthetic
- Non-routable
- Clearly labeled as fake
- Programmatically generated

This ensures the project is **publicly shareable** without risk.

---

### 3. Realism Without PHI

Although synthetic, the data models:

- Dense provider schedules
- Multi-location workflows
- Block times and partial-day availability
- Status variations across appointments

This allows the system to demonstrate **real healthcare scheduling behavior** without sensitive data.

---

## Demo Reset Mechanism

### Entry Point

The system exposes a **single deterministic reset command**:

```bash
python manage.py seed_demo
```

This command performs a full wipe and reseed of demo data.

---

### Atomic Execution

- Entire reset runs inside a database transaction
- Partial resets cannot occur
- Any failure results in a full rollback

This guarantees:

- Data consistency
- Referential integrity
- Safe repeated execution

---

### Deletion Order (FK-Safe)

Data is deleted in a strict order to avoid constraint violations:

1. Appointments
2. Patients
3. Providers
4. Users
5. Locations
6. Schedule settings
7. Business settings

This ensures the reset can always run cleanly.

---

## Seeded Entities

### Locations

- Fixed set of locations (e.g., North / South)
- Stable slugs used throughout scheduling
- Deterministic business hours
- Closed weekends, open weekdays by default

Locations are guaranteed to:

- Exist after reset
- Have complete `LocationHours` rows
- Be safe to reference from appointments

---

### Providers

- Fixed provider set (A–F)
- Deterministic usernames and credentials
- Stable specialties and roles
- Some providers elevated as admins

Each provider:

- Has a linked Django `User`
- Is guaranteed to be login-capable
- Is safe to use in demos and tests

---

### Patients

- Fixed set of 24 synthetic patients
- Balanced genders
- Wide age distribution
- No real contact data

Only minimal patient fields are populated to reduce PHI surface area.

---

### Appointments

Appointments are seeded across a **rolling six-week window**:

- Three weeks in the past
- Current week
- Three weeks in the future

This ensures:

- Meaningful historical data
- Active schedules
- Future availability

---

## Scheduling Patterns

### Daily Structure

For each provider, each weekday typically includes:

- Morning appointments
- Lunch block
- Afternoon appointments
- Admin or out-of-office blocks

This produces **realistic density and variation**.

---

### Location Assignment

Providers:

- Alternate locations by day or half-day
- Sometimes split mornings and afternoons
- Occasionally work full days at one location

This stresses:

- Multi-location filtering
- Office-scoped conflict rules
- Business-hours logic

---

### Block Times

Block appointments include:

- Lunch
- Admin time
- Out-of-office half days

Block times:

- Use a standardized gray color
- Are clearly distinguishable in the UI
- Participate in conflict logic

---

## Deterministic Helpers

The system uses deterministic helper functions for:

- Fake phone numbers (`555-01xx`)
- Fake emails (`example.test`)
- Fake addresses
- Provider rotation
- Appointment type cycling

These helpers ensure:

- Predictable output
- No accidental real data
- Easy reasoning during QA

---

## Bootstrap Accounts

### Purpose

To ensure the system is **never locked out**, the backend includes a bootstrap mechanism that:

- Ensures demo and admin accounts always exist
- Runs safely during startup
- Is idempotent

---

### Properties

- Will not create duplicates
- Will not overwrite passwords unnecessarily
- Will not crash during migrations
- Safe in local and production environments

This is critical for:

- Demo reliability
- CI pipelines
- Cold-start deployments

---

## QA Alignment

The demo data strategy directly supports QA by:

- Providing stable test baselines
- Enabling repeatable manual test execution
- Ensuring consistent failure reproduction
- Supporting regression testing

All QA documents assume the presence of this deterministic dataset.

---

## Security & Compliance Notes

- No PHI or HIPAA-regulated data is stored
- All demo credentials are synthetic
- Emails use non-routable domains
- Phone numbers use reserved ranges

This makes the project safe for:

- Public GitHub hosting
- Recruiter review
- Recorded demos

---

## Summary

The demo data strategy is intentionally designed to:

- Be deterministic
- Be safe
- Be realistic
- Support QA rigor
- Enable confident public demonstration

It reflects **production-quality thinking** around demos, testing, and system safety.
