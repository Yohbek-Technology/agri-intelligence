# Implementation Plan — Auth Username Feature

**Repo root:** `/home/yohannes/repo/agri-intelligence`
**Build commands:** `pnpm build` (turbo) | per-package: `pnpm build` via `tsc`
**Test commands:** `cd apps/server && pnpm test` (vitest) | web: `cd apps/web && next build`
**Package manager:** `pnpm@12.9.1`

---

- [ ] 1. Replace BrandLogo SVG with `next/image`
      Remove the inline SVG mark, all text `<span>` children (the "AgriIntel" text, the ETHIOPIA pill, and the subtitle span). Swap in a `next/image` element pointing to `/images/logo.png` using the size-specific `width`/`height` map below. Keep the `<Link>` wrapper and all existing props (`size`, `showSubtitle`, `linkHref`, `className`, `inverted`) as API stubs — the component still accepts them and passes `className` to the wrapper, but the rendered output is just the image. No text nodes remain inside the component body.
      Size map: `sm` → 112×40, `md` → 144×48, `lg` → 176×56. Use `objectFit="contain"` on the Image.
      Files: `apps/web/components/ui/brandLogo.tsx`
      Verify: `cd apps/web && next build` — exits 0. No TypeScript errors for unused props.

- [ ] 2. Fix auth layout scroll, update tagline and stats
      Depends on: nothing (standalone layout change).
      Three layout changes in one pass:
      1. Outer wrapper `<div className="flex min-h-screen">` → `<div className="flex h-screen overflow-hidden">`.
      2. Left panel `<div className="hidden lg:flex lg:w-2/5 relative overflow-hidden">` → add `h-screen sticky top-0` to its className.
      3. Right panel `<div className="w-full lg:w-3/5 flex flex-col min-h-screen ...">` → change to `h-screen overflow-y-auto flex flex-col` (remove `min-h-screen`).
      Update the tagline string `'Adama Agricultural Zone — Ethiopia'` → `'National Agricultural Management System'`.
      Replace the `STATS` constant with:
      ```ts
      const STATS = [
        { icon: '👨‍🌾', value: '12,400+', label: 'Farmers Enrolled' },
        { icon: '🎯', value: '98.4%', label: 'Precision Rate' },
        { icon: '🌾', value: '34.2 Qt/Ha', label: 'Avg Yield Gain' },
      ]
      ```
      Files: `apps/web/app/(auth)/layout.tsx`
      Verify: `cd apps/web && next build` — exits 0.

- [ ] 3. Update SignIn page weather widget label
      Depends on: nothing.
      Change the label text inside the field conditions widget from `'Adama Region'` to `'Field Advisory'`. This is the `<span>` with classes `text-xs font-mono font-bold text-text-muted uppercase tracking-wider` inside the widget `<div>`.
      Files: `apps/web/app/(auth)/signIn/page.tsx`
      Verify: `cd apps/web && next build` — exits 0.

- [ ] 4. Extend shared validators with username schemas
      Depends on: nothing.
      Four changes to `auth.ts`, one change to `index.ts`:

      a. **`PhoneSignUpSchema`** — add `username` field after `preferredLanguage`:
         ```ts
         username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_]+$/, 'Only letters, numbers, and underscores allowed'),
         ```

      b. **`PhoneOtpVerifySchema`** — add optional `username` field:
         ```ts
         username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_]+$/).optional(),
         ```

      c. **New `UsernameSignInSchema`** — add after `PhoneOtpVerifySchema`:
         ```ts
         export const UsernameSignInSchema = z.object({
           username: z.string().min(3, 'Username must be at least 3 characters').max(30).regex(/^[a-zA-Z0-9_]+$/, 'Only letters, numbers, and underscores allowed'),
           password: z.string().min(1, 'Password is required'),
         })
         ```

      d. **Export type** at the bottom of `auth.ts`:
         ```ts
         export type UsernameSignIn = z.infer<typeof UsernameSignInSchema>
         ```
         Also export types for the updated schemas as needed — `PhoneSignUp` and `PhoneOtpVerify` are already exported via the types file; because username is an added field, the inferred type in `@repo/shared/src/types/auth.ts` (if `PhoneSignUp` / `PhoneOtpVerify` are defined there as manual types rather than `z.infer`) must be updated to include `username?: string`. Check `packages/shared/src/types/auth.ts` first: if those types are defined manually, add `username?: string`; if they are `z.infer<typeof ...>` they update automatically.

      e. **`packages/shared/src/index.ts`** — add to the schema export block:
         ```ts
         UsernameSignInSchema,
         ```
         And to the type export block:
         ```ts
         UsernameSignIn,
         ```

      Files: `packages/shared/src/validators/auth.ts`, `packages/shared/src/index.ts`, (conditionally) `packages/shared/src/types/auth.ts`
      Verify: `cd packages/shared && pnpm build` — exits 0.

