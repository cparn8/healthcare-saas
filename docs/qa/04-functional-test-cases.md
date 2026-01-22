### AUTH-01: Provider Login

**Steps**

1. Enter valid credentials
2. Submit form

**Expected**

- JWT issued
- Redirect to schedule

---

### SCH-07: Overlap Detection

**Steps**

1. Create appointment
2. Create overlapping appointment

**Expected**

- Backend error
- UI confirmation
- Explicit override required
