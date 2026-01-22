# Severity & Priority Guidelines

## Purpose

This document defines how defects are classified by **severity** and **priority** in the Healthcare Scheduling SaaS.

It ensures:

- Consistent triage decisions
- Clear communication between QA and engineering
- Professional-grade defect management aligned with real-world SaaS teams

Severity and priority are **not the same thing** and must be evaluated independently.

---

## Severity Definitions (Impact)

Severity measures **how badly the system is affected**.

### Critical

**System is unusable or unsafe**

Criteria:

- Data corruption or data loss
- Security vulnerability (auth bypass, PHI exposure)
- Application crash or total outage
- Inability to log in or access core system

Examples:

- Providers can access other providers’ appointments
- Appointments deleted unintentionally
- Login tokens accepted when expired

---

### High

**Core functionality broken**

Criteria:

- Major scheduling logic failure
- Business rules violated with no workaround
- Prevents normal daily usage

Examples:

- Overlapping appointments allowed without confirmation
- Locations deleted while appointments reference them
- Business hours ignored in schedule views

---

### Medium

**Partial functionality loss or degraded experience**

Criteria:

- Feature works but incorrectly
- Workaround exists
- Does not block core workflows

Examples:

- Incorrect appointment color applied
- Intake status not updating visually
- Filter state resets unexpectedly

---

### Low

**Cosmetic or minor usability issue**

Criteria:

- No functional impact
- UI-only issue
- Does not affect data integrity

Examples:

- Misaligned buttons
- Typo in modal text
- Minor spacing issues

---

## Priority Definitions (Urgency)

Priority determines **when the issue should be fixed**, regardless of severity.

### P0 – Immediate

Fix before any further work.

Used when:

- Production system is broken
- Legal, security, or compliance risk
- Blocking all users

---

### P1 – High

Fix before next release.

Used when:

- Core workflows affected
- High-severity issues
- No acceptable workaround

---

### P2 – Medium

Fix soon, but not release-blocking.

Used when:

- Medium severity issues
- Workarounds available
- Acceptable short-term risk

---

### P3 – Low

Backlog or opportunistic fix.

Used when:

- Cosmetic issues
- Enhancements
- Non-critical edge cases

---

## Severity vs Priority Matrix

| Severity \ Priority | P0  | P1  | P2  | P3  |
| ------------------- | --- | --- | --- | --- |
| Critical            | ✅  | ❌  | ❌  | ❌  |
| High                | ❌  | ✅  | ❌  | ❌  |
| Medium              | ❌  | ❌  | ✅  | ❌  |
| Low                 | ❌  | ❌  | ❌  | ✅  |

> Example:  
> A **High severity** bug is almost always **P1**, not P0.

---

## Example Classifications

### Example 1

**Bug:** Overlapping appointments allowed without warning

- Severity: High
- Priority: P1

---

### Example 2

**Bug:** Appointment tooltip text overlaps UI

- Severity: Low
- Priority: P3

---

### Example 3

**Bug:** Unauthorized user can delete locations

- Severity: Critical
- Priority: P0

---

## QA Decision Rules

- Severity is based on **impact**, not inconvenience
- Priority is based on **risk and timing**
- QA proposes severity and priority
- Product/Engineering may adjust priority, not severity

---

## Documentation Discipline

Every bug report must include:

- One severity
- One priority
- Justification if ambiguous

---

## Recruiter Signal

This document supports claims such as:

> “I defined and enforced severity and priority classification standards for a production SaaS.”

---

## Maintenance

- Review classifications quarterly
- Adjust definitions as product matures
- Keep aligned with release cadence