- [ ] 5. Add `username` plugin and field to server auth config
      Depends on: item 4 (UsernameSignInSchema must exist in shared before server can rely on username logic), item 6 (DB column must exist before the plugin stores data — but since migrations run separately, the config change itself can be applied before the migration in code; note that the server will only work at runtime after the migration is applied).
      Three changes to `apps/server/src/config/auth.ts`:

      a. **Import** — add `username` to the `better-auth/plugins` import:
         ```ts
         import { phoneNumber, openAPI, username } from 'better-auth/plugins'
         ```

      b. **Plugin registration** — add to the `plugins` array after `openAPI()`:
         ```ts
         username({
           displayUsername: false,
           minUsernameLength: 3,
           maxUsernameLength: 30,
         }),
         ```

      c. **`user.additionalFields`** — add after the existing `deletedAt` entry:
         ```ts
         username: {
           type: 'string',
           required: false,
           unique: true,
           fieldName: 'username',
         },
         ```

      d. **`callbackOnVerification`** — after the `preferredLanguage` block, add:
         ```ts
         if (ctx?.body?.username) {
           await ctx.context.internalAdapter.updateUser(user.id, {
             username: String(ctx.body.username).trim().toLowerCase(),
           })
         }
         ```

      Files: `apps/server/src/config/auth.ts`
      Verify: `cd apps/server && pnpm build` — exits 0 (TypeScript compilation succeeds).

- [ ] 6. Add `username` column to DB schema (Drizzle source)
      Depends on: nothing (schema change is independent; migration step handles DB).
      In `apps/server/src/db/schemas/auth-schema.ts`, in the `users` pgTable column object, add after the `name` column:
      ```ts
      username: varchar('username', { length: 50 }).unique(),
      ```
      Files: `apps/server/src/db/schemas/auth-schema.ts`
      Verify: `cd apps/server && pnpm build` — exits 0.

- [ ] 7. Create Drizzle migration for username column
      Depends on: item 6 (migration reflects the schema change made there).
      Create the directory and two files:

      **Directory:** `apps/server/drizzle/20261013120000_add_username/`

      **`migration.sql`:**
      ```sql
      ALTER TABLE "users" ADD COLUMN "username" varchar(50);--> statement-breakpoint
      ALTER TABLE "users" ADD CONSTRAINT "users_username_key" UNIQUE("username");
      ```

      **`snapshot.json`:**
      Copy `apps/server/drizzle/20261011211623_dear_radioactive_man/snapshot.json` verbatim, then apply these changes:
      - Generate a new UUID for the top-level `"id"` field (use any valid UUID v4, e.g. `"a1b2c3d4-e5f6-7890-abcd-ef1234567890"`).
      - Set `"prevIds"` to `["ca9cd0a1-eae3-4cff-824b-5ee57a11e9f6"]` (the id of the previous snapshot).
      - Append to the `"ddl"` array the following two entries:
        ```json
        {
          "type": "varchar(50)",
          "typeSchema": null,
          "notNull": false,
          "dimensions": 0,
          "default": null,
          "generated": null,
          "identity": null,
          "name": "username",
          "entityType": "columns",
          "schema": "public",
          "table": "users"
        },
        {
          "nameExplicit": false,
          "columns": ["username"],
          "nullsNotDistinct": false,
          "name": "users_username_key",
          "schema": "public",
          "table": "users",
          "entityType": "uniques"
        }
        ```

      Files: `apps/server/drizzle/20261013120000_add_username/migration.sql`, `apps/server/drizzle/20261013120000_add_username/snapshot.json`
      Verify: `cd apps/server && pnpm build` — exits 0. Inspect the generated snapshot JSON to confirm both new DDL entries are present.

