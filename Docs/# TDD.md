# TDD.md

# SyncLancer Technical Design Document

Version: 1.0.0

Status: Draft

---

# 1. Overview

## Product

SyncLancer

## Type

Multi-Tenant Freelancer Project Management SaaS

## Architecture Style

Feature First + Clean Architecture

## Frontend

* Next.js 16
* React 19
* TypeScript
* Tailwind CSS
* shadcn/ui

## Backend

* Next.js Route Handlers
* Server Actions

## Database

* PostgreSQL
* Prisma ORM

## Authentication

* Auth.js

## Storage

* Supabase Storage

## Deployment

* Vercel
* PostgreSQL Cloud

---

# 2. System Architecture

```text
┌──────────────────────┐
│      Browser         │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│      Next.js App     │
├──────────────────────┤
│ App Router           │
│ Server Actions       │
│ Route Handlers       │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│   Application Layer  │
├──────────────────────┤
│ Use Cases            │
│ Services             │
│ Business Rules       │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│    Prisma ORM        │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│    PostgreSQL        │
└──────────────────────┘
```

---

# 3. Folder Structure

```text
src/

├── app/
│
├── features/
│   ├── auth/
│   ├── workspace/
│   ├── crm/
│   ├── clients/
│   ├── proposals/
│   ├── projects/
│   ├── milestones/
│   ├── tasks/
│   ├── time-tracking/
│   ├── invoices/
│   ├── files/
│   ├── analytics/
│   ├── notifications/
│   └── subscription/
│
├── components/
│
├── lib/
│
├── hooks/
│
├── types/
│
├── prisma/
│
└── tests/
```

---

# 4. Clean Architecture

Every feature follows:

```text
feature/

├── components/
├── actions/
├── api/
├── services/
├── repositories/
├── schemas/
├── types/
└── validations/
```

---

# 5. Authentication

## Supported Providers

### Credentials

Email + Password

### OAuth

Google

GitHub

---

# Authentication Flow

```text
Login
↓
Auth.js
↓
Session Created
↓
Workspace Validation
↓
Dashboard
```

---

# 6. Authorization

## Access Control

Authorization source:

```text
workspace_members
```

Never rely solely on:

```text
workspaces.owner_id
```

---

# Authorization Middleware

Every protected request must verify:

```text
User Exists
Workspace Exists
Membership Exists
Role Allowed
```

---

# 7. Multi-Tenant Strategy

## Tenant Key

```text
workspace_id
```

Every query must include:

```sql
WHERE workspace_id = ?
```

---

# Example

Correct:

```sql
SELECT *
FROM projects
WHERE workspace_id = ?
```

Incorrect:

```sql
SELECT *
FROM projects
```

---

# 8. Database Access Layer

Pattern:

```text
Controller
↓
Service
↓
Repository
↓
Prisma
↓
Database
```

---

# Example

```text
Create Project
↓
ProjectService
↓
ProjectRepository
↓
Prisma
```

---

# 9. State Management

## Server State

Use:

```text
TanStack Query
```

Purpose:

* API fetching
* Cache
* Revalidation

---

## Local State

Use:

```text
React State
```

or

```text
Zustand
```

Only when necessary.

---

# 10. Validation

Library:

```text
Zod
```

All requests must be validated.

---

# Example

```text
Request
↓
Zod Validation
↓
Business Logic
↓
Database
```

---

# 11. CRM Module

## Responsibilities

* Lead Creation
* Lead Update
* Lead Conversion

---

# Conversion Flow

```text
Lead
↓
Won
↓
Client
```

---

# Business Rules

Cannot convert:

```text
Lost Lead
```

Can convert:

```text
Won Lead
```

---

# 12. Proposal Module

## Responsibilities

* Proposal Builder
* PDF Generation
* Approval Workflow

---

# Business Rules

Proposal cannot be approved if:

```text
Expired
```

Proposal can create:

```text
Project
```

after approval.

---

# 13. Project Module

