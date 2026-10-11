# Autonomous Agricultural Intelligence & Extension System

A modern, multi-tenant monorepo powering the **Autonomous Agricultural Intelligence & Extension System** for highland agriculture in Ethiopia (Adama Zone reference implementation).

The platform serves three primary roles across web, mobile, and field operations:
- **Smallholder Farmers**: Plot management, tillering diagnostics, 7-day "Farm or Not" agro-meteorological advisories, disease identification, and market intelligence.
- **Development Agents (DAs)**: Kebele field hub, offline-first farmer rosters, visit scheduling, and crop observation logging.
- **City Agriculture Officers**: Municipal yield aggregates, strategic fertilizer/seed depot ledgers, and emergency multi-language SMS broadcast dispatch.

---

## 🏗️ Repository Architecture

This repository is managed with [Turborepo](https://turbo.build/repo) and [pnpm](https://pnpm.io/) workspaces:

```text
agri-intelligence/
├── apps/
│   ├── server/             # Hono.js backend API (Node.js, Drizzle ORM, Better Auth, Socket.IO)
│   ├── web/                # Next.js 16 frontend portal (App Router, Turbopack, Tailwind CSS)
│   └── mobile/             # React Native / WatermelonDB mobile client for field devices
├── packages/
│   ├── shared/             # Canonical TypeScript contracts, Zod schemas, and domain types
│   ├── ui/                 # Shared atomic UI primitives
│   ├── typescript-config/  # Shared tsconfig bases
│   └── eslint-config/      # Shared ESLint configurations
├── turbo.json              # Turborepo task pipeline configuration
└── pnpm-workspace.yaml     # Workspace boundary definitions
```

---

## ⚡ Prerequisites

Before setting up the project, ensure you have the following installed:

1. **Node.js**: `v20.x` or later (`v24.x` recommended)
   ```bash
   node --version
   ```
2. **pnpm**: `v9.x` or later (repository targets `pnpm@12.x`)
   ```bash
   corepack enable
   corepack prepare pnpm@latest --activate
   ```
3. **PostgreSQL**: PostgreSQL 15+ instance (Local, or cloud providers such as [Neon](https://neon.tech) / [Supabase](https://supabase.com)).

---

## 🚀 Quickstart & Setup Guide

### 1. Clone the Repository

```bash
git clone https://github.com/Yohbek-Technology/agri-intelligence.git
cd agri-intelligence
```

### 2. Install Monorepo Dependencies

Install dependencies across all apps and packages in the workspace:

```bash
pnpm install
```

### 3. Configure Environment Variables

#### Backend (`apps/server`)
Copy the sample environment configuration:

```bash
cp apps/server/.env.example apps/server/.env
```

Edit `apps/server/.env` with your credentials:
- `DATABASE_URL`: Your PostgreSQL connection string (e.g. `postgresql://user:pass@host/db?sslmode=require`)
- `BETTER_AUTH_SECRET`: Random 32-byte secret (generate via `pnpx @better-auth/cli secret`)
- `BETTER_AUTH_URL`: `http://localhost:5000`
- `PORT`: `5000`
- `CORS_ORIGIN`: `http://localhost:3000`
- `OPENROUTER_API_KEY` / `GEMINI_API_KEY`: API key for agronomic reasoning & LLM diagnostics
- `AT_SANDBOX_API_KEY`: Africa's Talking API key for SMS advisories (`AT_USERNAME=sandbox`)
- `CLOUDINARY_*`: Cloudinary cloud name, API key, and secret for leaf imagery storage

#### Frontend (`apps/web`)
Copy the web application environment configuration:

```bash
cp apps/web/.env.example apps/web/.env
```

Defaults to:
```env
NEXT_PUBLIC_SERVER_URL=http://localhost:5000
```

---

### 4. Database Setup & Seeding

Run Drizzle schema generation, execute migrations, and seed initial records:

```bash
# 1. Generate any pending Drizzle migration SQL
pnpm --filter server db:generate

# 2. Apply migrations to your PostgreSQL database
pnpm --filter server db:migrate

# 3. Seed initial city office, administrative roles, and demo data
pnpm --filter server db:seed
```

> **Note**: The seed script configures the **Adama City Agriculture Office** (`ad5b692f-f1fb-4bc8-afe1-98a703b017b0`) and provisions default administrative accounts.

---

### 5. Launch Development Servers

Start all workspaces concurrently via Turborepo:

```bash
pnpm dev
```

The services will be available at:
- **Frontend Web Portal**: [http://localhost:3000](http://localhost:3000)
- **Backend API & Hono Server**: [http://localhost:5000](http://localhost:5000)
- **Better Auth Interactive API Docs**: [http://localhost:5000/api/auth/reference](http://localhost:5000/api/auth/reference)

To launch workspaces individually:

```bash
# Launch only the frontend
pnpm --filter web dev

# Launch only the backend server
pnpm --filter server dev
```

---

## 🛠️ Common Workspace Commands

### Testing & Code Quality

```bash
# Run backend unit tests (Vitest)
pnpm --filter server test

# Run backend integration tests
pnpm --filter server test:integration

# Run all test suites
pnpm --filter server test:all

# Lint entire monorepo
pnpm lint

# Type-check all packages
pnpm check-types

# Production bundle build
pnpm build
```

### Database Operations (Drizzle ORM)

All database operations are encapsulated in `apps/server`:

```bash
# Generate SQL migration files from schema definitions
pnpm --filter server db:generate

# Execute pending migrations against target database
pnpm --filter server db:migrate

# Re-run database seeding
pnpm --filter server db:seed
```

---

## 💡 Important Gotchas & Team Guidelines

1. **Strict Contract Integrity (`@repo/shared`)**:
   - Validation schemas (Zod) and TypeScript types must **only** be defined in `packages/shared`.
   - Never duplicate validation logic or types in `apps/web` or `apps/server`. Always import from `@repo/shared`.

2. **Node.js IPv4 DNS Resolution**:
   - If using a cloud database pooler (e.g. Neon, Supabase) and encountering `ECONNREFUSED` or `ETIMEDOUT` during migrations or seeding, prepend `NODE_OPTIONS='--dns-result-order=ipv4first'`. This is automatically configured in the `pnpm --filter server db:seed` script.

3. **PostgreSQL SSL Configuration**:
   - With modern `pg` drivers, pass `sslmode=require` or `sslmode=verify-full` in your `DATABASE_URL` query parameters to prevent connection warnings.

4. **Component vs. Page Separation**:
   - In `apps/web/`, keep full page layout, workflows, and form state directly in their respective `app/**/page.tsx` files.
   - `components/ui/` is reserved strictly for generic, reusable design primitives (`Button`, `Input`, `Select`, `Card`, `Badge`, `Notice`, `BrandLogo`).

5. **Authentication Lifecycle**:
   - The platform uses phone number + password with 6-digit SMS OTP via Africa's Talking.
   - Role-based route guards (`farmer`, `da`, `officer`, `system_admin`) protect dashboard workspaces (`/farmer`, `/da`, `/officer`).
