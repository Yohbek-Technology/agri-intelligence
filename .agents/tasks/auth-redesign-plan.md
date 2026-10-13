# Auth Pages Redesign — Implementation Plan

> **Workspace:** `/home/yohannes/repo/agri-intelligence`
> **Build commands:**
> - Shared (if modified): `cd /home/yohannes/repo/agri-intelligence/packages/shared && pnpm build`
> - Web: `cd /home/yohannes/repo/agri-intelligence/apps/web && pnpm build`
>
> **Key constraints discovered:**
> - Tailwind CSS v4 — utility classes map 1-to-1 to CSS variables via `--color-*` tokens, e.g. `bg-primary`, `text-text-primary`, `border-border`
> - `framer-motion@^14.1.0` and `lucide-react@^1.54.0` already installed
> - `globals.css` must NOT be modified
> - `hooks/useAuth.ts` must NOT be modified — all form state/submit logic comes from there
> - The primary color is `#6EE22A` (bright lime green); text on lime green must use `text-[#151A14]` for legibility
> - `@repo/shared` exports all Zod schemas used for live validation
> - Available images in `apps/web/public/images/`: `hero-bg.jpg`, `field-farmers.jpg`, `crop-inspection.jpg`, `voice-box-farmer.jpg`
> - Existing UI components: `button.tsx`, `input.tsx`, `select.tsx`, `notice.tsx`, `brandLogo.tsx`, `badge.tsx`, `card.tsx`
> - `usePasswordReset` hook manages a `step` field (`'request' | 'confirm'`) internally; `resetPassword/page.tsx` shows ONLY the confirm-step fields (hook already sent user through forgotPassword first), so it always renders the confirm form
> - `BrandLogo` supports `inverted` prop for use on dark backgrounds
> - `useResendCountdown(600)` provides `secondsRemaining` as a number (0–600) — use it for the SVG arc timer

---

## Step 1 — Add `success` prop to Input component

Add an optional `success?: boolean` prop to `InputProps`. When `success` is `true` and there is no `error`, apply a green border + ring instead of the default border. This gives visual confirmation when a live-validated field passes.

**File:** `apps/web/components/ui/input.tsx`

**Change:** In the `InputProps` interface, add `success?: boolean`. In the `className` template literal that currently has two branches (`error` → danger border, else → default border+focus), add a third branch: when `success && !error`, use `border-[var(--color-success)] focus:ring-2 focus:ring-[var(--color-success)]/20`. The existing `error` branch stays highest priority.

**Verify:** `cd /home/yohannes/repo/agri-intelligence/apps/web && pnpm build` — zero TypeScript errors.

---

## Step 2 — Create `PasswordStrength` component

Create a new file with a `PasswordStrength` component that accepts `password: string` and renders a 3-segment strength bar with a label.

**File:** `apps/web/components/ui/passwordStrength.tsx`

**Component API:**
```tsx
interface PasswordStrengthProps {
  password: string
}
export function PasswordStrength({ password }: PasswordStrengthProps)
```

**Strength logic (derive in component body):**
- `'weak'`: `password.length < 8`
- `'medium'`: `password.length >= 8` AND NOT matching `/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]).{10,}$/`
- `'strong'`: matches `/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]).{10,}$/`

**Render:**
- Container: `w-full space-y-1.5`
- Three equal-width segments in a `flex gap-1` row, each `h-1.5 rounded-full flex-1 transition-all duration-300`
  - `weak`: segment 0 = `bg-[var(--color-danger)]`, segments 1–2 = `bg-[var(--color-border)]`
  - `medium`: segments 0–1 = `bg-[var(--color-accent)]`, segment 2 = `bg-[var(--color-border)]`
  - `strong`: all 3 = `bg-[var(--color-success)]`
- Label: `text-xs font-mono font-semibold mt-1` with matching color (`text-[var(--color-danger)]` / `text-[var(--color-accent)]` / `text-[var(--color-success)]`)
- Only render when `password.length > 0`, otherwise return `null`
- Mark `'use client'`

