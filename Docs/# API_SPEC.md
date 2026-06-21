# API_SPEC.md

# SyncLancer API Specification

Version: 1.0.0

Architecture: REST API

Framework: Next.js Route Handlers

Base URL:

```text
/api/v1
```

Authentication:

* Session Authentication
* OAuth Authentication
* Protected Routes

Response Format:

```json
{
  "success": true,
  "data": {},
  "message": "Success"
}
```

Error Format:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input"
  }
}
```

---

# Authentication

## Register

POST

```text
/api/v1/auth/register
```

Request

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

Response

```json
{
  "success": true,
  "data": {
    "userId": "uuid"
  }
}
```

---

## Login

POST

```text
/api/v1/auth/login
```

---

## Logout

POST

```text
/api/v1/auth/logout
```

---

## Forgot Password

POST

```text
/api/v1/auth/forgot-password
```

---

## Reset Password

POST

```text
/api/v1/auth/reset-password
```

---

# Workspace

## Get Workspaces

GET

```text
/api/v1/workspaces
```

---

## Create Workspace

POST

```json
{
  "name": "My Freelance Business"
}
```

---

## Update Workspace

PATCH

```text
/api/v1/workspaces/:workspaceId
```

---

## Delete Workspace

DELETE

```text
/api/v1/workspaces/:workspaceId
```

---

# CRM Leads

## Get Leads

GET

```text
/api/v1/leads
```

Query

```text
?page=1
&limit=20
&status=NEW
```

---

## Create Lead

POST

```json
{
  "name": "Client Name",
  "email": "client@email.com",
  "company": "Company",
  "phone": "+62xxxxxxxx",
  "notes": "Potential lead"
}
```

---

## Update Lead

PATCH

```text
/api/v1/leads/:leadId
```

---

## Delete Lead

DELETE

```text
/api/v1/leads/:leadId
```

---

## Update Lead Status

PATCH

```text
/api/v1/leads/:leadId/status
```

Request

```json
{
  "status": "NEGOTIATION"
}
```

---

## Convert Lead To Client

POST

```text
/api/v1/leads/:leadId/convert
```

---

# Clients

## Get Clients

GET

```text
/api/v1/clients
```

---

## Create Client

POST

```json
{
  "name": "Client",
  "email": "client@email.com",
  "company": "Company"
}
```

---

## Get Client Detail

GET

```text
/api/v1/clients/:clientId
```

---

## Update Client

PATCH

```text
/api/v1/clients/:clientId
```

---

## Archive Client

PATCH

```text
/api/v1/clients/:clientId/archive
```

---

## Invite Client

POST

```text
/api/v1/clients/:clientId/invite
```

---

# Proposals

## Get Proposals

GET

```text
/api/v1/proposals
```

---

## Create Proposal

POST

```json
{
  "clientId": "uuid",
  "title": "Website Development",
  "currency": "USD",
  "tax": 10
}
```

---

## Get Proposal Detail

GET

```text
/api/v1/proposals/:proposalId
```

---

## Update Proposal

PATCH

```text
/api/v1/proposals/:proposalId
```

---

## Send Proposal

POST

```text
/api/v1/proposals/:proposalId/send
```

---

## Approve Proposal

POST

```text
/api/v1/proposals/:proposalId/approve
```

---

## Reject Proposal

POST

```text
/api/v1/proposals/:proposalId/reject
```

---

## Export Proposal PDF

GET

```text
/api/v1/proposals/:proposalId/pdf
```

---

# Projects

## Get Projects

GET

```text
/api/v1/projects
```

---

## Create Project

POST

```json
{
  "clientId": "uuid",
  "name": "Company Website",
  "budget": 5000,
  "currency": "USD"
}
```

---

## Create Project From Proposal

POST

```text
/api/v1/proposals/:proposalId/project
```

---

## Get Project Detail

GET

```text
/api/v1/projects/:projectId
```

---

## Update Project

PATCH

```text
/api/v1/projects/:projectId
```

---

## Delete Project

DELETE

```text
/api/v1/projects/:projectId
```

---

# Project Templates

## Get Templates

GET

```text
/api/v1/project-templates
```

---

## Create Template

POST

```text
/api/v1/project-templates
```

---

# Milestones

## Get Milestones

GET

```text
/api/v1/projects/:projectId/milestones
```

---

## Create Milestone

POST

```text
/api/v1/projects/:projectId/milestones
```

---

## Update Milestone

PATCH

```text
/api/v1/milestones/:milestoneId
```

---

## Update Progress

PATCH

```text
/api/v1/milestones/:milestoneId/progress
```

---

# Tasks

## Get Tasks

GET

```text
/api/v1/projects/:projectId/tasks
```

---

## Create Task

POST

```text
/api/v1/projects/:projectId/tasks
```

---

## Update Task

PATCH

```text
/api/v1/tasks/:taskId
```

---

## Update Task Status

PATCH

```text
/api/v1/tasks/:taskId/status
```

Request

```json
{
  "status": "IN_PROGRESS"
}
```

---

## Delete Task

DELETE

```text
/api/v1/tasks/:taskId
```

---

# Time Tracking

## Start Timer

POST

```text
/api/v1/time-tracking/start
```

Request

```json
{
  "projectId": "uuid",
  "taskId": "uuid"
}
```

---

## Pause Timer

POST

```text
/api/v1/time-tracking/pause
```

---

## Resume Timer

POST

```text
/api/v1/time-tracking/resume
```

---

## Stop Timer

POST

```text
/api/v1/time-tracking/stop
```

---

## Manual Entry

POST

```text
/api/v1/time-tracking/manual
```

---

## Get Entries

GET

```text
/api/v1/time-tracking
```

---

# Files

## Upload File

POST

```text
/api/v1/files/upload
```

Multipart Form Data

---

## Get Files

GET

```text
/api/v1/files
```

---

## Download File

GET

```text
/api/v1/files/:fileId/download
```

---

## Delete File

DELETE

```text
/api/v1/files/:fileId
```

---

# Invoices

## Get Invoices

GET

```text
/api/v1/invoices
```

---

## Create Invoice

POST

```text
/api/v1/invoices
```

---

## Get Invoice Detail

GET

```text
/api/v1/invoices/:invoiceId
```

---

## Update Invoice

PATCH

```text
/api/v1/invoices/:invoiceId
```

---

## Send Invoice

POST

```text
/api/v1/invoices/:invoiceId/send
```

---

## Mark Paid

POST

```text
/api/v1/invoices/:invoiceId/mark-paid
```

---

## Export PDF

GET

```text
/api/v1/invoices/:invoiceId/pdf
```

---

# Recurring Invoices

## Create Recurring Invoice

POST

```text
/api/v1/recurring-invoices
```

---

## Update Recurring Invoice

PATCH

```text
/api/v1/recurring-invoices/:id
```

---

## Disable Recurring Invoice

PATCH

```text
/api/v1/recurring-invoices/:id/disable
```

---

# Analytics

## Dashboard Metrics

GET

```text
/api/v1/analytics/dashboard
```

Response

```json
{
  "revenue": 10000,
  "clients": 15,
  "activeProjects": 6,
  "pendingInvoices": 2
}
```

---

## Revenue Analytics

GET

```text
/api/v1/analytics/revenue
```

---

## Project Analytics

GET

```text
/api/v1/analytics/projects
```

---

## Client Analytics

GET

```text
/api/v1/analytics/clients
```

---

# Notifications

## Get Notifications

GET

```text
/api/v1/notifications
```

---

## Mark Read

PATCH

```text
/api/v1/notifications/:notificationId/read
```

---

## Mark All Read

PATCH

```text
/api/v1/notifications/read-all
```

---

# Subscription

## Get Current Plan

GET

```text
/api/v1/subscription
```

---

## Get Usage

GET

```text
/api/v1/subscription/usage
```

---

## Upgrade Plan

POST

```text
/api/v1/subscription/upgrade
```

---

# Client Portal

## Client Dashboard

GET

```text
/api/v1/client/dashboard
```

---

## Client Projects

GET

```text
/api/v1/client/projects
```

---

## Client Files

GET

```text
/api/v1/client/files
```

---

## Client Upload File

POST

```text
/api/v1/client/files/upload
```

---

## Client Invoices

GET

```text
/api/v1/client/invoices
```

---

# Health Check

## System Health

GET

```text
/api/v1/health
```

Response

```json
{
  "status": "healthy"
}
```
