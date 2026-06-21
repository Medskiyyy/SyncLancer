# SyncLancer

SyncLancer is a Multi-Tenant Project Management SaaS designed specifically for freelancers. It allows freelancers to manage leads, clients, proposals, projects, milestones, tasks, invoices, time tracking, and files from a single, unified dashboard. It also features a client portal for seamless client collaboration.

## Features

- **Multi-Tenant Architecture**: Multiple workspace creation and isolation.
- **Role-Based Access Control (RBAC)**: Owner and Client membership roles.
- **CRM Module**: Lead capture, pipeline tracking, and conversion to active clients.
- **Client Management**: Profile management and client portal invitations.
- **Proposal Builder**: Creation of proposals with service items, tax calculations, PDF export, and approval workflows.
- **Project & Milestone Management**: Templates for project generation, milestone delivery tracking, and auto-calculation of progress.
- **Kanban Task Board**: Drag-and-drop task tracking.
- **Time Tracking**: Live timers and manual entry logs.
- **Supabase Storage Integration**: File uploads and downloads.
- **Invoice System**: PDF invoice generator and recurring invoice scheduler.
- **Client Portal**: Dedicated portal for clients to check project progress, upload files, and download invoices.
- **Analytics Dashboard**: Revenue tracking, conversion rates, and project performance charts.
- **Installable PWA**: Responsive web app design with offline fallback support.

## Tech Stack

- **Core Framework**: Next.js (App Router)
- **UI & Styling**: React, TailwindCSS, shadcn/ui, Radix UI
- **Language**: TypeScript
- **Database**: PostgreSQL (Supabase PostgreSQL)
- **ORM**: Prisma ORM
- **State Management**: TanStack Query (React Query)
- **Forms**: React Hook Form + Zod
- **Authentication**: Auth.js v5 (NextAuth)
- **Email Service**: Resend
- **Storage**: Supabase Storage
- **PDF Generation**: `@react-pdf/renderer`
- **Charts**: Recharts
- **Drag & Drop**: `@dnd-kit/core`
- **Unit Testing**: Vitest
- **E2E Testing**: Playwright

## Prerequisites

- Node.js (v18+)
- PostgreSQL Database
- Supabase Account
- Resend API Key

## Setup Guide

1. Clone the repository:
   ```bash
   git clone https://github.com/Medskiyyy/SyncLancer.git
   cd SyncLancer
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
4. Run database migrations:
   ```bash
   npx prisma migrate dev
   ```
5. Start development server:
   ```bash
   npm run dev
   ```