**Verify:** `cd /home/yohannes/repo/agri-intelligence/apps/web && pnpm build` — zero TypeScript errors.

---

## Step 3 — Redesign Auth Layout (`layout.tsx`)

Replace the current centered-gradient layout with a two-panel split layout. The left panel is a 40%-width decorative/brand panel; the right 60% renders `children`.

**File:** `apps/web/app/(auth)/layout.tsx`

**Left panel (hidden on mobile, `hidden lg:flex`):**
- Full height: `relative h-full overflow-hidden` with `next/image` using `fill` + `objectFit="cover"` pointing to `/images/hero-bg.jpg`
- A dark green overlay on top of the image: `absolute inset-0 bg-[#0D1F0B]/75`
- Content floated in the overlay using `absolute inset-0 flex flex-col justify-between p-10 z-10`:
  - Top: `<BrandLogo size="lg" inverted />` — use `inverted` prop so text shows white on dark
  - Middle: A stats rotator — three stat items cycle every 3 seconds using `useState` + `useEffect` with a `setInterval`. Items: `{ icon: '👨‍🌾', value: '412', label: 'Farmers Connected' }`, `{ icon: '🎯', value: '98.4%', label: 'Precision Rate' }`, `{ icon: '🌾', value: '34.2 Qt/Ha', label: 'Avg Yield' }`. Show one at a time with framer-motion `AnimatePresence` + fade/slide up transition.
  - Animated SVG field lines (subtle): a fixed `<svg className="absolute inset-0 w-full h-full opacity-10 pointer-events-none">` with three `<path>` elements using sine-curve shapes and `stroke="#6EE22A"` `strokeWidth="1"` `fill="none"` — these are decorative only, no animation needed to keep it simple
  - Bottom: A single-line footer `<p className="text-white/50 text-xs font-mono">Adama Agricultural Zone — Ethiopia</p>`
- The layout itself must be a `'use client'` component (needed for the rotating stats `useInterval` logic)
- Import `'use client'` at the top; import `{ useState, useEffect }` from React; import `Image` from `next/image`; import `{ motion, AnimatePresence }` from `framer-motion`; import `BrandLogo`

**Right panel (`flex-1` or `w-full lg:w-3/5`):**
- White background `bg-[var(--color-surface)]`
- `flex flex-col min-h-screen`
- Mobile top bar (`flex lg:hidden items-center justify-between px-5 py-4 border-b border-[var(--color-border)]`): `<BrandLogo size="sm" />` on left, small "← Portal" link on right
- Main content area: `flex-1 flex items-center justify-center px-6 py-10 overflow-y-auto` — renders `{children}`

**Overall structure:**
```tsx
<div className="flex min-h-screen">
  {/* left 40% */}
  <div className="hidden lg:flex lg:w-2/5 relative ...">...</div>
  {/* right 60% */}
  <div className="w-full lg:w-3/5 flex flex-col min-h-screen ...">
    {/* mobile topbar */}
    <main className="flex-1 flex items-center justify-center ...">
      {children}
    </main>
  </div>
</div>
```

**Verify:** `cd /home/yohannes/repo/agri-intelligence/apps/web && pnpm build` — zero TypeScript errors, no "use client" directive errors.

---

## Step 4 — Redesign `signIn/page.tsx`

Full replacement of the page with premium agricultural design and live validation.

**File:** `apps/web/app/(auth)/signIn/page.tsx`

