# Bug Report Template

## Purpose

This bug report template standardizes how defects are documented, communicated, and triaged.

It ensures:

- Clear reproduction steps
- Consistent severity and priority assignment
- Actionable information for developers
- Audit- and recruiter-ready QA documentation

This format mirrors professional QA workflows used in production SaaS teams.

---

## Bug Report Format

### Bug ID

- Format: `BUG-YYYYMMDD-###`
- Example: `BUG-20260314-004`

---

### Title

Short, descriptive summary of the defect.

**Example:**

> Overlapping appointment allowed without confirmation in Day View

---

### Environment

Specify where the bug occurred.

- Environment: `Local / Staging / Production`
- Browser: `Chrome 122 / Firefox 123 / Safari`
- OS: `Windows 11 / macOS / Linux`
- Backend Version / Commit:
- Frontend Version / Commit:

---

### Preconditions

State any required setup before reproducing the issue.

**Example:**

- Logged in as provider user
- North Office exists and is active
- Existing appointment from 12:00–13:00

---

### Steps to Reproduce

Numbered, deterministic steps.

1. Navigate to Schedule → Day View
2. Select North Office
3. Drag to create an appointment from 12:30–13:00
4. Save appointment without confirming overlap

---

### Expected Result

Describe correct system behavior.

**Example:**

- System blocks save OR
- System prompts user to confirm overlap

---

### Actual Result

Describe observed behavior.

**Example:**

- Appointment saves without warning

---

### Severity

Select one:

- **Critical** – Data loss, security issue, system unusable
- **High** – Core functionality broken
- **Medium** – Feature partially broken, workaround exists
- **Low** – Minor issue, cosmetic, usability

---

### Priority

Select one:

- **P0** – Fix immediately
- **P1** – Fix before release
- **P2** – Fix soon
- **P3** – Backlog

---

### Frequency

- Always
- Intermittent
- Rare

---

### Impact Analysis

Who and what is affected?

**Example:**

- Providers can double-book patients unintentionally
- Violates scheduling business rules

---

### Attachments / Evidence

Include:

- Screenshots
- Screen recordings
- Console logs
- API responses

---

### Related Test Cases

Reference affected test IDs.

**Example:**

- QA-API-004
- QA-NEG-002
- QA-REG-APPT-002

---

### Root Cause (if known)

(Optional – usually filled after analysis)

---

### Fix Verification Notes

Steps to confirm the bug is resolved.

---

## Example Bug Report (Filled)

**Bug ID:** BUG-20260314-001  
**Title:** Location deletion allowed while appointments reference office slug  
**Severity:** High  
**Priority:** P1

**Expected:** Deletion blocked with validation error  
**Actual:** Location deleted, appointments orphaned

**Status:** Fixed  
**Fix Verified By:** Automated test `QA-API-006`

---

## Usage Guidelines

- One bug per report
- Be factual, not speculative
- Reproduce before filing
- Update status as it moves through workflow

---

## QA Maturity Signal

This artifact supports claims such as:

> “I created standardized bug reporting workflows for a production-grade SaaS.”

---

## Maintenance

- Template should evolve with team needs
- Keep severity definitions aligned with release risk
