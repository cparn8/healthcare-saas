# Regression Test Scenarios

## Purpose

This document defines regression test scenarios for the Healthcare Scheduling SaaS.

Regression testing ensures that:

- New changes do not break existing functionality
- Core workflows remain stable across releases
- Previously resolved defects do not reappear

This is especially critical for a scheduling system with complex time-based logic.

---

## Regression Scope

Regression coverage includes:

- Authentication flows
- Appointment creation and updates
- Scheduling conflict detection
- Location and business settings
- Role-based access control

Regression tests are executed:

- After feature additions
- After refactors
- Before any production deployment

---

## Core Regression Scenarios

### QA-REG-AUTH-001 — Provider Login Still Works After Changes

Area:
Authentication

Scenario:
Verify provider login after backend or auth changes

Steps:

1. Navigate to login page
2. Log in using valid provider credentials

Expected Result:

- Login succeeds
- JWT access + refresh tokens issued
- User redirected to schedule page

Automation:
Manual + Automated

---

### QA-REG-AUTH-002 — Token Refresh Flow Remains Functional

Area:
Authentication

Scenario:
Ensure expired access token refreshes correctly

Steps:

1. Allow access token to expire
2. Trigger authenticated API call

Expected Result:

- Refresh token is used
- New access token issued
- Original request succeeds

Automation:
Manual

---

## Appointment Regression Scenarios

### QA-REG-APPT-001 — Appointment Creation

Area:
Appointments

Scenario:
Create a standard patient appointment

Steps:

1. Open New Appointment modal
2. Fill required fields
3. Save appointment

Expected Result:

- Appointment saved
- Visible in schedule grid
- Correct duration and color applied

Automation:
Manual

---

### QA-REG-APPT-002 — Block Time Creation

Area:
Appointments

Scenario:
Create provider block time (e.g., Lunch)

Steps:

1. Create appointment with block type
2. Save

Expected Result:

- Appointment saved as block
- No patient required
- Correct color applied

Automation:
Manual + Automated

---

### QA-REG-APPT-003 — Appointment Editing

Area:
Appointments

Scenario:
Edit existing appointment time or type

Steps:

1. Click appointment
2. Modify details
3. Save changes

Expected Result:

- Changes persist
- Schedule re-renders correctly

Automation:
Manual

---

### QA-REG-APPT-004 — Overlap Confirmation Flow

Area:
Scheduling

Scenario:
User attempts overlapping appointment

Steps:

1. Create overlapping appointment
2. Confirm overlap in modal

Expected Result:

- Confirmation dialog appears
- Appointment saved when confirmed

Automation:
Manual + Automated (partial)

---

## Schedule View Regression

### QA-REG-SCHED-001 — Day View Rendering

Area:
Schedule UI

Scenario:
Ensure Day View renders appointments correctly

Steps:

1. Open Day tab
2. Review appointment placement

Expected Result:

- Appointments correctly positioned
- Clusters collapse when dense

Automation:
Manual

---

### QA-REG-SCHED-002 — Week View Rendering

Area:
Schedule UI

Scenario:
Ensure Week View renders open days only

Steps:

1. Open Week tab
2. Review columns and hours

Expected Result:

- Closed days hidden
- Appointments render per open hours

Automation:
Manual

---

## Location & Settings Regression

### QA-REG-LOC-001 — Location Cannot Be Deleted If In Use

Area:
Locations

Scenario:
Attempt deletion of location with appointments

Expected Result:

- Deletion blocked
- Clear error message returned

Automation:
Automated

---

### QA-REG-SET-001 — Appointment Type Defaults Persist

Area:
Schedule Settings

Scenario:
Ensure appointment type defaults still apply

Steps:

1. Create appointment using configured type

Expected Result:

- Duration and color applied from settings

Automation:
Manual + Automated

---

## Regression Execution Strategy

Regression testing is performed:

- Before tagging a release
- Before demo resets
- After database migrations

Priority is given to:

- Authentication
- Appointment creation
- Conflict detection

---

## QA Value Statement

This regression suite demonstrates:

- Long-term quality ownership
- Risk-based testing discipline
- Production SaaS maintenance readiness