**Live validation wiring:**
```tsx
const [liveErrors, setLiveErrors] = useState<Record<string, string>>({})

// In phone onChange:
const onPhoneChange = (value: string) => {
  setField('phoneNumber', value)
  const r = PhoneSignInSchema.shape.phoneNumber.safeParse(value)
  setLiveErrors(prev => ({ ...prev, phoneNumber: r.success ? '' : (r.error.issues[0]?.message ?? '') }))
}

// In password onChange:
const onPasswordChange = (value: string) => {
  setField('password', value)
  const r = PhoneSignInSchema.shape.password.safeParse(value)
  setLiveErrors(prev => ({ ...prev, password: r.success ? '' : (r.error.issues[0]?.message ?? '') }))
}
```
Display: `error={liveErrors.phoneNumber || fieldErrors.phoneNumber}` on each Input. For success state: `success={!!(formData.phoneNumber && !liveErrors.phoneNumber && !fieldErrors.phoneNumber)}`.

**Page structure (no card wrapper — fills right panel):**
```
max-w-md w-full mx-auto space-y-6
├── Heading block
│   ├── h1: "Welcome Back" — text-2xl font-bold text-text-primary
│   └── p: "Monitor your crops. Extend your reach." — text-sm text-text-muted
├── Lockout banner (conditional): red banner strip `bg-danger-light border-l-4 border-danger text-danger text-xs font-mono p-3 rounded-lg`
├── generalError Notice (if present)
├── form
│   ├── Phone Input (with live validation + success prop)
│   ├── Password label row (inline "Forgot password?" link) + Password Input (live validation)
│   └── Submit Button full-width "Sign In →"
├── "Current Field Conditions" widget
│   └── div with `bg-[var(--color-surface-subtle)] border border-[var(--color-border)] rounded-2xl p-4`
│       ├── Header: 🌤 Adama Region — text-xs font-mono font-bold text-text-muted uppercase
│       └── Row: "Optimal spray window: Tomorrow 07:00–13:00" — text-sm text-text-primary
└── Footer link: "New here? Register Account →"
```

**Imports to add:** `PhoneSignInSchema` from `@repo/shared`, `useState` from react.

**Verify:** `cd /home/yohannes/repo/agri-intelligence/apps/web && pnpm build` — zero TypeScript errors.

---

## Step 5 — Redesign `signUp/page.tsx`

Full replacement with 3-step progress indicator, live validation, and password strength meter.

**File:** `apps/web/app/(auth)/signUp/page.tsx`

**New import:** `PasswordStrength` from `@/components/ui/passwordStrength`, `PhoneSignUpSchema` from `@repo/shared`, `useState` from react.

**Step indicator (static, always shows Step 1 active):**
Three pill badges in a `flex justify-center gap-2 mb-6` row:
- `Step 1: Account` — `bg-primary text-[#151A14] font-mono text-xs px-3 py-1 rounded-full font-bold`
- `Step 2: Verify SMS` — `bg-[var(--color-surface-subtle)] text-text-muted font-mono text-xs px-3 py-1 rounded-full`
- `Step 3: Dashboard` — same muted style as Step 2

**Live validation wiring:**
```tsx
const [liveErrors, setLiveErrors] = useState<Record<string, string>>({})

const onNameChange = (v: string) => {
  setField('name', v)
  const r = PhoneSignUpSchema.shape.name.safeParse(v)
  setLiveErrors(p => ({ ...p, name: r.success ? '' : (r.error.issues[0]?.message ?? '') }))
}
const onPhoneChange = (v: string) => {
  setField('phoneNumber', v)
  const r = PhoneSignUpSchema.shape.phoneNumber.safeParse(v)
  setLiveErrors(p => ({ ...p, phoneNumber: r.success ? '' : (r.error.issues[0]?.message ?? '') }))
}
const onPasswordChange = (v: string) => {
  setField('password', v)
  const r = PhoneSignUpSchema.shape.password.safeParse(v)
  setLiveErrors(p => ({ ...p, password: r.success ? '' : (r.error.issues[0]?.message ?? '') }))
}
```
Display: `error={liveErrors[field] || fieldErrors[field]}`, `success={!!(value && !liveErrors[field] && !fieldErrors[field])}`.

