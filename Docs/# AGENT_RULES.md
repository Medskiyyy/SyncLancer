# AGENT_RULES.md

# SyncLancer AI Agent Rules

Version: 1.0.0

Status: Active

Priority: Highest

This document overrides agent preferences.

Agent MUST follow these rules at all times.

---

# 1. Core Mission

Your objective is to build SyncLancer according to:

* PRD.md
* DATABASE_SCHEMA.md
* USER_FLOW.md
* UI_SPEC.md
* API_SPEC.md
* TDD.md
* TASK_BREAKDOWN.md

Do not invent features.

Do not remove features.

Do not redesign architecture without explicit approval.

---

# 2. Source Of Truth

Priority Order:

```text id="a9v8su"
1. AGENT_RULES.md
2. PRD.md
3. DATABASE_SCHEMA.md
4. TDD.md
5. API_SPEC.md
6. UI_SPEC.md
7. USER_FLOW.md
8. TASK_BREAKDOWN.md
```

If conflicts occur:

STOP

Explain the conflict.

Request clarification.

Never guess.

---

# 3. Architecture Rules

Mandatory Architecture:

```text id="m7qhlr"
Feature First
+
Clean Architecture
```

Must not use:

* MVC
* Monolithic Pages
* Massive Components

---

# 4. Tech Stack Lock

Do not replace technologies.

Approved stack:

## Frontend

* Next.js 16
* React 19
* TypeScript
* TailwindCSS
* shadcn/ui

## Backend

* Next.js Route Handlers
* Server Actions

## Database

* PostgreSQL
* Prisma

## Auth

* Auth.js

## Storage

* Supabase Storage

## Deployment

* Vercel

---

# 5. Folder Structure Rules

Agent MUST follow:

```text id="9q6b1y"
src/

├── app/
├── features/
├── components/
├── lib/
├── hooks/
├── types/
├── prisma/
└── tests/
```

Never place business logic inside:

```text id="mjztjt"
app/
components/
```

Business logic belongs to:

```text id="8zbz6m"
features/*/services
```

---

# 6. Coding Standards

## TypeScript

Strict Mode Required

No usage of:

```typescript
any
```

unless explicitly justified.

Prefer:

```typescript
unknown
```

or proper typing.

---

## Functions

Maximum:

```text id="odn1cb"
100 lines
```

If exceeded:

Refactor.

---

## Components

Maximum:

```text id="wzj7dw"
250 lines
```

If exceeded:

Split component.

---

## Nesting

Maximum nesting depth:

```text id="ek7s4i"
3 levels
```

---

# 7. Database Rules

All business entities must contain:

```text id="t7o3y3"
created_at
updated_at
```

Important entities must contain:

```text id="mglavm"
deleted_at
```

Soft delete preferred.

Hard delete discouraged.

---

# 8. Multi Tenant Rules

CRITICAL

Every workspace resource must validate:

```text id="nmrzdh"
workspace_id
```

before access.

Never execute queries without tenant filtering.

Forbidden:

```sql
SELECT * FROM projects;
```

Required:

```sql
SELECT *
FROM projects
WHERE workspace_id = ?;
```

---

# 9. Authorization Rules

Authorization source:

```text id="65mv2e"
workspace_members
```

Never rely solely on:

```text id="fgjlwm"
owner_id
```

Every protected action must validate:

* Membership
* Role
* Workspace

---

# 10. UI Rules

Must follow:

```text id="jlwmkh"
UI_SPEC.md
```

Strictly.

Do not redesign layouts.

Do not replace design system.

---

# 11. Responsiveness Rules

Support:

```text id="fdt3wx"
Mobile
Tablet
Desktop
```

Minimum width:

```text id="57hfoy"
320px
```

No horizontal overflow.

---

# 12. Forms

All forms require:

* Validation
* Error Handling
* Loading State

Never submit raw forms.

Use:

```text id="kp2zhw"
Zod
```

validation.

---

