# Web Application (`apps/web`)

Next.js 16 frontend portal for the Autonomous Agricultural Intelligence & Extension System.

## Tech Stack
- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, Turbopack)
- **Styling**: Tailwind CSS, Highland agro-palette design tokens
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Data Fetching**: [TanStack Query](https://tanstack.com/query)
- **Client Auth**: [Better Auth React Client](https://www.better-auth.com/)

## Getting Started

1. Ensure environment variables are configured:
   ```bash
   cp .env.example .env
   ```
2. Start development server:
   ```bash
   pnpm dev           # Listens on http://localhost:3000
   ```
3. Lint and build:
   ```bash
   pnpm lint          # Run ESLint checks
   pnpm build         # Build production bundle with Turbopack
   ```

## Routing & Workspaces
- `/`: Public landing portal with live telemetry & agronomy showcases
- `/signIn`, `/signUp`, `/verifyOtp`, `/forgotPassword`, `/resetPassword`: Phone authentication flow
- `/farmer`: Smallholder Farmer Workspace
- `/da`: Development Agent Field Hub
- `/officer`: City Agriculture Officer Workstation