**Form structure:**
```
max-w-md w-full mx-auto space-y-6
├── Step indicator (3 pills)
├── Heading: "Join AgriIntel" h1 + "Start your precision farming journey." p
├── generalError Notice (if any)
├── form
│   ├── Name Input (live validation + success)
│   ├── Phone Input (live validation + success)
│   ├── Password Input (live validation + success)
│   ├── <PasswordStrength password={formData.password} /> — render directly below password input, outside the Input component
│   ├── Language Select (no live validation needed — it's an enum select)
│   └── Submit Button "Continue to SMS Verification →"
└── "Already registered? Sign In →"
```

**Verify:** `cd /home/yohannes/repo/agri-intelligence/apps/web && pnpm build` — zero TypeScript errors.

---

## Step 6 — Redesign `verifyOtp/page.tsx`

Full replacement with SVG circular countdown timer, phone masked pill, and SVG phone+signal illustration.

**File:** `apps/web/app/(auth)/verifyOtp/page.tsx`

**SVG Arc Countdown Timer:**
- Place inside a `flex justify-center` above the digit boxes
- Circle radius 36, cx=44, cy=44, circumference = `2 * Math.PI * 36 ≈ 226.2`
- `strokeDashoffset = circumference * (1 - secondsRemaining / 600)` — fills as time ticks
- Background circle: `stroke="#DFD9CB"` (matches `--color-border`)
- Progress arc: `stroke="var(--color-primary)"` with `strokeLinecap="round"` and `transform="rotate(-90 44 44)"`
- Center text: two `<text>` elements — the formatted time (e.g. `09:45`) and a small "remaining" label
- Pull `secondsRemaining` and `formattedTime` from `useResendCountdown(600)` (already used in the hook call on this page)

**Masked phone badge:**
```tsx
const maskedPhone = phoneNumber
  ? phoneNumber.slice(0, -4).replace(/\d/g, '•') + phoneNumber.slice(-4)
  : 'Registered Line'
```
Render as: `<span className="inline-flex items-center gap-1.5 font-mono font-bold text-xs px-3.5 py-1.5 rounded-full bg-primary-light text-primary border border-primary/20">`

**SVG phone+signal illustration** (left side is handled by layout; this belongs in the right panel above the masked badge on mobile):
- A small inline SVG icon (48×48): a rounded rectangle representing a phone with 3 radiating arcs to the right
- Use `stroke="var(--color-primary)"` throughout, `fill="none"`, `strokeWidth="1.5"`
- Wrap in `flex justify-center mb-4`

**OTP digit inputs** — keep exact same behavior as current code (same `setDigit`, `handleKeyDown`, `handlePaste`, `setInputRef` calls). Only style change: upgrade box size to `w-12 h-16` on sm screens, add `data-filled={!!digit}` attribute and use `border-primary` when digit is filled (`digit ? 'border-primary bg-primary-light' : 'border-border'`).

**Security note strip** (below digit boxes, above resend/verify):
```tsx
<div className="flex items-center gap-2 text-xs font-mono text-text-muted bg-surface-subtle border border-border rounded-xl px-3 py-2">
  <span>🔒</span>
  <span>Code expires in 10 minutes. Do not share it.</span>
</div>
```

**Page structure:**
```
max-w-md w-full mx-auto space-y-5
├── SVG phone illustration (centered)
├── Heading: "Confirm Your Line" + masked phone badge below
├── SVG arc countdown timer
├── error Notice (if any)
├── 6 digit boxes (preserved behavior)
├── Security note strip
├── Resend row (existing logic)
├── "Verify & Activate" button
└── "← Change phone number" link
```

**Verify:** `cd /home/yohannes/repo/agri-intelligence/apps/web && pnpm build` — zero TypeScript errors.

---

## Step 7 — Redesign `forgotPassword/page.tsx`

Full replacement with premium design, live phone validation, and security note.

**File:** `apps/web/app/(auth)/forgotPassword/page.tsx`

