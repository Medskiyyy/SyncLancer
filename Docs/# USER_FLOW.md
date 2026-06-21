# USER_FLOW.md

# SyncLancer User Flow

Version: 1.0.0

Status: Draft

---

# Overview

This document defines the primary user journeys within SyncLancer.

Users:

* Owner
* Client

---

# User Journey Map

```text
Register
↓
Create Workspace
↓
Create Lead
↓
Send Proposal
↓
Proposal Approved
↓
Create Project
↓
Manage Milestones
↓
Track Time
↓
Generate Invoice
↓
Receive Payment
↓
Project Completed
```

---

# 1. Authentication Flow

## Register

```text
Landing Page
↓
Sign Up
↓
Email / Google / GitHub
↓
Account Created
↓
Create Workspace
```

### Success Criteria

* User account created
* User authenticated
* Redirect to workspace creation

---

## Login

```text
Login
↓
Authentication
↓
Workspace Selection
↓
Dashboard
```

### Success Criteria

* Valid session created
* Workspace loaded

---

# 2. Workspace Creation Flow

## Create First Workspace

```text
Dashboard
↓
Create Workspace
↓
Workspace Name
↓
Workspace Created
↓
Dashboard
```

### Data Created

* Workspace
* Owner Membership
* Usage Record

---

## Switch Workspace

```text
Workspace Selector
↓
Select Workspace
↓
Workspace Context Updated
↓
Dashboard Reloaded
```

---

# 3. Lead Management Flow

## Create Lead

```text
CRM
↓
Add Lead
↓
Fill Information
↓
Save
↓
Lead Created
```

### Input

* Name
* Email
* Company
* Phone
* Notes

---

## Lead Pipeline Flow

```text
NEW
↓
CONTACTED
↓
PROPOSAL_SENT
↓
NEGOTIATION
↓
WON
```

Alternative:

```text
NEW
↓
CONTACTED
↓
LOST
```

---

## Convert Lead to Client

```text
Lead
↓
Mark as WON
↓
Create Client
↓
Lead Archived
```

---

# 4. Client Management Flow

## Create Client

```text
Clients
↓
Create Client
↓
Enter Information
↓
Save
↓
Client Created
```

---

## Invite Client

```text
Client Profile
↓
Send Invitation
↓
Email Sent
↓
Client Accepts
↓
Client Account Created
```

---

# 5. Proposal Flow

## Create Proposal

```text
Client
↓
New Proposal
↓
Add Services
↓
Add Tax
↓
Review
↓
Save Draft
```

---

## Send Proposal

```text
Draft Proposal
↓
Send
↓
Email Delivered
↓
Status = SENT
```

---

## Client Review Proposal

```text
Client Portal
↓
View Proposal
↓
Approve / Reject
```

---

## Proposal Approved

```text
Proposal Approved
↓
Create Project
↓
Copy Proposal Data
↓
Project Created
```

### Auto Imported

* Client
* Budget
* Service Items

---

# 6. Project Creation Flow

## Create Project

```text
Projects
↓
Create Project
↓
Select Template
↓
Fill Information
↓
Project Created
```

---

## Project Template Flow

```text
Select Template
↓
Auto Create Milestones
↓
Auto Create Tasks
↓
Project Ready
```

---

# 7. Milestone Flow

## Create Milestone

```text
Project
↓
Milestones
↓
Create Milestone
↓
Save
```

---

## Update Milestone Progress

```text
Milestone
↓
Update Progress
↓
Save
↓
Project Progress Recalculated
```

---

## Complete Milestone

```text
In Progress
↓
Completed
↓
Project Progress Updated
```

---

# 8. Task Management Flow

## Create Task

```text
Project
↓
Board
↓
Create Task
↓
Save
```

---

## Move Task

```text
Todo
↓
Drag
↓
In Progress
↓
Save
```

---

## Complete Task

```text
Review
↓
Done
↓
Progress Updated
```

---

# 9. Time Tracking Flow

## Live Timer

```text
Task
↓
Start Timer
↓
Working
↓
Pause / Resume
↓
Stop
↓
Time Entry Created
```

---

## Manual Time Entry

```text
Project
↓
Add Time Entry
↓
Duration
↓
Save
```

---

# 10. File Management Flow

## Owner Upload File

```text
Project
↓
Files
↓
Upload
↓
File Stored
```

---

## Client Upload File

```text
Client Portal
↓
Files
↓
Upload
↓
File Stored
```

---

## Download File

```text
File List
↓
Download
```

---

# 11. Invoice Flow

## Create Invoice

```text
Project
↓
Create Invoice
↓
Add Items
↓
Generate
```

---

## Send Invoice

```text
Invoice
↓
Send
↓
Email Delivered
↓
Status = SENT
```

---

## Mark Invoice Paid

```text
Invoice
↓
Mark Paid
↓
Status Updated
```

---

# 12. Recurring Invoice Flow

## Create Recurring Invoice

```text
Invoice
↓
Enable Recurring
↓
Select Frequency
↓
Save
```

---

## Automatic Generation

```text
Scheduled Job
↓
Check Due Date
↓
Generate Invoice
↓
Send Notification
```

---

# 13. Client Portal Flow

## Client Login

```text
Email Invitation
↓
Accept
↓
Create Password
↓
Login
```

---

## Client Dashboard

Client can access:

```text
Projects
Milestones
Files
Invoices
```

---

## Client Download Invoice

```text
Invoices
↓
Select Invoice
↓
Download PDF
```

---

# 14. Analytics Flow

## Dashboard Load

```text
Open Dashboard
↓
Fetch Metrics
↓
Render Widgets
```

### Revenue Widget

Shows:

* Total Revenue
* Monthly Revenue

### Project Widget

Shows:

* Active Projects
* Completed Projects

### Client Widget

Shows:

* Total Clients

### Invoice Widget

Shows:

* Pending Invoices
* Overdue Invoices

### Workload Widget

Shows:

* Active Tasks
* Hours This Week
* Upcoming Milestones

---

# 15. Subscription Flow

## Free Plan

```text
Create Project
↓
Check Limits
↓
Allowed / Blocked
```

### Restrictions

* 1 Workspace
* 3 Active Projects
* 5 Clients
* 1 GB Storage

---

## Upgrade Plan

```text
Settings
↓
Subscription
↓
Upgrade
↓
Pro Activated
```

---

# 16. Notification Flow

## In-App Notification

```text
Event Triggered
↓
Notification Created
↓
Displayed
```

Examples:

* Milestone Due Soon
* Project Completed
* Invoice Overdue

---

## Email Notification

```text
Event Triggered
↓
Email Queue
↓
Send Email
```

Examples:

* Proposal Sent
* Invoice Sent
* Client Invitation

---

# Error Flows

## Workspace Limit Reached

```text
Create Workspace
↓
Plan Validation
↓
Limit Reached
↓
Upgrade Prompt
```

---

## Storage Limit Reached

```text
Upload File
↓
Storage Validation
↓
Limit Reached
↓
Upload Rejected
```

---

## Expired Proposal

```text
Client Opens Proposal
↓
Expiration Check
↓
Expired
↓
Cannot Approve
```

---

# Success Metrics

Track the following conversions:

```text
Lead
↓
Proposal
↓
Won
↓
Project
↓
Invoice
↓
Paid
```

Key KPIs:

* Lead Conversion Rate
* Proposal Approval Rate
* Project Completion Rate
* Invoice Payment Rate
* Monthly Revenue
