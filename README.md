# Evora Gifting

A production-ready gifting platform for **Evora Gifting** — corporate and personal gifting, built as a discovery-and-enquiry business rather than a traditional e-commerce checkout. Customers browse, get AI-assisted recommendations, build an enquiry basket, and connect with the business over WhatsApp or a form; the owner manages the entire catalog, leads and content from a built-in admin dashboard.

> **Tagline:** "Every gift, intentional."

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Tech Stack](#tech-stack)
4. [Folder Structure](#folder-structure)
5. [Installation](#installation)
6. [Environment Setup](#environment-setup)
7. [Database Setup](#database-setup)
8. [Supabase Setup](#supabase-setup)
9. [AI Setup (Ollama)](#ai-setup-ollama)
10. [WhatsApp Setup](#whatsapp-setup)
11. [Development](#development)
12. [Production Build](#production-build)
13. [Deployment](#deployment)
14. [Admin Setup](#admin-setup)
15. [Replacing Demo Data](#replacing-demo-data)
16. [Troubleshooting](#troubleshooting)

---

## Project Overview

Evora Gifting is **not** a standard e-commerce store. Corporate and bulk gifting rarely works as an instant checkout — pricing depends on quantity, customization and timeline. So the platform is built around:

```
DISCOVER → EXPLORE → GET A RECOMMENDATION → ADD TO ENQUIRY → CONTACT ON WHATSAPP → BUSINESS FOLLOW-UP
```

Products can be marked **Buyable**, **Enquiry Only**, or **Both** by the admin — giving the business full control over which items get a price tag and which require a conversation.

Two sides ship in this one codebase:

- **Customer site** (`/`, `/products`, `/corporate-gifting`, `/cart`, …) — browsing, search, an AI gifting assistant, and an enquiry basket.
- **Admin dashboard** (`/admin`) — products, categories, enquiries, leads, testimonials, site settings, and analytics, behind Supabase-authenticated, role-checked routes.

## Architecture

- **Framework:** Next.js App Router (Server Components by default; Client Components only where interactivity is needed).
- **Data access:** Server Components and Route Handlers call Prisma directly — no internal API round-trip for reads. Mutations from client components go through `/api/**` Route Handlers, which re-validate auth and input server-side (never trust the client).
- **Auth:** Supabase Auth issues the session; `middleware.ts`/`proxy.ts`* refreshes it and gate-keeps `/admin` at the edge; `lib/auth/guard.ts` re-checks the user's `profiles.role` server-side on every admin page and mutation (defense in depth — never rely on the middleware redirect alone).
- **AI:** A provider-agnostic service (`lib/ai/aiService.ts`) retrieves real products/company data from the database, builds a grounded prompt, and asks the configured model (Ollama by default) for a structured JSON response. The app never lets the model reference a product it didn't actually retrieve.
- **WhatsApp:** `lib/whatsapp/` wraps the official Meta Cloud API for business-initiated messages (consent-gated) and provides `wa.me` deep-link builders for the always-available, credential-free "chat on WhatsApp" buttons.
- **Analytics:** A single ingestion endpoint (`/api/analytics/track`) and a thin client (`lib/analytics/client.ts`) — provider-agnostic, so a real analytics vendor can be added later without touching call sites.

<sub>*Next.js renamed the `middleware.ts` file convention to `proxy.ts` in a recent release; this project currently ships with `proxy.ts` (function name `proxy`) as required by the installed Next.js version. If you're on an older Next.js version that doesn't recognize `proxy.ts`, rename it back to `middleware.ts` and the exported function to `middleware` — the logic is identical either way.</sub>

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js (App Router), TypeScript, React |
| Styling | Tailwind CSS v4, shadcn/ui-style components (Radix primitives), Lucide icons |
| Animation | Framer Motion |
| Database | PostgreSQL (via Supabase) |
| ORM | Prisma |
| Auth | Supabase Auth |
| Storage | Supabase Storage |
| State | Zustand (enquiry basket, AI widget state) + localStorage persistence |
| AI | Provider-agnostic abstraction; Ollama (local, open-weight) by default |
| WhatsApp | Meta WhatsApp Business Cloud API + `wa.me` deep links |
| Validation | Zod |
| Charts | Recharts (admin analytics) |

## Folder Structure

```
app/
  (marketing)/        customer-facing pages (home, products, cart, corporate-gifting, ...)
  admin/
    login/             public admin login page
    (dashboard)/       auth-gated admin pages (products, categories, enquiries, leads, settings, analytics)
  api/                 route handlers (public + /api/admin/** mutations)
components/
  ui/                  base design-system primitives (button, card, dialog, ...)
  products/            product card, gallery, filters, actions
  admin/               admin forms, tables, sidebar
  ai/                  AI assistant widget + chat product cards
  layout/              navbar, footer
  home/                homepage sections
lib/
  db/                  Prisma client + query helpers
  auth/                Supabase clients + guard.ts (role enforcement)
  ai/                  aiService.ts, providers/, retrieval/, prompt.ts
  whatsapp/            Cloud API client, wa.me links, consent, leads
  email/               provider-agnostic email abstraction
  analytics/           trackEvent (client) + recordEvent (server)
  validation/          Zod schemas
hooks/                 zustand stores (enquiry basket, AI widget) + client hooks
types/                 shared TypeScript types
prisma/
  schema.prisma        full data model
  seed.ts              demo data seed script
supabase/              RLS policies, storage policies, auth trigger (run manually — see below)
scripts/
  create-admin.ts      creates the first admin user
```

## Installation

Requires Node.js 20+.

```bash
npm install
```

`postinstall` runs `prisma generate` automatically.

## Environment Setup

```bash
cp .env.example .env.local
```

Fill in the values — see [Supabase Setup](#supabase-setup), [AI Setup](#ai-setup-ollama) and [WhatsApp Setup](#whatsapp-setup) below for where each one comes from. Every integration degrades gracefully when its variables are unset:

- No `OLLAMA_BASE_URL` / model unreachable → the AI assistant returns a friendly fallback message instead of erroring.
- No `WHATSAPP_ACCESS_TOKEN` → business-initiated template messages no-op (logged, not sent); the customer-facing `wa.me` buttons work regardless, since they need no credentials.
- No `EMAIL_API_KEY` → emails are logged to the console instead of sent.

So the app runs and is fully browsable with just a database configured.

## Database Setup

The schema lives in `prisma/schema.prisma`. Once `DATABASE_URL`/`DIRECT_URL` point at a real Postgres instance (local or Supabase):

```bash
npx prisma migrate dev --name init   # first time / during development
npm run db:seed                      # populates demo categories, products, testimonials, settings
```

For production/CI, use `npx prisma migrate deploy` instead of `migrate dev`.

Useful scripts:

```bash
npm run db:studio     # Prisma Studio — browse/edit data visually
npm run db:generate   # regenerate the Prisma client after a schema change
```

## Supabase Setup

1. Create a project at [supabase.com](https://supabase.com).
2. **Database:** Settings → Database → copy the connection strings into `DATABASE_URL` (pooled, port 6543) and `DIRECT_URL` (direct, port 5432).
3. **API keys:** Settings → API → copy the Project URL, `anon` key, and `service_role` key into `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY`. The service role key is server-only — it is never sent to the browser and must never be prefixed `NEXT_PUBLIC_`.
4. Run the Prisma migrations against this database (`npx prisma migrate deploy`) and seed it (`npm run db:seed`).
5. In the Supabase SQL Editor, run the three files in `supabase/` **in order** — see `supabase/README.md`:
   - `auth-trigger.sql`
   - `rls-policies.sql`
   - `storage-setup.sql`
6. **Storage:** create a public bucket named `product-images` (Storage → New bucket → Public: on) if you didn't uncomment the insert in `storage-setup.sql`.
7. Create your first admin user — see [Admin Setup](#admin-setup).

## AI Setup (Ollama)

The AI gifting assistant is provider-agnostic (`lib/ai/providers/`). The default provider is Ollama, running a commercially-usable open-weight model.

**Local development:**

```bash
# Install Ollama: https://ollama.com
ollama pull mistral:7b-instruct
ollama serve   # usually already running as a background service
```

Set in `.env.local`:

```
AI_PROVIDER="ollama"
OLLAMA_BASE_URL="http://localhost:11434"
AI_MODEL="mistral:7b-instruct"
```

**Swapping providers:** implement the `AiProvider` interface (`lib/ai/providers/types.ts`) in a new file under `lib/ai/providers/`, then add a case for it in `lib/ai/providers/index.ts`. Nothing else in the app needs to change — `aiService.ts` only depends on the interface.

The assistant is grounded in your real catalog: it retrieves matching products from the database (`lib/ai/retrieval/products.ts`) and only ever references products it actually retrieved (see `getGiftingAssistantResponse` in `lib/ai/aiService.ts`) — it cannot invent products, prices, or stock status.

## WhatsApp Setup

Two independent layers:

1. **`wa.me` deep links** (no setup required) — every "Chat on WhatsApp" / "Enquire on WhatsApp" button uses `lib/whatsapp/links.ts` to build a pre-filled `wa.me` link. Set `NEXT_PUBLIC_WHATSAPP_NUMBER` (international format, digits only) so these buttons appear.
2. **Meta WhatsApp Business Cloud API** (optional, for business-initiated follow-ups and notifications) — requires a Meta developer app with WhatsApp product enabled:
   - `WHATSAPP_ACCESS_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID` — from Meta for Developers → your app → WhatsApp → API Setup.
   - `WHATSAPP_VERIFY_TOKEN` — any string you choose; used to verify the webhook.
   - Set the webhook URL in Meta's dashboard to `https://your-domain.com/api/whatsapp/webhook`.
   - Enable "WhatsApp notifications" in Admin → Settings, and set the business's own WhatsApp number there — that's who receives new-enquiry notifications.
   - **Template messages** (`sendTemplateMessage` in `lib/whatsapp/client.ts`) require pre-approval in Meta Business Manager before they can be sent — create `new_enquiry_notification` and `product_follow_up` templates there (or rename the calls in `lib/whatsapp/leads.ts` to match templates you create).

**Consent:** the app never sends a business-initiated WhatsApp message to a customer without an explicit, recorded opt-in (`whatsapp_consents` table). See `lib/whatsapp/consent.ts` — `sendFollowUpMessage` re-checks consent before every send, even if a caller forgets to.

## Development

```bash
npm run dev
```

Visit `http://localhost:3000`. Admin at `http://localhost:3000/admin` (redirects to login if unauthenticated).

## Production Build

```bash
npm run build
npm run start
```

`npm run lint` runs ESLint (flat config, Next.js + TypeScript rules).

## Deployment

**Recommended: Vercel + Supabase.**

1. Push this repository to GitHub.
2. Import it into Vercel.
3. Add all variables from `.env.example` in Vercel → Project → Settings → Environment Variables (use your real Supabase/Meta/Ollama values — Ollama will need to run on infrastructure you control and be reachable from Vercel, e.g. a small VPS with a public `OLLAMA_BASE_URL`, or swap in a hosted-model provider by implementing a new `AiProvider`).
4. Run `npx prisma migrate deploy` against production `DATABASE_URL` (from CI or locally, pointed at the prod database) before or during the first deploy.
5. Deploy. Vercel builds with `next build` automatically.

Any other Node.js host that supports Next.js (`next build && next start`) works the same way — the app has no Vercel-specific dependencies.

## Admin Setup

The first admin user must be created via script (there's no public sign-up):

```bash
npm run admin:create -- owner@example.com "a-strong-password" "Owner Name"
```

This creates a Supabase Auth user and a matching `profiles` row with `role = ADMIN`. Log in at `/admin/login`. Additional admins/staff can then be created the same way, or by inviting a user through Supabase Auth and setting their `profiles.role` to `ADMIN` or `STAFF` directly (e.g. via Prisma Studio).

Roles: `ADMIN` (full access, including Settings), `STAFF` (everything except Settings — see `app/api/admin/settings/route.ts`), `CUSTOMER` (no admin access).

## Replacing Demo Data

Every product created by `prisma/seed.ts` is flagged `isDemo: true` in the database, so it's easy to identify and bulk-remove once real inventory is loaded:

```sql
-- In Prisma Studio, SQL Editor, or a script:
delete from products where "isDemo" = true;
```

Categories, occasions, recipients, testimonials, and site settings created by the seed script are meant to be **edited** (via Admin → Settings / Categories / Testimonials) rather than deleted outright, since they're used as the initial structure — replace their content with the real business's information.

## Troubleshooting

**"Can't reach database server"** — check `DATABASE_URL`/`DIRECT_URL`. If using Supabase, confirm you're using the pooled connection string (port 6543, `pgbouncer=true`) for `DATABASE_URL` and the direct one (port 5432) for `DIRECT_URL`.

**AI assistant always says "I'm having trouble connecting"** — Ollama isn't reachable at `OLLAMA_BASE_URL`, or the model in `AI_MODEL` hasn't been pulled (`ollama pull mistral:7b-instruct`). This is a safe fallback, not a crash — the rest of the site keeps working.

**WhatsApp buttons don't appear** — set `NEXT_PUBLIC_WHATSAPP_NUMBER`; this is independent of the Cloud API credentials.

**Admin login redirects back to login after signing in** — the Supabase user exists but has no `profiles` row with `role` set to `ADMIN`/`STAFF`. Use `npm run admin:create` or set the role directly in the `profiles` table.

**Image uploads fail in the admin product form** — the `product-images` Storage bucket doesn't exist yet, or `SUPABASE_SERVICE_ROLE_KEY` is missing/incorrect. Pasting an image URL directly (instead of uploading) always works as a fallback and needs no Storage setup.

**`npm audit` shows vulnerabilities** — as of this writing, `npm audit` flags a `deepmerge-ts` advisory via `@prisma/config`, a dev/build-time-only dependency of the Prisma CLI (not part of the deployed runtime bundle). It doesn't affect the live site; check `npm audit` again periodically as upstream fixes land.

---

## Legal content notice

`/privacy` and `/terms` ship with reasonable starting-point content, not a real business's actual data-handling practices. **Have both reviewed by legal counsel before launch** and update them to reflect this business's real practices and jurisdiction (e.g. India's DPDP Act).
