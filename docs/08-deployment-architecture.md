# Deployment Architecture

## Purpose of This Document

This document describes how the Healthcare Scheduling SaaS is deployed in **production**, including infrastructure components, traffic flow, domain routing, and operational guarantees.

The deployment architecture is intentionally designed to:

- Reflect real-world SaaS production patterns
- Enforce security and isolation boundaries
- Support scalability and reliability
- Remain understandable and auditable for reviewers and QA stakeholders

---

## High-Level Deployment Topology

```
User Browser
     |
     | HTTPS (TLS)
     v
Route 53 (DNS)
     |
     v
Application Load Balancer (ALB)
     |
     |---------------------------|
     |                           |
     v                           v
Frontend Service            Backend Service
(ECS + Nginx)              (ECS + Gunicorn)
     |                           |
     |                           v
     |                      PostgreSQL (RDS)
     |
     v
Static Assets (SPA)
```

---

## AWS Infrastructure Components

### Elastic Container Service (ECS – Fargate)

The application is deployed as **containerized services** using AWS ECS Fargate.

#### Services

| Service  | Responsibility               |
| -------- | ---------------------------- |
| Frontend | Serve React SPA via Nginx    |
| Backend  | Django REST API via Gunicorn |

Key characteristics:

- Serverless container execution
- No EC2 instance management
- Task-level isolation
- Explicit CPU and memory limits

---

### Application Load Balancer (ALB)

The ALB is the **entry point** for all application traffic.

Responsibilities:

- TLS termination
- Host-based routing
- Health checks
- Traffic distribution

---

### PostgreSQL (RDS)

A managed PostgreSQL instance is used for persistent data storage.

Key properties:

- Encrypted at rest
- Encrypted in transit (SSL)
- Automated backups
- Network isolation via VPC

The database is **not publicly accessible**.

---

### Route 53 (DNS)

Route 53 provides authoritative DNS routing for all domains.

---

### AWS Certificate Manager (ACM)

ACM is used to issue and manage TLS certificates for all application domains.

Certificates are:

- Automatically renewed
- Bound to the ALB
- Enforced for all public traffic

---

## Domain & Subdomain Routing

The application uses **clear subdomain separation** to enforce responsibility boundaries.

| Domain / Subdomain   | Target Service  | Purpose         |
| -------------------- | --------------- | --------------- |
| `app.<domain>`       | Frontend ECS    | React SPA       |
| `api.<domain>`       | Backend ECS     | Django REST API |
| `<domain>` / `www.*` | S3 + CloudFront | Portfolio site  |

### Benefits of This Model

- Clear frontend vs backend separation
- Independent scaling paths
- Reduced blast radius
- Clean mental model for reviewers

---

## Frontend Deployment

### Build Process

1. React app built using Vite
2. Output compiled to static assets
3. Assets copied into Nginx container
4. Nginx serves SPA with routing support

---

### Runtime Behavior

- No runtime secrets
- API base URL injected at build time
- All API calls routed to `api.<domain>`

The frontend is **fully stateless**.

---

## Backend Deployment

### Application Server

The backend runs using:

- Gunicorn
- Django REST Framework

Gunicorn is configured to:

- Handle concurrent requests
- Gracefully restart
- Avoid development-only behavior

---

### Startup Flow

On container start:

1. Django migrations run
2. Bootstrap account safety checks execute
3. Gunicorn starts and binds to the service port

This ensures the system is **always deployable from a clean state**.

---

## Network & Security Boundaries

### VPC Isolation

- ECS tasks run in private subnets
- RDS is restricted to backend security groups
- Only ALB is publicly exposed

---

### Traffic Controls

| Layer      | Protection          |
| ---------- | ------------------- |
| DNS        | Route 53            |
| TLS        | ACM                 |
| HTTP       | ALB                 |
| App Layer  | Django permissions  |
| Data Layer | RDS security groups |

---

## Scaling Characteristics

### Frontend

- Scales horizontally
- Low resource requirements
- Static asset serving

### Backend

- Scales via ECS task count
- Stateless API design
- Database-backed consistency

---

## Failure Modes & Resilience

The system is designed to fail safely:

- ALB health checks remove unhealthy tasks
- ECS restarts failed containers
- Database remains protected from direct exposure
- CI prevents broken builds from being deployed

---

## QA & Operational Alignment

The deployment architecture supports QA by:

- Enforcing identical runtime behavior across environments
- Preventing test-only logic from leaking into production
- Allowing black-box API validation against production-like infra

This architecture is intentionally **boring, predictable, and auditable** — qualities valued in healthcare-adjacent systems.

---

## Summary

The deployment architecture demonstrates:

- Industry-standard SaaS deployment patterns
- Clear separation of concerns
- Strong security posture
- Operational predictability

It is designed to be **defensible in technical interviews**, not merely functional.
