# DATABASE_SCHEMA.md

# SyncLancer Database Schema

Version: 1.1.0

Database: PostgreSQL

ORM: Prisma

Architecture: Multi-Tenant SaaS

---

# Database Principles

## Multi Tenant

All business data must belong to a workspace.

```text
Workspace
├── Leads
├── Clients
├── Projects
├── Proposals
├── Invoices
├── Files
└── Analytics
```

Data from one workspace must never be accessible from another workspace.

---

# Workspace Authorization Rules

## IMPORTANT

Authorization MUST use:

```text
workspace_members
```

Never rely solely on:

```text
workspaces.owner_id
```

Purpose:

* owner_id = primary owner
* workspace_members = access control source of truth

Every protected query must validate:

```sql
workspace_id
user_id
role
```

through workspace_members.

---

# Users

## users

| Field          | Type                |
| -------------- | ------------------- |
| id             | UUID PK             |
| email          | VARCHAR(255) UNIQUE |
| password_hash  | TEXT                |
| full_name      | VARCHAR(255)        |
| avatar_url     | TEXT NULL           |
| email_verified | BOOLEAN             |
| created_at     | TIMESTAMP           |
| updated_at     | TIMESTAMP           |

---

# Workspaces

## workspaces

| Field      | Type                |
| ---------- | ------------------- |
| id         | UUID PK             |
| owner_id   | UUID FK users.id    |
| name       | VARCHAR(255)        |
| slug       | VARCHAR(100) UNIQUE |
| logo_url   | TEXT NULL           |
| plan       | ENUM                |
| created_at | TIMESTAMP           |
| updated_at | TIMESTAMP           |

### Plan Enum

```text
FREE
PRO
```

---

# Workspace Members

## workspace_members

| Field        | Type      |
| ------------ | --------- |
| id           | UUID PK   |
| workspace_id | UUID FK   |
| user_id      | UUID FK   |
| role         | ENUM      |
| created_at   | TIMESTAMP |

### Role Enum

```text
OWNER
CLIENT
```

### Constraints

```text
UNIQUE(workspace_id, user_id)
```

---

# Leads

## leads

| Field        | Type           |
| ------------ | -------------- |
| id           | UUID PK        |
| workspace_id | UUID FK        |
| name         | VARCHAR(255)   |
| email        | VARCHAR(255)   |
| company      | VARCHAR(255)   |
| phone        | VARCHAR(50)    |
| notes        | TEXT           |
| status       | ENUM           |
| created_at   | TIMESTAMP      |
| updated_at   | TIMESTAMP      |
| deleted_at   | TIMESTAMP NULL |

### Lead Status

```text
NEW
CONTACTED
PROPOSAL_SENT
NEGOTIATION
WON
LOST
```

---

# Clients

Represents a company or customer entity.

## clients

| Field         | Type           |
| ------------- | -------------- |
| id            | UUID PK        |
| workspace_id  | UUID FK        |
| company_name  | VARCHAR(255)   |
| primary_email | VARCHAR(255)   |
| phone         | VARCHAR(50)    |
| notes         | TEXT           |
| archived      | BOOLEAN        |
| created_at    | TIMESTAMP      |
| updated_at    | TIMESTAMP      |
| deleted_at    | TIMESTAMP NULL |

---

# Client Users

Multiple portal accounts per client.

Example:

```text
PT ABC

├── CEO
├── Project Manager
└── Designer
```

## client_users

| Field      | Type         |
| ---------- | ------------ |
| id         | UUID PK      |
| client_id  | UUID FK      |
| user_id    | UUID FK      |
| title      | VARCHAR(255) |
| created_at | TIMESTAMP    |

---

# Proposals

## proposals

| Field           | Type           |
| --------------- | -------------- |
| id              | UUID PK        |
| workspace_id    | UUID FK        |
| client_id       | UUID FK        |
| proposal_number | VARCHAR(100)   |
| title           | VARCHAR(255)   |
| description     | TEXT           |
| currency        | VARCHAR(10)    |
| subtotal        | DECIMAL(18,2)  |
| tax_amount      | DECIMAL(18,2)  |
| total_amount    | DECIMAL(18,2)  |
| expires_at      | DATE           |
| status          | ENUM           |
| pdf_url         | TEXT           |
| created_at      | TIMESTAMP      |
| updated_at      | TIMESTAMP      |
| deleted_at      | TIMESTAMP NULL |

### Status

```text
DRAFT
SENT
APPROVED
REJECTED
EXPIRED
```

---

# Proposal Items

## proposal_items

| Field       | Type          |
| ----------- | ------------- |
| id          | UUID PK       |
| proposal_id | UUID FK       |
| name        | VARCHAR(255)  |
| description | TEXT          |
| quantity    | INTEGER       |
| unit_price  | DECIMAL(18,2) |
| total_price | DECIMAL(18,2) |

---

# Project Templates

## project_templates

| Field        | Type         |
| ------------ | ------------ |
| id           | UUID PK      |
| workspace_id | UUID NULL    |
| name         | VARCHAR(255) |
| description  | TEXT         |
| is_system    | BOOLEAN      |
| created_at   | TIMESTAMP    |

---

# Template Milestones

## template_milestones

| Field       | Type         |
| ----------- | ------------ |
| id          | UUID PK      |
| template_id | UUID FK      |
| title       | VARCHAR(255) |
| sort_order  | INTEGER      |

---

# Template Tasks

## template_tasks

| Field                 | Type         |
| --------------------- | ------------ |
| id                    | UUID PK      |
| template_milestone_id | UUID FK      |
| title                 | VARCHAR(255) |
| sort_order            | INTEGER      |

---

# Projects

## projects

