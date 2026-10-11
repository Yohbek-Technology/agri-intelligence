# Backend Server (`apps/server`)

Hono.js backend service powering the Autonomous Agricultural Intelligence & Extension System.

## Tech Stack
- **Framework**: [Hono](https://hono.dev/) on Node.js
- **Database & ORM**: PostgreSQL with [Drizzle ORM](https://orm.drizzle.team/)
- **Authentication**: [Better Auth](https://www.better-auth.com/) (`phoneNumber` credential accounts)
- **Real-Time Communication**: [Socket.IO](https://socket.io/)
- **AI Engine**: Google Gemini / OpenRouter for agronomic diagnostics and voice
- **Telecom & Media**: Africa's Talking SMS API, Cloudinary media CDN

## Getting Started

1. Ensure environment variables are configured:
   ```bash
   cp .env.example .env
   ```
2. Database commands:
   ```bash
   pnpm db:generate   # Generate Drizzle migration files
   pnpm db:migrate    # Apply migrations to database
   pnpm db:seed       # Seed office parameters and admin credentials
   ```
3. Start development server:
   ```bash
   pnpm dev           # Listens on http://localhost:5000
   ```
4. Run tests:
   ```bash
   pnpm test          # Unit test suite (Vitest)
   pnpm test:integration  # Integration test suite
   ```