**Live validation wiring:**
```tsx
const [liveErrors, setLiveErrors] = useState<Record<string, string>>({})

const onPhoneChange = (v: string) => {
  setPhoneNumber(v)
  const r = PasswordResetRequestSchema.shape.phoneNumber.safeParse(v)
  setLiveErrors({ phoneNumber: r.success ? '' : (r.error.issues[0]?.message ?? '') })
}
```
Display: `error={liveErrors.phoneNumber || fieldErrors?.phoneNumber}` — note: `usePasswordReset` exposes `fieldErrors` as `Record<string, string>` so access as `fieldErrors?.phoneNumber`.

**Page structure:**
```
max-w-md w-full mx-auto space-y-6
├── Lock icon (SVG or lucide `LockKeyhole`, size 40, color `var(--color-accent)`) — centered
├── Heading: "Account Recovery" h1 + "We'll send a 6-digit code to your registered line." p
├── generalError Notice (if any)
├── form
│   ├── Phone Input (live validation + success)
│   ├── Security note strip:
│   │   `<div className="flex items-center gap-2 text-xs font-mono text-text-muted bg-accent-light border border-accent/30 rounded-xl px-3 py-2">`
│   │   `<span>⏱</span><span>OTP expires in 10 minutes. Keep your phone nearby.</span>`
│   └── Submit Button "Send Recovery Code →"
└── "← Return to Sign In" link
```

**Import note:** `LockKeyhole` icon from `lucide-react`, `PasswordResetRequestSchema` from `@repo/shared`, `useState` from react. Keep the `Suspense` wrapper as the default export.

**Verify:** `cd /home/yohannes/repo/agri-intelligence/apps/web && pnpm build` — zero TypeScript errors.

---

## Step 8 — Redesign `resetPassword/page.tsx`

Full replacement with live validation on all fields, password strength meter, and success-state animated checkmark.

**File:** `apps/web/app/(auth)/resetPassword/page.tsx`

**Important:** `usePasswordReset` hook manages `step` internally (`'request' | 'confirm'`). The `resetPassword` page only ever renders the confirm-step form (users reach this page after completing `forgotPassword`). The hook exposes `handleConfirmSubmit` — use that. Do not reference `step` or call `handleRequestSubmit` here.

**Live validation wiring:**
```tsx
const [liveErrors, setLiveErrors] = useState<Record<string, string>>({})

const onPhoneChange = (v: string) => {
  setPhoneNumber(v)
  const r = PasswordResetRequestSchema.shape.phoneNumber.safeParse(v)
  setLiveErrors(p => ({ ...p, phoneNumber: r.success ? '' : (r.error.issues[0]?.message ?? '') }))
}
const onCodeChange = (v: string) => {
  setCode(v)
  const valid = v.length === 6 && /^[0-9]{6}$/.test(v)
  setLiveErrors(p => ({ ...p, code: valid ? '' : (v.length > 0 ? 'Must be exactly 6 digits' : '') }))
}
const onNewPasswordChange = (v: string) => {
  setNewPassword(v)
  const r = PasswordResetConfirmSchema.shape.newPassword.safeParse(v)
  setLiveErrors(p => ({ ...p, newPassword: r.success ? '' : (r.error.issues[0]?.message ?? '') }))
  // re-validate confirm live
  if (confirmPassword) {
    setLiveErrors(p => ({ ...p, confirmPassword: v === confirmPassword ? '' : 'Passwords do not match' }))
  }
}
const onConfirmPasswordChange = (v: string) => {
  setConfirmPassword(v)
  setLiveErrors(p => ({ ...p, confirmPassword: v === newPassword ? '' : (v.length > 0 ? 'Passwords do not match' : '') }))
}
```

