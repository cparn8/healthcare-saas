# Smoke Test Checklist

## Purpose

This smoke test checklist defines a **minimal, high-signal validation pass** used to confirm that the Healthcare Scheduling SaaS is stable after:

- A deployment
- A hotfix
- A configuration change
- Demo data reset

Smoke tests are intentionally fast and shallow.  
If **any smoke test fails**, deeper testing is blocked.

---

## When to Run Smoke Tests

Smoke tests must be executed:

- After production deployment
- After backend migrations
- After authentication or permissions changes
- Before demos or interviews
- Before release candidate approval

---

## Smoke Test Scope

Smoke tests validate:

- System availability
- Authentication
- Core scheduling flows
- Critical API endpoints
- Data integrity

They **do not** replace full regression testing.

---

## Smoke Test Checklist

### 1. System Availability

- [ ] Frontend loads successfully
- [ ] Backend API responds (`/api/health` or equivalent)
- [ ] No fatal console errors on initial load

---

### 2. Authentication

- [ ] Provider login succeeds with valid credentials
- [ ] Invalid credentials are rejected
- [ ] JWT token stored correctly
- [ ] Page refresh retains authenticated session
- [ ] Logout clears session and redirects to login

---

### 3. Authorization

- [ ] Authenticated provider can access Schedule page
- [ ] Unauthenticated user is redirected to login
- [ ] Non-admin provider cannot access admin-only endpoints

---

### 4. Schedule Load

- [ ] Schedule page loads without errors
- [ ] Locations dropdown populates
- [ ] Business hours render correctly
- [ ] Appointments load for selected date

---

### 5. Appointment Creation (Happy Path)

- [ ] Create a new appointment in Day View
- [ ] Appointment appears immediately on grid
- [ ] Correct color and duration applied
- [ ] Appointment persists after refresh

---

### 6. Appointment Editing

- [ ] Click existing appointment
- [ ] Edit modal opens
- [ ] Changes save successfully
- [ ] Updated data appears on schedule

---

### 7. Overlap Handling

- [ ] Attempt overlapping appointment
- [ ] Overlap warning is displayed
- [ ] Cancel prevents creation
- [ ] Confirm allows overlap when approved

---

### 8. Location Constraints

- [ ] Attempt to delete location in use
- [ ] Deletion is blocked with validation message

---

### 9. Demo Data Reset (If Enabled)

- [ ] Reset endpoint executes successfully
- [ ] Providers, locations, patients recreated
- [ ] Schedule repopulates deterministically

---

## Pass / Fail Criteria

- **Pass:** All items checked
- **Fail:** Any unchecked item

If failed:

- Stop release
- File bug
- Assign appropriate severity

---

## Evidence Collection

For production or demo runs:

- Record execution timestamp
- Capture screenshots if issues occur
- Log failures with Bug Report Template

---

## Ownership

- Executed by: QA / Engineer / Demo Owner
- Reviewed by: Lead Engineer (optional)

---

## Recruiter Signal

This artifact supports claims such as:

> “I defined and executed smoke testing procedures for a production SaaS.”

---

## Maintenance

- Update checklist as core flows change
- Keep minimal to ensure speed