## Responsibilities

* Project CRUD
* Status Management
* Progress Calculation

---

# Progress Calculation

Derived from:

```text
Milestones
```

---

# Formula

```text
Completed Milestones
/
Total Milestones
```

---

# 14. Milestone Module

## Responsibilities

* Track delivery stages
* Progress updates

---

# Rules

Project Progress updates automatically whenever milestone changes.

---

# 15. Task Module

## Responsibilities

* Kanban Board
* Drag & Drop
* Priority Management

---

# Status Flow

```text
Backlog
↓
Todo
↓
In Progress
↓
Review
↓
Done
```

---

# 16. Time Tracking Module

## Timer States

```text
Idle
Running
Paused
Stopped
```

---

# Rules

Only one active timer per workspace.

---

# Time Entry Creation

Generated after:

```text
Stop Timer
```

---

# 17. File Module

## Storage Provider

Supabase Storage

---

# Upload Limits

### Free

```text
1 GB Total Storage
```

### Pro

```text
Unlimited
```

---

# Validation

Check:

* File Type
* File Size
* Workspace Usage

before upload.

---

# 18. Invoice Module

## Responsibilities

* Invoice Builder
* PDF Export
* Recurring Invoices

---

# Status Flow

```text
Draft
↓
Sent
↓
Paid
```

Alternative:

```text
Draft
↓
Sent
↓
Overdue
```

---

# 19. Recurring Invoice Engine

Scheduled job:

```text
Daily
```

Checks:

```text
next_run_at
```

---

# Workflow

```text
Recurring Invoice
↓
Generate Invoice
↓
Update next_run_at
```

---

# 20. Analytics Module

## Data Sources

Projects

Invoices

Clients

Time Entries

---

# Dashboard Metrics

Revenue

```sql
SUM(total_amount)
```

---

Active Projects

```sql
COUNT(status='ACTIVE')
```

---

Pending Invoices

```sql
COUNT(status='SENT')
```

---

# 21. Notification Module

## Types

In-App

Email

---

# Event Triggers

Proposal Sent

Invoice Sent

Invoice Overdue

Client Invitation

Project Completed

---

# 22. Email Service

Provider:

```text
Resend
```

Templates:

* Invitation
* Proposal
* Invoice
* Reminder

---

# 23. PDF Generation

Documents:

* Proposal PDF
* Invoice PDF

Library:

```text
React PDF
```

---

# 24. Search

Global Search:

* Leads
* Clients
* Projects
* Invoices

Implementation:

```text
PostgreSQL Full Text Search
```

---

# 25. PWA

Requirements:

* Installable
* Offline Fallback
* App Manifest
* Service Worker

---

# 26. Logging

Application Logs

```text
Info
Warning
Error
```

---

# Error Tracking

Provider:

```text
Sentry
```

---

# 27. Security

## Passwords

Hash using:

```text
Argon2
```

---

## Session

Secure HTTP Only Cookies

---

## Validation

All inputs validated with Zod.

---

## Rate Limiting

Applied to:

* Login
* Register
* Forgot Password

---

# 28. Performance Targets

Dashboard Load

```text
< 3 seconds
```

API Response

```text
< 500 ms
```

Database Query

```text
< 100 ms
```

---

# 29. Testing Strategy

## Unit Test

Tools:

```text
Vitest
```

Coverage:

* Services
* Utilities
* Business Rules

---

## Integration Test

Coverage:

* API
* Database

---

## E2E Test

Tool:

```text
Playwright
```

Coverage:

* Authentication
* Proposal Flow
* Project Flow
* Invoice Flow

---

# 30. Deployment Pipeline

```text
Git Push
↓
GitHub
↓
CI
↓
Tests
↓
Build
↓
Deploy Vercel
```

---

# 31. Future Scalability

Prepared For:

* Team Collaboration
* Staff Roles
* Activity Logs
* Messaging
* AI Features
* Third Party Integrations

No major database redesign should be required for future expansion.
