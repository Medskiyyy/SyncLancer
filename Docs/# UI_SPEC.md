# UI_SPEC.md

# SyncLancer UI/UX Specification

Version: 1.0.0

Status: Draft

Design Style: Modern SaaS Dashboard

Platform: Web + PWA

Theme Support: Light / Dark / System

Language: English

---

# Design Principles

## Goals

The interface must feel:

* Professional
* Modern
* Fast
* Clean
* Premium

## Inspiration

* Linear
* Notion
* Stripe Dashboard
* Vercel Dashboard
* ClickUp
* Framer

---

# Design System

## Border Radius

### Small

```text
8px
```

### Medium

```text
12px
```

### Large

```text
16px
```

### Cards

```text
20px
```

---

## Spacing Scale

```text
4
8
12
16
24
32
48
64
```

---

## Shadows

Minimal.

Use elevation only when necessary.

---

## Typography

### Font

Primary:

```text
Inter
```

Fallback:

```text
system-ui
```

---

## Font Sizes

### Heading 1

```text
36px
```

### Heading 2

```text
30px
```

### Heading 3

```text
24px
```

### Heading 4

```text
20px
```

### Body

```text
14px
16px
```

---

# Layout Structure

## Desktop

```text
┌─────────────┬─────────────────────┐
│ Sidebar     │ Topbar              │
│             ├─────────────────────┤
│ Navigation  │ Main Content        │
│             │                     │
└─────────────┴─────────────────────┘
```

---

## Mobile

```text
Topbar
↓
Content
↓
Bottom Navigation
```

---

# Sidebar Navigation

## Owner Navigation

```text
Dashboard
CRM
Clients
Proposals
Projects
Invoices
Files
Analytics
Settings
```

---

## Client Navigation

```text
Dashboard
Projects
Files
Invoices
```

---

# Topbar

## Left Section

* Page Title
* Breadcrumb

---

## Right Section

* Search
* Notification Bell
* Workspace Switcher
* User Menu

---

# Dashboard

## Purpose

Provide business overview in one screen.

---

## Desktop Layout

```text
Revenue
Projects
Clients
Invoices
```

KPI cards on top.

---

### Section 1

KPI Cards

```text
┌──────────┐
│ Revenue  │
└──────────┘

┌──────────┐
│ Projects │
└──────────┘

┌──────────┐
│ Clients  │
└──────────┘

┌──────────┐
│ Invoices │
└──────────┘
```

---

### Section 2

Revenue Chart

```text
Revenue Trend
```

Line chart.

---

### Section 3

Workload Widget

Displays:

* Active Tasks
* Hours This Week
* Upcoming Milestones

---

### Section 4

Recent Activity

Displays:

* Proposal Sent
* Project Created
* Invoice Paid

---

# CRM Page

## Layout

```text
New
Contacted
Proposal Sent
Negotiation
Won
Lost
```

Kanban style pipeline.

---

## Lead Card

Display:

* Name
* Company
* Email
* Status

Actions:

* Edit
* Convert
* Delete

---

# Clients Page

## Table Columns

* Name
* Company
* Email
* Projects
* Status

Actions:

* View
* Edit
* Archive

---

## Client Profile

Sections:

### Overview

* Contact Information
* Active Projects

### Files

### Invoices

### Proposals

---

# Proposal Module

## Proposal List

Columns:

* Proposal Number
* Client
* Amount
* Status
* Expiry Date

---

## Proposal Builder

Sections:

### Basic Information

* Title
* Client
* Currency

---

### Services

Dynamic rows.

```text
Service
Quantity
Price
```

---

### Summary

```text
Subtotal
Tax
Total
```

---

### Actions

* Save Draft
* Preview PDF
* Send

---

# Projects Page

## Project List

Display:

* Name
* Client
* Budget
* Progress
* Deadline
* Status

---

## Project Detail

Tabs:

```text
Overview
Milestones
Tasks
Files
Time Tracking
Invoices
```

---

# Project Overview

Cards:

* Budget
* Progress
* Hours Logged
* Deadline

---

# Milestone Page

## Timeline Layout

```text
Milestone 1
↓
Milestone 2
↓
Milestone 3
```

Each milestone displays:

* Progress
* Due Date
* Status

---

# Task Board

## Kanban

Columns:

```text
Backlog
Todo
In Progress
Review
Done
```

---

## Task Card

Displays:

* Title
* Priority
* Due Date

Priority Colors:

* Low
* Medium
* High
* Urgent

---

# Time Tracking

## Dashboard

Displays:

* Today's Hours
* Weekly Hours
* Monthly Hours

---

## Timer Card

Buttons:

```text
Start
Pause
Resume
Stop
```

Large centered timer.

---

## Time Entries Table

Columns:

* Project
* Task
* Duration
* Date

---

# Files Module

## Grid View

Display:

* File Icon
* File Name
* Size
* Upload Date

---

## Upload Area

Drag & Drop Zone.

Supported:

* PDF
* DOCX
* XLSX
* PNG
* JPG
* ZIP

---

# Invoice Module

## Invoice List

Columns:

* Invoice Number
* Client
* Amount
* Due Date
* Status

---

## Status Badges

```text
Draft
Sent
Paid
Overdue
Cancelled
```

---

## Invoice Builder

Sections:

### Client

### Items

### Tax

### Summary

### Actions

* Save
* Export PDF
* Send

---

# Analytics Page

## Revenue Analytics

Charts:

* Monthly Revenue
* Revenue Growth

---

## Client Analytics

Charts:

* New Clients
* Conversion Rate

---

## Project Analytics

Charts:

* Active Projects
* Completion Rate

---

# Notifications

## Notification Panel

Displays:

* Icon
* Title
* Timestamp

Actions:

* Mark Read
* Mark All Read

---

# Settings

Tabs:

```text
General
Workspace
Billing
Appearance
Integrations
```

---

# Appearance Settings

Theme:

* Light
* Dark
* System

---

# Billing Page

## Free Plan

Show:

* Current Usage
* Limits

---

## Pro Plan

Show:

* Features
* Upgrade CTA

---

# Client Portal

## Dashboard

Display:

* Active Projects
* Recent Files
* Pending Invoices

---

## Project View

Client can see:

* Project Progress
* Milestones
* Tasks

Read-only.

---

## File Center

Client can:

* Upload Files
* Download Files

---

## Invoice Center

Client can:

* View Invoice
* Download PDF

---

# Empty States

Every module must provide:

* Empty Illustration
* Empty Title
* Empty Description
* Primary CTA

Example:

```text
No Projects Yet

Create your first project
to start managing work.
```

---

# Loading States

Use Skeleton UI.

Never use blank screens.

---

# Error States

Provide:

* Error Title
* Error Description
* Retry Action

---

# Responsive Requirements

## Mobile

Support:

* 320px+
* 375px+
* 768px+

---

## Tablet

Support:

* 768px+
* 1024px+

---

## Desktop

Support:

* 1280px+
* 1440px+
* 1920px+

---

# Accessibility

Minimum Requirements:

* Keyboard Navigation
* Screen Reader Labels
* Visible Focus States
* WCAG AA Contrast

---

# UX Success Criteria

Users should be able to:

* Create a lead in under 30 seconds
* Create a proposal in under 3 minutes
* Create a project in under 2 minutes
* Generate an invoice in under 1 minute
* Find project status in under 5 seconds
