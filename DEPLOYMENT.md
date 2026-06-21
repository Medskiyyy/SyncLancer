# SyncLancer — Deployment Guide

## Prerequisites

| Tool | Minimum version |
|---|---|
| Node.js | 20.x LTS |
| npm | 10.x |
| Vercel CLI | latest |

---

## 1. External Services Setup

### Supabase (Database + Storage)

1. Create a project at [supabase.com](https://supabase.com)
2. Go to **Settings → Database → Connection String** — copy the **URI** (with `pgbouncer=true`)
3. Go to **Settings → API** — copy the `anon` key and `service_role` key
4. Go to **Storage** — create a public bucket named `synclancer-files`
5. Enable **RLS** on the bucket and set a policy to allow authenticated users to upload

> Use the **pooler connection string** (port 6543) for `DATABASE_URL` in production, not port 5432, to support serverless connections.

### Resend (Transactional Email)

1. Create an account at [resend.com](https://resend.com)
2. Add and verify your sending domain (e.g. `mail.yourdomain.com`)
3. Copy the API key → `RESEND_API_KEY`
4. Set `EMAIL_FROM` to `SyncLancer <noreply@yourdomain.com>`

### OAuth Providers (optional)

**Google:**
1. Console → Credentials → OAuth 2.0 Client IDs
2. Authorized redirect URI: `https://yourdomain.com/api/auth/callback/google`
3. Copy Client ID → `AUTH_GOOGLE_ID`, Client Secret → `AUTH_GOOGLE_SECRET`

**GitHub:**
1. Settings → Developer Settings → OAuth Apps → New OAuth App
2. Callback URL: `https://yourdomain.com/api/auth/callback/github`
3. Copy Client ID → `AUTH_GITHUB_ID`, Client Secret → `AUTH_GITHUB_SECRET`

---

## 2. Environment Variables

| Variable | Description | Required |
|---|---|---|
| `DATABASE_URL` | Supabase PostgreSQL pooler URL (port 6543) | Yes |
| `AUTH_SECRET` | NextAuth secret (`openssl rand -base64 32`) | Yes |
| `AUTH_URL` | Production URL, e.g. `https://synclancer.vercel.app` | Yes |
| `AUTH_GOOGLE_ID` | Google OAuth client ID | Optional |
| `AUTH_GOOGLE_SECRET` | Google OAuth client secret | Optional |
| `AUTH_GITHUB_ID` | GitHub OAuth app client ID | Optional |
| `AUTH_GITHUB_SECRET` | GitHub OAuth app client secret | Optional |
| `RESEND_API_KEY` | Resend API key for transactional email | Yes |
| `EMAIL_FROM` | From address, e.g. `SyncLancer <noreply@yourdomain.com>` | Yes |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key (public) | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (secret, server-only) | Yes |
| `CRON_SECRET` | Secret token authorizing the recurring-invoices cron | Yes |

Generate secrets:
```bash
openssl rand -base64 32   # AUTH_SECRET
openssl rand -hex 32      # CRON_SECRET
```

---

## 3. Database Migration

Run against your Supabase database **before** first deploy:

```bash
export DATABASE_URL="postgresql://postgres:[PASSWORD]@[HOST]:6543/postgres?pgbouncer=true"
npx prisma migrate deploy
```

> Never run `prisma migrate dev` against production. Use `migrate deploy` only.

---

## 4. Vercel Deployment

```bash
npm i -g vercel
vercel login
vercel --prod
```

Add environment variables via Vercel dashboard: **Project → Settings → Environment Variables**

Or via CLI:
```bash
vercel env add DATABASE_URL production
vercel env add AUTH_SECRET production
# ... etc
```

Connect the GitHub repository for automatic deployments:
- `main` → Production
- Feature branches → Preview environments

---

## 5. Cron Job

`vercel.json` schedules `/api/cron/recurring-invoices` at 09:00 UTC daily.

The endpoint validates the `Authorization: Bearer <CRON_SECRET>` header. Set `CRON_SECRET` in Vercel env vars — it must match what the cron endpoint checks.

---

## 6. Post-Deploy Checklist

- [ ] `GET https://yourdomain.com/api/health` → `{ "status": "ok", "db": "connected" }`
- [ ] `/login` page loads
- [ ] Register with email/password
- [ ] Create a workspace, project, task
- [ ] Generate a PDF invoice
- [ ] Verify email delivery in Resend dashboard
- [ ] Verify file upload in Supabase Storage
- [ ] Check Vercel function logs for errors

---

## 7. Custom Domain

1. Vercel dashboard → **Project → Settings → Domains → Add**
2. Update DNS records as instructed by Vercel
3. Update `AUTH_URL` env var to your custom domain
4. Update OAuth callback URLs in Google/GitHub consoles

---

## 8. Troubleshooting

| Issue | Fix |
|---|---|
| `PrismaClientInitializationError` in prod | Use pooler URL on port 6543 |
| Auth redirects to wrong URL | `AUTH_URL` must exactly match production domain |
| Cron job 401 | `CRON_SECRET` mismatch |
| Emails not sending | Check `RESEND_API_KEY` and domain verification in Resend |
| Storage upload failing | Check Supabase RLS policies and `SUPABASE_SERVICE_ROLE_KEY` |
