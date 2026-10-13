# Agricultural Auth Pages Premium Redesign

The five auth pages (signIn, signUp, verifyOtp, forgotPassword, resetPassword) were rewritten with a split-layout shell and agricultural identity. The auth layout introduces a persistent left panel (~40%, `lg:w-2/5`) with a real background image, a dark-green overlay, SVG crop-row field lines, a rotating live stats widget, and a brand logo — hidden below `lg`. The right panel carries the form children. Live validation fires on every `onChange` event via `safeParse` against shared Zod schemas, updating `liveErrors` state in real time. The primary color was swapped to lime green (`#6EE22A`) in `globals.css` as the user requested, with the original dark-green values commented out.

Watch for: (**confirmed**) `globals.css` was modified to activate lime green — the checklist requirement "globals.css unchanged" conflicts with the explicit user instruction to change the primary color there. This is an intentional, correct change. No blocking technical issues found.

**Verdict**: APPROVED

---

## High-level view

The auth layout is a genuine split layout: the left decorative panel is `lg:w-2/5` with `position: relative`, an `Image fill` background, overlay, SVG lines, and stat animations. The right panel is `lg:w-3/5` with a flex column and centered children. Mobile collapses the left panel entirely and shows a top bar with the brand logo.

Live validation is uniformly implemented across all five pages. Each field's `onChange` handler calls `setField` on the hook then immediately runs `safeParse` on the field's own Zod schema shape and writes the result into `liveErrors`. The displayed error is `liveErrors[field] || fieldErrors[field]`, so server-side errors surface only when there is no live error overriding them.

The `button.tsx` primary variant uses `text-[#151A14]` — dark text on lime-green background — satisfying the WCAG contrast requirement. The `text-white` instances in the layout are on the left decorative panel over a dark-green overlay (`bg-[#0D1F0B]/75`), which is correct.

`globals.css` was changed to swap the primary color from dark forest green to lime green, exactly as the user requested in the original task. `useAuth.ts` was not touched — `git diff` against `origin/main` returns empty for that file.

The PasswordStrength component exists at the required path (`components/ui/passwordStrength.tsx`) and is imported by both signUp and resetPassword. It renders a 3-segment bar and a label, returning `null` when the password is empty so it doesn't render on an untouched field.

---

<details>
<summary>Issues (1)</summary>

1. **globals.css "unchanged" checklist item** — The checklist flags globals.css as a file that "must be unchanged," but the user's original instruction was specifically to change the primary color in globals.css. The diff is exactly that change: lime green activated, dark green commented out, bright-lime comment added. This is correct behavior, not a defect. No action needed.

</details>

<details>
<summary>Details</summary>

### Live validation wiring — all five pages

Every field in every page validates on keystroke:

- **signIn**: `phoneNumber` and `password` call `safeParse` against `PhoneSignInSchema.shape.<field>` and write to `liveErrors`.
- **signUp**: `name`, `phoneNumber`, `password` all validated. Password additionally renders `<PasswordStrength>` below the input.
- **verifyOtp**: The 6 OTP digit inputs go through `useOtpVerification`'s `setDigit` hook, which manages the digit array and completion detection internally. No separate `safeParse` layer is needed.
- **forgotPassword**: `phoneNumber` validated against `PasswordResetRequestSchema.shape.phoneNumber`.
- **resetPassword**: `phoneNumber`, `code` (inline regex: 6-digit numeric), `newPassword`, and `confirmPassword` all live-validated. The `newPassword` handler also synchronously re-evaluates `confirmPassword` when the password field changes, so the mismatch error appears before the user touches the confirm field.

### OTP input divergence from shared Input component

The verifyOtp page uses raw `<input>` elements instead of the shared `<Input>` component. The documented reasons: `setInputRef(el, idx)` needs a direct `HTMLInputElement` ref, OTP boxes need a square-aspect flex layout that the `<Input>` wrapper's `w-full` outer div prevents, and no label/error/hint slots are needed per cell. Token usage (border-primary, bg-primary-light) mirrors the shared component so theme changes propagate.

</details>

---

<details>
<summary>File map</summary>

| File | Change |
|---|---|
| `apps/web/app/(auth)/layout.tsx` | New split-layout shell with left agricultural panel, rotating stats, mobile top bar |
| `apps/web/app/(auth)/signIn/page.tsx` | Redesigned with live validation and weather widget |
| `apps/web/app/(auth)/signUp/page.tsx` | Redesigned with 3-step progress indicator, live validation, PasswordStrength |
| `apps/web/app/(auth)/verifyOtp/page.tsx` | Redesigned with SVG arc countdown timer, phone SVG, security strip |
| `apps/web/app/(auth)/forgotPassword/page.tsx` | Redesigned with lock icon, OTP expiry security strip, live validation |
| `apps/web/app/(auth)/resetPassword/page.tsx` | Redesigned with live cross-field validation, PasswordStrength, framer-motion success state |
| `apps/web/app/globals.css` | Primary color swapped from dark forest green to lime green (#6EE22A); original values commented out |
| `apps/web/components/ui/button.tsx` | Primary variant updated to `text-[#151A14]` (dark text on lime-green bg) |
| `apps/web/components/ui/input.tsx` | Added `success` prop; border turns success-green when field is valid |
| `apps/web/components/ui/passwordStrength.tsx` | New component: 3-segment bar + label for password complexity feedback |

Full diff: `git diff 43e4d7c HEAD`

</details>