**Success animation:**
When `successMessage` is truthy, instead of rendering the form, render:
```tsx
<motion.div
  initial={{ scale: 0.5, opacity: 0 }}
  animate={{ scale: 1, opacity: 1 }}
  transition={{ type: 'spring', stiffness: 200, damping: 15 }}
  className="flex flex-col items-center justify-center gap-4 py-12"
>
  <div className="w-20 h-20 rounded-full bg-success-light border-2 border-[var(--color-success)] flex items-center justify-center">
    <motion.svg ... animate checkmark stroke-dashoffset from full to 0 />
  </div>
  <h2 className="text-xl font-bold text-text-primary">Password Updated</h2>
  <p className="text-sm text-text-muted text-center">{successMessage}</p>
</motion.div>
```
For the animated checkmark SVG: `viewBox="0 0 40 40"`, path `d="M10 20 L17 28 L30 13"`, use `motion.path` with `initial={{ pathLength: 0 }}`, `animate={{ pathLength: 1 }}`, `transition={{ duration: 0.5, delay: 0.2 }}`, `stroke="var(--color-success)"`, `strokeWidth="3"`, `fill="none"`, `strokeLinecap="round"`.

**Form structure:**
```
max-w-md w-full mx-auto space-y-6
├── successMessage → animated checkmark block (conditional)
├── (else) form block:
│   ├── Heading: "Set New Password" + "Enter your recovery code and choose a strong new password."
│   ├── generalError Notice (if any)
│   ├── form onSubmit={handleConfirmSubmit}
│   │   ├── Phone Input (live validation + success)
│   │   ├── 6-digit Code Input (inputMode="numeric" maxLength={6}, live validation + success)
│   │   ├── New Password Input (live validation + success)
│   │   ├── <PasswordStrength password={newPassword} />
│   │   ├── Confirm Password Input (live validation + success)
│   │   └── Submit Button "Reset & Revoke Sessions →"
│   └── "← Return to Sign In" link
```

**Import note:** `PasswordStrength` from `@/components/ui/passwordStrength`, `PasswordResetRequestSchema` and `PasswordResetConfirmSchema` from `@repo/shared`, `motion` from `framer-motion`, `useState` from react. Keep the `Suspense` wrapper.

**Verify:** `cd /home/yohannes/repo/agri-intelligence/apps/web && pnpm build` — zero TypeScript errors.

---

## Step 9 — Final build verification

Run the full build chain to confirm all TypeScript compiles cleanly and no Next.js static analysis errors remain.

**Commands (in order):**
```bash
cd /home/yohannes/repo/agri-intelligence/packages/shared && pnpm build
cd /home/yohannes/repo/agri-intelligence/apps/web && pnpm build
```

**Expected outcome:** Both commands exit with code 0, no TypeScript errors, no missing module errors. If any error remains, fix the specific file before declaring done.

---

## Dependency summary

| Step | Depends on |
|------|-----------|
| 1 | — |
| 2 | — |
| 3 | 1 (BrandLogo already correct) |
| 4 | 1 |
| 5 | 1, 2 |
| 6 | 1 |
| 7 | 1 |
| 8 | 1, 2 |
| 9 | 1–8 |

Steps 1 and 2 have no dependencies and can be done first in any order. Steps 3–8 all depend on step 1 (Input success prop) and can be done in any order after that. Step 9 must be last.

---

## Files to create / modify

| Action | Path |
|--------|------|
| **Modify** | `apps/web/components/ui/input.tsx` |
| **Create** | `apps/web/components/ui/passwordStrength.tsx` |
| **Modify** | `apps/web/app/(auth)/layout.tsx` |
| **Modify** | `apps/web/app/(auth)/signIn/page.tsx` |
| **Modify** | `apps/web/app/(auth)/signUp/page.tsx` |
| **Modify** | `apps/web/app/(auth)/verifyOtp/page.tsx` |
| **Modify** | `apps/web/app/(auth)/forgotPassword/page.tsx` |
| **Modify** | `apps/web/app/(auth)/resetPassword/page.tsx` |

**Do NOT modify:**
- `apps/web/hooks/useAuth.ts`
- `apps/web/services/authService.ts`
- `apps/web/app/globals.css`
- Any dashboard pages or `app/page.tsx`
- Any provider files
- `packages/shared/src/validators/auth.ts` (schemas are sufficient as-is)
