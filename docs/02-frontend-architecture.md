# Frontend Architecture

## Purpose of This Document

This document describes the **frontend architecture** of the Healthcare Scheduling SaaS, focusing on:

- Structural organization
- Data flow and rendering pipeline
- Scheduling-specific complexity handling
- Intentional constraints and non-responsibilities
- Testability and maintainability considerations

The frontend is designed to **accurately reflect backend truth**, not to independently reason about scheduling rules.

---

## Frontend Architectural Goals

The frontend architecture is driven by the following goals:

1. **Deterministic rendering**
2. **Strict separation of concerns**
3. **Scalability of complex UI state**
4. **Minimal duplication of backend logic**
5. **High testability and debuggability**

The UI must remain predictable even under:

- Dense schedules
- Overlapping appointments
- Multi-provider views
- Partial data reloads

---

## Technology Stack

### Core Technologies

- **React** – Component-based UI framework
- **TypeScript** – Compile-time type safety and explicit contracts
- **Tailwind CSS** – Utility-first styling with design-token consistency
- **Axios** – HTTP client with JWT handling and interceptors
- **React Router** – SPA routing

### Supporting Patterns

- Custom hooks for domain logic
- Stateless presentational components where possible
- Centralized API services
- Explicit modal-based workflows

---

## Application Structure

The frontend follows a **feature-first (domain-driven) organization**, rather than a technical-layer-based structure.

```
src/
├── features/
│   ├── auth/
│   ├── schedule/
│   ├── patients/
│   ├── providers/
│   └── locations/
├── services/
├── utils/
├── components/
└── styles/
```

---

## Feature Boundaries

Each feature owns:

- Its pages
- Its hooks
- Its API calls
- Its UI components
- Its domain-specific logic

### Example: `features/schedule`

```
features/schedule/
├── pages/
├── components/
├── hooks/
├── logic/
├── services/
└── types.ts
```

**Benefits**

- Clear ownership
- Predictable scaling
- Reduced cross-feature coupling
- Easier onboarding
- Easier QA traceability

---

## Data Flow Philosophy

The frontend follows a **unidirectional, backend-driven data flow**:

```
API → Hooks → Derived Selectors → UI Components
```

At no point does the frontend:

- Guess business rules
- Assume validity
- Bypass backend decisions

---

## Schedule Rendering Pipeline

Scheduling is the most complex frontend domain. Rendering a schedule involves multiple explicit stages.

---

### 1. Data Fetching

**Primary Hook**

- `useScheduleData`

**Responsibilities**

- Fetch appointments
- Fetch schedule settings
- Normalize API responses
- Expose reload mechanisms

**Key Property**
All fetched data is already **validated and filtered by the backend**.

---

### 2. Visibility Window

**Hook**

- `useVisibleAppointments`

**Responsibilities**

- Restrict appointments to visible date range
- Deduplicate strictly by appointment ID
- Preserve overlapping appointments

**Design Decision**
Appointments are **never deduplicated by time** to ensure double-booked appointments remain visible.

---

### 3. Filtering Layer

**Filters include**

- Selected office(s)
- Selected provider(s)
- Appointment status
- Appointment type

**Implementation**

- Pure, deterministic functions
- No side effects
- Fully testable logic

Filters are applied **after** visibility filtering to ensure correctness.

---

### 4. Time Normalization & Positioning

Appointments are normalized into minute-based offsets:

- Convert `HH:MM` → minutes since midnight
- Compute vertical placement
- Compute duration-based height

This allows consistent rendering regardless of slot size (15 / 30 / 60 minutes).

---

### 5. Overlap Detection & Clustering

Dense overlaps are grouped into clusters:

- Overlapping time windows
- Same provider and office context
- Same day

Clusters are then:

- Expanded (side-by-side boxes), or
- Collapsed into a single visual element if density exceeds thresholds

This ensures usability even under extreme scheduling density.

---

### 6. Rendering Layer

**Primary Components**

- `DayViewGrid`
- `WeekViewGrid`

**Responsibilities**

- Render time grid
- Render appointments
- Render clusters
- Handle drag-to-select
- Emit events upward (edit, create)

Rendering components remain **stateless with respect to business rules**.

---

## Interaction Workflows

### Appointment Creation

1. User drags to select a time range
2. Frontend opens modal
3. User submits form
4. Backend validates
5. Conflict error returned if applicable
6. Frontend prompts explicit confirmation
7. User retries with override flag

No speculative UI state is committed before backend confirmation.

---

### Appointment Editing

- Editing always loads persisted backend state
- Conflicts are revalidated on save
- UI does not assume previous validity

---

## Authentication Handling

- Access tokens stored in memory + storage
- Axios interceptor handles token refresh
- All API calls flow through a single configured client
- Unauthorized responses force logout

The frontend does not store sensitive information beyond tokens.

---

## Styling & Design System

- Tailwind utility classes
- Shared color tokens
- Grid-based layout for schedule
- Visual distinction for:
  - Blocks
  - Conflicts
  - Overlaps
  - Closed hours

Styling is intentionally conservative and clinical to match domain expectations.

---

## Error Handling Strategy

- Backend error messages are surfaced verbatim where appropriate
- Conflict errors trigger explicit user confirmation flows
- Validation errors are field-specific
- Silent failures are avoided

---

## Frontend Testability Considerations

Although automated frontend tests are limited, the architecture supports:

- Isolated hook testing
- Deterministic UI state
- Reproducible demo scenarios
- Manual QA workflows with traceability

---

## Explicit Non-Goals

The frontend intentionally does **not**:

- Enforce scheduling rules
- Resolve conflicts automatically
- Cache authoritative state
- Support offline scheduling

These decisions prevent subtle correctness bugs.

---

## Summary

The frontend architecture emphasizes:

- Predictability over cleverness
- Backend authority over UI assumptions
- Clear domain boundaries
- Safe handling of complex scheduling density

It reflects **production-grade frontend decision-making**, aligned with real-world healthcare SaaS constraints.
