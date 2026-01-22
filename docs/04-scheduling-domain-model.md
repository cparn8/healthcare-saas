# Scheduling Domain Model

## Purpose of This Document

This document defines the **core scheduling domain model** for the Healthcare Scheduling SaaS. It explains:

- The conceptual entities involved in scheduling
- The rules governing appointment creation and conflicts
- How block times differ from patient appointments
- Why certain constraints are enforced server-side
- How the domain supports QA validation and deterministic behavior

This is the **most critical business domain** in the entire system.

---

## Domain Overview

The scheduling domain is designed to model **real-world healthcare scheduling constraints**, including:

- Dense appointment calendars
- Multiple providers
- Multiple locations with distinct hours
- Intentional double-booking (never accidental)
- Administrative and non-patient blocks
- High confidence in correctness under edge cases

The system explicitly prioritizes **data integrity and intent clarity** over flexibility.

---

## Core Entities

### Appointment

The **Appointment** entity represents _any_ scheduled time block on a provider’s calendar.

This includes:

- Patient visits
- Administrative blocks
- Lunch breaks
- Out-of-office time

Appointments are intentionally modeled as a **single unified entity**, not separate tables, to ensure consistent conflict enforcement.

---

## Appointment Types

Appointments fall into two high-level categories:

### 1. Patient Appointments

Characteristics:

- Must reference a patient
- Represent clinical interactions
- Use configured appointment types (Consult, Follow-up, etc.)
- Participate fully in conflict detection

Constraints:

- Patient is required
- Duration and color may be inferred from configuration
- Status workflows apply

---

### 2. Block Appointments

Characteristics:

- No patient required
- Represent non-clinical time
- Examples:
  - Lunch
  - Admin
  - Out of Office

Constraints:

- Still participate in conflict detection
- Still block time on the schedule
- Still require explicit overlap override if double-booked

Block appointments are **first-class citizens**, not special cases.

---

## Appointment Fields (Conceptual)

Key fields include:

- `provider` – Owning provider
- `patient` – Nullable for blocks
- `office` – Location slug
- `date` – Calendar date
- `start_time` / `end_time` – Time window
- `duration` – Stored explicitly
- `appointment_type` – Human-readable label
- `is_block` – Block vs patient appointment
- `status` – Workflow state
- `allow_overlap` – Explicit override flag

This explicit modeling allows QA tests to validate **every dimension independently**.

---

## Canonical Conflict Rule

An appointment **conflicts** with another appointment if **all** of the following are true:

1. Same provider
2. Same date
3. Same office
4. Overlapping time window

If any condition is false, the appointments do **not** conflict.

This rule is:

- Centralized
- Deterministic
- Backend-enforced
- Covered by automated tests

---

## Overlap Detection Semantics

### Default Behavior

- Overlaps are **rejected**
- Backend returns a 400 validation error
- Error message explicitly states the conflict

### Explicit Override Flow

To allow a double-booking:

1. User attempts to save appointment
2. Backend detects conflict
3. Backend returns overlap error
4. UI prompts for confirmation
5. User explicitly confirms
6. Client retries with `allow_overlap=true`
7. Backend permits creation

This ensures **no overlap can occur accidentally**.

---

## Why Overlaps Are Explicit

In real healthcare environments:

- Double-booking can be valid
- But must always be intentional

The system enforces:

- Intent clarity
- Auditability
- QA verifiability

This design is frequently used in production medical systems.

---

## Office-Scoped Conflicts

Appointments are scoped by **office (location slug)**.

This allows:

- Same provider to be booked at different locations on the same day
- Independent business hours per location
- Realistic multi-office workflows

Office identity is treated as **stable domain data**, not UI state.

---

## Business Hours Interaction

Business hours:

- Are location-specific
- Are enforced visually in the UI
- Are authoritative on the backend

Closed hours:

- Are not selectable in normal workflows
- Still protected by backend validation
- Can be overridden only intentionally

---

## Recurrence Metadata (Non-Materialized)

Appointments include recurrence metadata but:

- Recurring appointments are **not expanded** into child records
- This avoids hidden state and silent mutations
- Keeps scheduling logic explicit and inspectable

This is a deliberate design tradeoff documented elsewhere.

---

## Status Workflow (Conceptual)

Appointments support workflow states such as:

- Pending
- Arrived
- In lobby
- Seen
- Tentative

Status does **not** affect conflict detection.

This ensures:

- Scheduling correctness is independent of workflow state
- QA can test conflicts without workflow coupling

---

## Deterministic Behavior

The scheduling model guarantees:

- Identical inputs → identical results
- No time-dependent randomness
- Repeatable demo data
- Predictable test outcomes

This is critical for:

- Automated tests
- CI validation
- Interview demos

---

## Testability & QA Alignment

The scheduling domain is explicitly designed to support:

- API-level conflict testing
- Negative test cases
- Permission testing
- Edge-case validation
- Traceability mapping to requirements

Every rule in this document is covered by:

- Manual test cases
- Automated backend tests
- QA traceability artifacts

---

## Summary

The scheduling domain model emphasizes:

- Explicit intent over implicit behavior
- Server-side enforcement over UI trust
- Deterministic outcomes over convenience
- Real-world healthcare realism

It is intentionally strict, predictable, and testable—qualities expected in **production healthcare scheduling systems**.