| Field        | Type           |
| ------------ | -------------- |
| id           | UUID PK        |
| workspace_id | UUID FK        |
| client_id    | UUID FK        |
| proposal_id  | UUID NULL      |
| name         | VARCHAR(255)   |
| description  | TEXT           |
| budget       | DECIMAL(18,2)  |
| currency     | VARCHAR(10)    |
| start_date   | DATE           |
| deadline     | DATE           |
| progress     | INTEGER        |
| status       | ENUM           |
| created_at   | TIMESTAMP      |
| updated_at   | TIMESTAMP      |
| deleted_at   | TIMESTAMP NULL |

### Status

```text
DRAFT
ACTIVE
ON_HOLD
REVIEW
COMPLETED
CANCELLED
```

---

# Milestones

## milestones

| Field       | Type         |
| ----------- | ------------ |
| id          | UUID PK      |
| project_id  | UUID FK      |
| title       | VARCHAR(255) |
| description | TEXT         |
| due_date    | DATE         |
| progress    | INTEGER      |
| status      | ENUM         |
| sort_order  | INTEGER      |

### Status

```text
NOT_STARTED
IN_PROGRESS
COMPLETED
```

---

# Tasks

## tasks

| Field        | Type         |
| ------------ | ------------ |
| id           | UUID PK      |
| project_id   | UUID FK      |
| milestone_id | UUID NULL    |
| title        | VARCHAR(255) |
| description  | TEXT         |
| status       | ENUM         |
| priority     | ENUM         |
| due_date     | DATE         |
| created_at   | TIMESTAMP    |
| updated_at   | TIMESTAMP    |

### Status

```text
BACKLOG
TODO
IN_PROGRESS
REVIEW
DONE
```

### Priority

```text
LOW
MEDIUM
HIGH
URGENT
```

---

# Time Entries

## time_entries

| Field            | Type      |
| ---------------- | --------- |
| id               | UUID PK   |
| project_id       | UUID FK   |
| task_id          | UUID NULL |
| start_time       | TIMESTAMP |
| end_time         | TIMESTAMP |
| duration_minutes | INTEGER   |
| billable         | BOOLEAN   |
| notes            | TEXT      |
| created_at       | TIMESTAMP |

---

# Invoices

## invoices

| Field          | Type           |
| -------------- | -------------- |
| id             | UUID PK        |
| workspace_id   | UUID FK        |
| client_id      | UUID FK        |
| project_id     | UUID NULL      |
| invoice_number | VARCHAR(100)   |
| currency       | VARCHAR(10)    |
| subtotal       | DECIMAL(18,2)  |
| tax_amount     | DECIMAL(18,2)  |
| total_amount   | DECIMAL(18,2)  |
| due_date       | DATE           |
| status         | ENUM           |
| pdf_url        | TEXT           |
| created_at     | TIMESTAMP      |
| updated_at     | TIMESTAMP      |
| deleted_at     | TIMESTAMP NULL |

### Status

```text
DRAFT
SENT
PAID
OVERDUE
CANCELLED
```

---

# Invoice Items

## invoice_items

| Field       | Type          |
| ----------- | ------------- |
| id          | UUID PK       |
| invoice_id  | UUID FK       |
| name        | VARCHAR(255)  |
| description | TEXT          |
| quantity    | INTEGER       |
| unit_price  | DECIMAL(18,2) |
| total_price | DECIMAL(18,2) |

---

# Recurring Invoices

## recurring_invoices

| Field        | Type      |
| ------------ | --------- |
| id           | UUID PK   |
| workspace_id | UUID FK   |
| client_id    | UUID FK   |
| frequency    | ENUM      |
| next_run_at  | DATE      |
| active       | BOOLEAN   |
| created_at   | TIMESTAMP |

### Frequency

```text
WEEKLY
MONTHLY
QUARTERLY
YEARLY
```

---

# Files

## files

| Field        | Type           |
| ------------ | -------------- |
| id           | UUID PK        |
| workspace_id | UUID FK        |
| project_id   | UUID NULL      |
| uploaded_by  | UUID FK        |
| file_name    | VARCHAR(255)   |
| file_type    | VARCHAR(50)    |
| file_size    | BIGINT         |
| storage_path | TEXT           |
| created_at   | TIMESTAMP      |
| deleted_at   | TIMESTAMP NULL |

---

# Notifications

## notifications

| Field      | Type         |
| ---------- | ------------ |
| id         | UUID PK      |
| user_id    | UUID FK      |
| title      | VARCHAR(255) |
| message    | TEXT         |
| is_read    | BOOLEAN      |
| created_at | TIMESTAMP    |

---

# Subscription Usage

## subscription_usage

| Field                 | Type      |
| --------------------- | --------- |
| id                    | UUID PK   |
| workspace_id          | UUID FK   |
| active_projects_count | INTEGER   |
| clients_count         | INTEGER   |
| storage_used_bytes    | BIGINT    |
| updated_at            | TIMESTAMP |

---

# Recommended Indexes

```sql
CREATE INDEX idx_users_email ON users(email);

CREATE INDEX idx_workspace_owner
ON workspaces(owner_id);

CREATE INDEX idx_workspace_members_user
ON workspace_members(user_id);

CREATE INDEX idx_leads_workspace_status
ON leads(workspace_id, status);

CREATE INDEX idx_clients_workspace
ON clients(workspace_id);

CREATE INDEX idx_projects_workspace_status
ON projects(workspace_id, status);

CREATE INDEX idx_tasks_project_status
ON tasks(project_id, status);

CREATE INDEX idx_invoices_workspace_status
ON invoices(workspace_id, status);

CREATE INDEX idx_notifications_user
ON notifications(user_id);
```

---

# Future Tables (V2)

Not included in MVP:

* activity_logs
* comments
* client_messages
* calendar_events
* ai_generations
* integrations
* webhooks