- [ ] 8. Add `usernameClient` plugin to web auth client
      Depends on: item 5 (server must expose the username plugin endpoint; client mirrors it).
      In `apps/web/lib/authClient.ts`:
      - Add import: `import { phoneNumberClient, usernameClient } from 'better-auth/client/plugins'`
        (replace the existing single-import line for `phoneNumberClient`)
      - Add to the `plugins` array:
        ```ts
        usernameClient({ displayUsername: false }),
        ```
      Files: `apps/web/lib/authClient.ts`
      Verify: `cd apps/web && next build` — exits 0.

- [ ] 9. Add `signInWithUsername` to authService and pass username through OTP verify
      Depends on: item 4 (needs `UsernameSignInSchema` and `UsernameSignIn` type from `@repo/shared`), item 8 (needs `authClient.signIn.username`).
      Two changes to `apps/web/services/authService.ts`:

      a. **Import** — add `UsernameSignInSchema` and `type UsernameSignIn` to the `@repo/shared` import block.

      b. **New method** — add `signInWithUsername` after `signIn`:
         ```ts
         async signInWithUsername(input: UsernameSignIn): Promise<ServiceResult> {
           const parseResult = UsernameSignInSchema.safeParse(input)
           if (!parseResult.success) {
             return { success: false, error: parseResult.error.issues[0]?.message }
           }
           try {
             const res = await authClient.signIn.username({
               username: parseResult.data.username,
               password: parseResult.data.password,
             })
             if (res.error) {
               return { success: false, error: mapAuthError(res.error) }
             }
             return { success: true, data: res.data }
           } catch (err) {
             return { success: false, error: mapAuthError(err) }
           }
         },
         ```

      c. **`verifyOtpAndSignUp`** — inside the method, in the `verifyPayload` object construction, add:
         ```ts
         username: parseResult.data.username,
         ```
         after `preferredLanguage`. The `as unknown as Parameters<...>[0]` cast already handles the extra field.

      Files: `apps/web/services/authService.ts`
      Verify: `cd apps/web && next build` — exits 0.

- [ ] 10. Update `useSignInForm` and `useSignUpForm` hooks
       Depends on: item 4 (needs `UsernameSignInSchema`, `UsernameSignIn` type), item 9 (needs `authService.signInWithUsername`).
       All changes in `apps/web/hooks/useAuth.ts`:

       **`useSignInForm`:**
       - Replace the import of `PhoneSignInSchema` and `type PhoneSignIn` with `UsernameSignInSchema` and `type UsernameSignIn` (keep remaining imports unchanged).
       - Change `useState<PhoneSignIn>({ phoneNumber: '', password: '' })` to `useState<UsernameSignIn>({ username: '', password: '' })`.
       - Change `setField` type parameter from `keyof PhoneSignIn` to `keyof UsernameSignIn` (two occurrences in the callback signature and the `fieldErrors` state type).
       - In `handleSubmit`, replace `PhoneSignInSchema.safeParse(formData)` with `UsernameSignInSchema.safeParse(formData)`.
       - Replace `authService.signIn(parseResult.data)` with `authService.signInWithUsername(parseResult.data)`.
       - Remove the `PhoneSignInSchema` import entirely if it is no longer used elsewhere in the file (check: `useResendCountdown` uses `PhoneOtpRequestSchema`, not `PhoneSignInSchema`, so it can be safely removed from the import). Keep all other schema imports.

       **`useSignUpForm`:**
       - Add `username: ''` to the initial `PhoneSignUp` formData state. Note: `PhoneSignUp` now includes `username` as a required field (per item 4); the type will need `username: string`. The `setField` type `keyof PhoneSignUp` will automatically include `username`.
       - In `handleSubmit`, inside the `if (typeof window !== 'undefined')` block where `sessionStorage.setItem` is called, the `parseResult.data` already includes `username` since `PhoneSignUpSchema` now contains it — no extra change needed here.
       - Pass `username: parseResult.data.username` through to `authService.verifyOtpAndSignUp` — this is already handled via `sessionStorage` in `useOtpVerification`, but note that `useOtpVerification` builds its `payload` from `registrationDraft`. Since the draft is stored as `parseResult.data` (which now includes `username`), the draft's `username` field is already available. In `useOtpVerification`'s `handleVerify`, extend the `payload` object to include `username: registrationDraft?.username || ''` and add it to the `PhoneOtpVerify` type call. (This is a small follow-on in the same hook file — include it in this item.)

       Files: `apps/web/hooks/useAuth.ts`
       Verify: `cd apps/web && next build` — exits 0.