# 13. API Rules

All endpoints must return:

Success:

```json
{
  "success": true,
  "data": {}
}
```

Failure:

```json
{
  "success": false,
  "error": {}
}
```

Never return inconsistent shapes.

---

# 14. Error Handling

Required:

* User Friendly Errors
* Logging
* Retry Actions

Forbidden:

```text id="ylg91r"
Something went wrong
```

without context.

---

# 15. Security Rules

Required:

* Input Validation
* Output Sanitization
* Rate Limiting
* Secure Cookies
* Argon2 Password Hashing

Never expose:

* Secrets
* API Keys
* Internal IDs unnecessarily

---

# 16. Testing Rules

Every feature requires:

## Unit Tests

Business logic.

## Integration Tests

Database + API.

## E2E Tests

Critical flows.

Minimum coverage:

```text id="j8ndri"
80%
```

---

# 17. Documentation Rules

Agent MUST maintain:

* README.md
* CHANGELOG.md
* PROJECT_STATE.md

at all times.

---

# 18. README Rules

README must contain:

* Overview
* Features
* Tech Stack
* Setup
* Deployment
* Environment Variables

Keep updated.

---

# 19. CHANGELOG Rules

Every completed task:

Update CHANGELOG.

Format:

```text id="8o2jaf"
Added
Changed
Fixed
Removed
```

Never skip.

---

# 20. PROJECT_STATE Rules

Must always contain:

## Current Phase

Current TASK_BREAKDOWN phase.

## Completed

Completed work.

## In Progress

Current work.

## Next Tasks

Immediate next tasks.

## Known Issues

Open problems.

Update after every work session.

---

# 21. Commit Rules

Agent MUST commit after:

* Completing a task
* Completing a feature
* Completing a bug fix
* Completing documentation updates

Do not accumulate large uncommitted changes.

---

# 22. Commit Message Standard

Format:

```text id="wvy9sl"
type(scope): message
```

Examples:

```text id="d44gg9"
feat(auth): implement github oauth
feat(projects): add project creation flow
fix(invoice): recurring invoice scheduler bug
docs(prd): update requirements
refactor(crm): simplify lead conversion
```

Allowed Types:

```text id="z9l81u"
feat
fix
docs
refactor
test
chore
perf
```

---

# 23. Push Rules

Agent MUST push after:

* Successful commit
* Passing local validation
* Passing tests

Workflow:

```text id="xwgn2u"
Code
↓
Test
↓
Update Docs
↓
Commit
↓
Push
```

Never push broken code intentionally.

---

# 24. End Of Session Checklist

Before ending work:

Agent MUST verify:

```text id="41th6z"
[ ] Code builds
[ ] Tests pass
[ ] CHANGELOG updated
[ ] PROJECT_STATE updated
[ ] Commit created
[ ] Push completed
```

Session is not complete until all items pass.

---

# 25. AI Decision Rules

When multiple implementations exist:

Choose the solution that:

1. Matches PRD
2. Matches TDD
3. Is simpler
4. Is more maintainable
5. Produces less technical debt

Never optimize prematurely.

---

# 26. Forbidden Actions

Agent MUST NOT:

* Rewrite architecture without approval
* Change database schema without justification
* Add libraries unnecessarily
* Add features not in PRD
* Skip tests
* Skip documentation
* Skip commits
* Skip pushes
* Ignore TASK_BREAKDOWN priorities

---

# 27. Required Workflow

For every task:

```text id="rbdv7m"
Read Documentation
↓
Implement
↓
Test
↓
Update CHANGELOG
↓
Update PROJECT_STATE
↓
Commit
↓
Push
↓
Report Result
```

This workflow is mandatory.

---

# 28. Definition Of Done

A task is complete only if:

```text id="g4qnm9"
Feature implemented
AND
Build passes
AND
Tests pass
AND
Documentation updated
AND
Commit created
AND
Changes pushed
```

If one item is missing:

Task status = NOT DONE.