- [ ] 11. Replace phone field with username field on SignIn page
       Depends on: item 4 (needs `UsernameSignInSchema`), item 10 (hook now uses `username` field).
       In `apps/web/app/(auth)/signIn/page.tsx`:
       - Replace `import { PhoneSignInSchema } from '@repo/shared'` with `import { UsernameSignInSchema } from '@repo/shared'`.
       - Rename `onPhoneChange` to `onUsernameChange`. Change its body to validate against `UsernameSignInSchema.shape.username.safeParse(v)` and call `setField('username', v)`. Update the live error key from `phoneNumber` to `username`.
       - Replace the Phone Number `<Input>` with:
         ```tsx
         <Input
           label="Username"
           type="text"
           placeholder="your_username"
           value={formData.username}
           onChange={(e) => onUsernameChange(e.target.value)}
           error={liveErrors.username || fieldErrors.username}
           success={!!(formData.username && !liveErrors.username && !fieldErrors.username)}
           disabled={isLoading || isLockedOut}
           hint={!liveErrors.username && !fieldErrors.username ? 'Letters, numbers, and underscores only' : undefined}
         />
         ```
       - Remove the `onPasswordChange` live validation since `PhoneSignInSchema.shape.password` was its validator — replace with `UsernameSignInSchema.shape.password.safeParse(v)` to keep live password feedback working.

       Files: `apps/web/app/(auth)/signIn/page.tsx`
       Verify: `cd apps/web && next build` — exits 0.

- [ ] 12. Add username field to SignUp page with availability check
       Depends on: item 4 (needs `PhoneSignUpSchema.shape.username`), item 8 (needs `authClient.username.checkUsernameAvailability`).
       All changes in `apps/web/app/(auth)/signUp/page.tsx`:

       a. **Local state** — add inside the component body (after the existing `liveErrors` state):
          ```ts
          const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null)
          const [usernameChecking, setUsernameChecking] = useState(false)
          const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
          ```
          Add `useRef` to the React import.

       b. **Handler** — add `onUsernameChange`:
          ```ts
          const onUsernameChange = (v: string) => {
            setField('username', v)
            setUsernameAvailable(null)
            const r = PhoneSignUpSchema.shape.username.safeParse(v)
            setLiveErrors((p) => ({ ...p, username: r.success ? '' : (r.error.issues[0]?.message ?? '') }))

            if (debounceRef.current) clearTimeout(debounceRef.current)
            if (!r.success || !v) return

            debounceRef.current = setTimeout(async () => {
              setUsernameChecking(true)
              try {
                const res = await authClient.username.checkUsernameAvailability({ username: v })
                setUsernameAvailable(res?.data?.available ?? false)
              } catch {
                setUsernameAvailable(null)
              } finally {
                setUsernameChecking(false)
              }
            }, 400)
          }
          ```

       c. **Input field** — add a username `<Input>` between the Full Name field and the Phone Number field:
          ```tsx
          <Input
            label="Username"
            type="text"
            placeholder="your_username"
            value={formData.username}
            onChange={(e) => onUsernameChange(e.target.value)}
            error={liveErrors.username || fieldErrors.username || (usernameAvailable === false ? '✗ Username already taken' : '')}
            success={usernameAvailable === true}
            disabled={isLoading}
            hint={
              usernameChecking
                ? 'Checking...'
                : usernameAvailable === true
                ? '✓ Available'
                : undefined
            }
          />
          ```

       Files: `apps/web/app/(auth)/signUp/page.tsx`
       Verify: `cd apps/web && next build` — exits 0.

- [ ] 13. Full build verification across all packages
       Depends on: all previous items.
       Run builds in dependency order:
       1. `cd packages/shared && pnpm build` — must exit 0.
       2. `cd apps/server && pnpm build` — must exit 0.
       3. `cd apps/web && next build` — must exit 0.
       Alternatively from repo root: `pnpm build` (turbo handles the order via package.json `dependencies` declarations).
       Files: none (verification only).
       Verify: all three commands exit 0 with no TypeScript errors.
