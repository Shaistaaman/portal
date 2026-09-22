# Context & Instructions — Skylife Portal + Serverless Backend

**Audience:** a coding agent picking up this project to build the backend and continue the portal frontend.
**Goal:** stand up a serverless backend (AWS SAM) — API Gateway + Lambda + Cognito + RDS PostgreSQL + EventBridge + SQS + SNS + SES, fronted by CloudFront — and finish wiring the portal SPA to it.

Read this whole file before writing code. It tells you what already exists, what does **not**, the traps specific to this codebase, and the order to build in.

**This backend is shared with `marketing/`.** `marketing/Context_Instruction.md` is the sibling document for the public marketing site and already specifies the same `backend/` SAM app in detail (data model, Lambda functions, booking-approval flow, build order). Read that file too — do not design a second, competing backend for the portal. The portal is a second frontend consumer of the same API, adding the authenticated, role-gated surfaces that the public marketing site does not need (admin review/approval, owner property + financial views, agent booking-on-behalf-of, client account/bookings).

---

## 0. Toolchain & versions (frontend, verified from `package.json` + lockfile)

Identical baseline to `marketing/` — match the backend to these so all three (marketing, portal, backend) share one Node/TS baseline.

| Tool                     | Version in use                                                                | Notes                                                                                                                                                                                                                                                               |
| ------------------------ | ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Node.js**              | **22 LTS** (`.nvmrc` = `22`; `engines.node` = `>=20.19.0`)                    | Run `nvm use` in `portal/`. Target the **`nodejs22.x`** Lambda runtime in the backend.                                                                                                                                                                              |
| **npm**                  | 10.x                                                                          | Ships with Node 22. `portal/` uses npm, not pnpm — it is intentionally **outside** the root pnpm workspace (see §1).                                                                                                                                                |
| **React**                | **19.3.0**                                                                    | `react` + `react-dom`.                                                                                                                                                                                                                                              |
| **react-router-dom**     | **7.18.4**                                                                    | Routes rank by specificity, not declaration order.                                                                                                                                                                                                                  |
| **Vite**                 | **8.3.0**                                                                     | Build tool; outputs static `dist/`.                                                                                                                                                                                                                                 |
| **TypeScript**           | **6.0.3**                                                                     | `strict` **and** `noUncheckedIndexedAccess` are on — array/record access is `T \| undefined`. Keep both on in the backend.                                                                                                                                          |
| **Tailwind CSS**         | **4.3.3**                                                                     | Config-less (`@tailwindcss/vite`); theme in `src/index.css`.                                                                                                                                                                                                        |
| **motion**               | **13.4.0**                                                                    | Imported as `motion/react`.                                                                                                                                                                                                                                         |
| **lucide-react**         | **1.47.0**                                                                    | UI icons.                                                                                                                                                                                                                                                           |
| **react-icons**          | **5.7.0**                                                                     | Brand/social marks.                                                                                                                                                                                                                                                 |
| **@vitejs/plugin-react** | **6.1.1**                                                                     |                                                                                                                                                                                                                                                                     |
| **ESLint**               | **10.11.0**                                                                   | Flat config; `react-refresh/only-export-components` is enforced — never mix a component export and a non-component export (e.g. a context object) in the same file. See `src/auth/auth-context.ts` vs `src/auth/AuthContext.tsx` for the pattern already used here. |
| **AWS SAM CLI**          | Match whatever is pinned in `marketing/Context_Instruction.md` at build time. |

> Versions above are what is **currently resolved** in `node_modules`. If you upgrade, re-verify with `npm ls <pkg>` and update this table — do not guess.

---

## 1. Where you are

```
skylife/
├── portal/              ← THIS folder. React SPA (Vite). Role-gated app. In progress.
├── marketing/           ← Public marketing SPA (Vite). Its own Context_Instruction.md.
├── apps/portal/         ← Original Next.js version. Reference only. Do not build on it.
├── apps/marketing/      ← Original Next.js version of marketing. Reference only.
├── apps/*, packages/*   ← pnpm workspace (turborepo). Neither portal/ nor marketing/ is a member —
│                          both are standalone npm projects with their own package-lock.json and,
│                          in marketing's case, their own git history. Keep it that way; do not
│                          add portal/ to pnpm-workspace.yaml.
└── backend/             ← NOT YET CREATED. The SAM app both SPAs will call. See §7.
```

### Why `apps/portal` (Next.js) was abandoned in favor of this folder

`apps/portal` is a working Next.js 16 / React 19 app with real login/signup, an admin section (dashboard, user-management, properties, experiences — all real; packages/calendar/financial/messages/settings/reviews are "coming soon" stubs), and an owner properties view sharing a `PropertyList` component from `packages/ui`. It was **not broken** — the decision to rebuild as a plain Vite React SPA here in `portal/` was made explicitly by the project owner to get a pure client-side SPA that talks to API Gateway/Lambda directly, matching the `marketing/` app's architecture, rather than using Next.js server features. If you are asked to "finish the portal," build here — do not resume `apps/portal`.

### Current state of the portal frontend — verified facts

- **Zero network calls**, same as marketing at this stage. No `fetch`, no `import.meta.env` usage yet. Auth is fully mocked in `src/auth/AuthContext.tsx` — `login`/`signup`/`loginAsDemo` accept anything and return a hardcoded `DEMO_ADMIN` user shaped to the role passed in, state resets on every page refresh (no persistence), and the app currently boots pre-authenticated as `DEMO_ADMIN` if nothing has cleared context. **This must be replaced with real Cognito auth before any of this is production-usable** — see §6 and the `TODO(AWS integration)` comments already left in the source (`src/auth/AuthContext.tsx`, `src/pages/auth/StaffLoginPage.tsx`, `src/pages/auth/LoginPage.tsx`, `src/routes/RoleRoute.tsx`).
- **Dev login credentials** (any password works today since auth is mocked, but these are pre-filled on each role's login form): `martina@skylifemanagement.com` (admin), `agent.demo@skylifemanagement.com` (agent), `owner.demo@skylifemanagement.com` (owner), `client.demo@skylifemanagement.com` (client), all with password `password123`. Defined in `src/pages/auth/StaffLoginPage.tsx`'s `DEV_CREDENTIALS` map.
- **What exists today (verified by reading the files, not assumed):**
  - `src/App.tsx` — route table. Public: `/login`, `/signup` (client-facing, reached from marketing CTAs). Staff: `/admin/login`, `/agent/login`, `/owner/login` (each its own route, no role picker). `/admin` is a full `RoleRoute`-gated layout route nested under `AdminLayout` (see below) with real child routes for dashboard and user-management, and `PlaceholderPage` stubs for properties/experiences/packages/calendar/financial/settings. `/agent/*`, `/owner/*`, `/client/*` still render a single `PlaceholderPage` each — **no real dashboards exist yet for those three roles.**
  - `src/routes/RoleRoute.tsx` — the access-control gate. Checks `useAuth().user.role` against an `allow` list; redirects to the matching role's login route if there's no session or the role doesn't match. This is a client-side UX convenience only — **it is not a security boundary**. Real authorization must be re-checked server-side (API Gateway JWT authorizer + Lambda re-verifying the Cognito group claim) on every protected request, because anyone can bypass client-side JS.
  - `src/auth/` — `auth-context.ts` (the `createContext` call + `AuthContextValue` type + demo `DEMO_ADMIN` fixture, kept in its own file specifically to satisfy `react-refresh/only-export-components`), `AuthContext.tsx` (the `AuthProvider` component, demo-only logic — `login(email, password, role)` takes the login surface's fixed role as a third param, since the mock previously always returned `admin` regardless of caller, which silently broke non-admin dev logins), `useAuth.ts` (the consumer hook).
  - `src/features/auth/LoginForm.tsx` — the shared login form UI (email/password fields, submit button, optional `footer` slot). Takes a `role` prop purely for `id` namespacing and has **no role picker** — role is fixed by which page renders it.
  - `src/pages/auth/StaffLoginPage.tsx` — shared page shell for admin/agent/owner login, parameterized by a `role` prop; `AdminLoginPage.tsx` / `AgentLoginPage.tsx` / `OwnerLoginPage.tsx` are one-line wrappers around it. All four login surfaces (including client) now share the identical heading "Login to the Premium Traveler Experience."
  - `src/pages/auth/LoginPage.tsx` / `SignupPage.tsx` — the client-facing pair. `LoginPage` reads a `?redirect=` query param (defaults to `/client/dashboard`) — this is intentionally an **intent carrier for post-login destination**, e.g. `?redirect=/client/bookings/new`, never a role/identity carrier. Do not repurpose it to pass role.
  - `src/components/layout/PublicHeader.tsx` + `LanguageSelector.tsx` + `NavLinks.tsx` — the dual dark/light navbar with hamburger drawer, ported near-verbatim from `apps/portal/app/components/PublicHeader.tsx` (Next `Image`/`Link` swapped for `<img>`/react-router `Link`). `NavLinks` points at `/Collections`, `/Experiences`, `/Owner`, `/Packages` via `window.location.assign` — **these are marketing-site routes, not portal routes.** They currently 404 from the portal. Fix by pointing them at the deployed marketing domain once known (see the `TODO` comment in `NavLinks.tsx`); do not build these as portal-internal routes.
  - `src/layouts/AdminLayout.tsx` — the admin shell: collapsible sidebar (nav highlighted via `useLocation`), header (page title, language selector, notifications/profile/mobile-menu popovers), wraps all `/admin/*` children via `<Outlet/>`. Ported from `apps/portal/app/admin/layout.tsx`.
  - `src/components/layout/admin/` — `MobileMenu.tsx`, `NotificationPopup.tsx` (hardcoded notification list), `ProfileMenu.tsx` (reads the live session user from `useAuth()`, unlike the Next.js reference which hardcoded the name/avatar even though `AuthContext` already had a matching fixture), `admin-nav.ts` (the shared nav item list, admin-only — do not reuse for owner/agent chrome, which will need their own nav item lists once those layouts are built).
  - `src/pages/admin/DashboardPage.tsx` — KPI cards (dummy counts) + 4 CTA buttons (only "Add New User" is wired). Ported from `apps/portal/app/admin/dashboard/page.tsx`.
  - `src/features/user-management/` — `types.ts` (`ManagedUser`, `UserFormValues` — distinct from `types/auth.ts`'s `User`, which models the _current session's_ identity, not an arbitrary managed record), `mockUsers.ts` (one shared 10-record dataset — the Next.js reference had two separate, unsynced inline mock arrays across its list and edit pages; unified here), `UserForm.tsx` (shared add/edit form: role toggle, base fields, agent-only agency section with file-upload previews and an OpenStreetMap iframe, validation).
  - `src/pages/admin/user-management/` — `UserListPage.tsx` (table, role/status filters, per-row action menu, pagination, a `ConfirmModal`-driven activate/deactivate flow that actually mutates local state — the Next.js reference only `console.log`'d this), `AddUserPage.tsx`, `EditUserPage.tsx` (reads `:id` as a path param, not the reference's `?id=` query string).
  - `src/components/ui/` — `ConfirmModal.tsx` (generic centered confirm dialog) and `badges.tsx` (`RoleBadge`, `StatusBadge`) — both extracted as reusable primitives while building User Management; use them for Properties' status badges and status-change confirmation too rather than re-inlining the same patterns.
  - `src/hooks/useClickOutside.ts` — replaces the Next.js reference's hand-rolled `fixed inset-0` click-catcher overlay (duplicated twice in its user-management list page) with one reusable hook. Use this for any future dropdown/menu, including Properties' action menu.
  - `src/pages/PlaceholderPage.tsx` — temporary stand-in for pages not yet built. Takes a `fullScreen` prop: `true` for standalone role-dashboard placeholders (agent/owner/client today), `false` (default) when nested inside a layout's `<main>` (the admin stub sub-pages). Replace one at a time as real pages are built.
  - `src/types/auth.ts` — `UserRole = "admin" | "agent" | "client" | "owner"`, `User` (session identity), `SignupInput`, `AuthResult`.
- **No component library sharing with `marketing/` or `apps/portal`'s `@skylife/ui` package.** `portal/` is fully standalone; if UI needs to be shared between portal and marketing later, that is a deliberate decision to make explicitly, not something to assume.

**Do not build dashboards, property/calendar/booking UI, or any business feature before reading `marketing/Context_Instruction.md`'s data model (§4) and business rules (§2).** The portal's admin/owner/agent/client screens are views onto the _same_ `properties`, `bookings`, `booking_requests`, `enquiries` tables the marketing site writes to — inventing a parallel schema here would fork the system of record.

---

## 2. Business rules specific to the portal (in addition to marketing's §2)

These are on top of, not a replacement for, `marketing/Context_Instruction.md` §2 (request-to-book model, two property sources, iCal sync, double-booking prevention, the four roles). Portal-specific rules gathered from product discussion so far:

1. **Roles map 1:1 to Cognito groups**, exactly as marketing's doc states: `admin`, `owner`, `agent`, `client`. The portal is where all four **authenticate** and reach their **respective dashboard**; the marketing site only ever authenticates `client` (via a booking/experience/package CTA) and links to `portal/login`.
2. **Role is never client-selectable.** The current `StaffLoginPage`/`LoginForm` deliberately has no role picker. Whatever determines which dashboard a user lands on and what they can do comes from the Cognito group claim in their verified session token — never a query param, never a UI button, never anything the browser can edit. (An earlier iteration of this app had exactly such a role-picker button for dev convenience; it has been removed from the real login/signup flows and must not be reintroduced.)
3. **Staff surfaces are reached directly, not chosen.** In production, `admin`/`agent`/`owner` each get their own entry point — either a path (`/admin/login`, `/agent/login`, `/owner/login`, all of which already exist in `src/App.tsx`) or a subdomain (`admin.skylifemanagement.com`, etc.) at the infrastructure layer (CloudFront alternate domain names / Route 53), while the SPA itself stays path-based internally (see the routing decision recorded in this project's session history — do not attempt subdomain-aware routing inside React Router; solve it at CloudFront/DNS if/when subdomains are wanted). Path-based in production is the currently recommended default; revisit subdomains only once the app is stable.
4. **Client only ever arrives via a marketing CTA**, never a portal-side signup button aimed at staff roles. `?redirect=` on `/login` and `/signup` carries where to send the client after auth completes (e.g. back into a booking flow) — it is intent, not identity, per §1 above.
5. **UI sharing across roles, by feature (carried over from the `apps/portal`-era decision, still valid here):**
   - **Shared across 2+ roles** (property list/detail, calendar): build once, parameterize by a `role` prop, gate role-specific sub-elements (buttons, approval boxes, columns) with conditionals inside that one component. Put these in `src/features/<domain>/` (e.g. `src/features/properties/PropertyList.tsx`), following the pattern already established by `src/features/auth/LoginForm.tsx`.
   - **Exclusive to one role** (e.g. admin-only experience/package CRUD): keep local to that role's page tree, e.g. `src/pages/admin/experiences/` or a role-scoped module folder — do not hoist into `features/` just because it feels reusable; only hoist once a second role actually needs it.
   - **Properties, finalized model** (supersedes an earlier draft of this rule that used `draft/pending/approved` terms never actually implemented anywhere): status enum is `in_review | active | in_inactive | rejected`. Admin and owner share one `PropertyList`/property-form component (95% identical UI), widened to a **third mode for agent** (view-only, `active`-only, no action menu — agent gets neither approve/reject nor activate/deactivate). Creating or editing a property (admin or owner) sets status to `in_review`; only admin can move `in_review → active` (approve) or `in_review → rejected` (reject, reason required); admin **and** owner can freely toggle `active ↔ in_inactive` without triggering re-review; owner can edit a `rejected` property to resubmit it (→ `in_review`). See `Project_Specification.md` §4 for the full lifecycle diagram — that file is the source of truth for this flow, kept in sync with whatever is actually implemented here. This maps onto marketing's `properties`/`booking_requests`-adjacent tables — check `marketing/Context_Instruction.md` §4 before adding new columns/tables for this, and reconcile the status enum there with this one (marketing's §4 currently doesn't specify a `properties.status` enum at all — this file is currently the more concrete source for that column until unified).

---

## 3. Target architecture

The backend is one SAM app serving both `marketing/` (public, mostly unauthenticated) and `portal/` (this app, always authenticated except the login/signup pages themselves). See `marketing/mermaid_dig.mmd` for the original diagram and `portal/mermaid_dig.mmd` (next to this file) for the portal-focused view emphasizing Cognito groups and role-gated routes.

### Component responsibilities (portal-relevant additions to marketing's §3 table)

| Component                  | Portal-specific role                                                                                                                                                                                                                                                                                      |
| -------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **CloudFront + WAF**       | Second distribution (or additional behavior on the same one) serving `portal/dist/`. If staff subdomains are ever added, they become alternate domain names on this distribution, all pointing at the same build.                                                                                         |
| **API Gateway (HTTP API)** | Same `/v1/*` API as marketing. Portal-only routes are simply the ones with a JWT authorizer scoped to `admin`/`owner`/`agent` groups (property/experience/package CRUD, approvals, financials) plus `client`-scoped routes (own bookings, own profile) that marketing's anonymous flows don't need.       |
| **Cognito User Pool**      | The **same** user pool as marketing. Portal is where all four roles actually sign in; marketing only triggers Cognito for `client` signup/login via its own CTAs which then land on `portal/login`.                                                                                                       |
| **Lambda (SAM)**           | `admin-fn` (from marketing's function table) is portal's primary backend — property/experience/package CRUD, approvals. Add portal-only functions as needed for owner financial views, agent booking-on-behalf-of, once those screens are built. Do not duplicate `search-fn`/`requests-fn` — reuse them. |

---

## 4. Data model

**Use `marketing/Context_Instruction.md` §4 as-is.** Do not create a second `properties`, `bookings`, `booking_requests`, or `users` table for the portal. The portal is the authenticated read/write surface for admin/owner/agent over the same rows the public site's `requests-fn` creates and `admin-fn` approves. If a portal feature needs a column or table that doesn't fit that schema (e.g. owner payout details, agent commission tracking), add it as a new table referencing `users`/`properties` by foreign key and record it in that file's §4, not here — keep the schema documentation in one place.

---

## 5. Booking approval and other admin actions

Same flow as marketing's §5 (transaction + `SELECT ... FOR UPDATE` + live re-check + exclusion-constraint backstop). The portal is simply **where the admin clicks "Approve"** — the UI trigger for `admin-fn`'s approval endpoint. Do not implement approval logic in the frontend beyond calling that endpoint and reflecting its response; the correctness guarantees live server-side.

---

## 6. Replacing the mocked auth (the first real backend-integration task for this app)

Concrete steps, in order, once Cognito exists (per marketing's build order §8, step 4):

1. Add `src/lib/aws/cognito.ts` — wraps sign-in, sign-up, sign-out, token refresh using the Cognito Identity Provider SDK or Amplify Auth (pick one; do not hand-roll SRP). Configuration (user pool ID, client ID, region) comes from Vite env vars (`import.meta.env.VITE_COGNITO_*`), never hardcoded.
2. Replace the body of `AuthProvider` in `src/auth/AuthContext.tsx`: `login`/`signup` call Cognito instead of returning `DEMO_ADMIN`; `user.role` is derived from the decoded ID token's group claim, not chosen anywhere in the frontend. Remove `loginAsDemo` entirely once real login works — it must not ship to production.
3. Session persistence: store tokens in memory + a refresh mechanism (silent refresh via Cognito's refresh token), or httpOnly Secure SameSite cookies if going through a BFF/API Gateway Lambda authorizer pattern. Do **not** put access/ID tokens in `localStorage` (XSS-exfiltratable) — decide this deliberately, it is not decided yet.
4. `RoleRoute` stays as the client-side UX gate (fast redirect, no flash of wrong content) but every protected API call must still be independently authorized server-side by the Lambda/API Gateway authorizer checking the same group claim. Treat `RoleRoute` as a convenience, never as the security control.
5. Wire the six-role-dashboard buildout (admin/agent/owner/client) behind this real auth, replacing `PlaceholderPage` usages one at a time.

---

## 7. SAM project layout

Identical to `marketing/Context_Instruction.md` §6 — one shared `backend/` folder at the repo root, not duplicated per frontend:

```
skylife/
├── marketing/
├── portal/              ← this app
└── backend/             ← SAM app serving both
```

Do not create a second `backend/`-like folder under `portal/`. If you are working from a context where only this file is visible, still place the SAM app at the repo root next to `marketing/` and `portal/`, exactly as specified in `marketing/Context_Instruction.md` §6.

---

## 8. Build order (portal-specific slice of marketing's §8)

Marketing's global build order (DB → public read path → enquiry writes → auth → iCal sync → booking approval → observability) applies to the whole system. From the portal's point of view specifically:

1. Steps 1–3 of marketing's order (DB, public read path, enquiry writes) do not require any portal work — the portal can stay on mocked auth/data while those land.
2. **Step 4 (Auth) is the portal's real starting gun.** Once Cognito + groups + JWT authorizer exist, do §6 above.
3. Admin dashboard and User Management are done (mocked data — see "Current state" above). Properties (shared admin/owner/agent, per §2 rule 5) is next. Then Experiences/Packages (admin-exclusive). Then owner/agent/client dashboards and layouts (there is no `OwnerLayout`/`AgentLayout`/`ClientLayout` yet — only `AdminLayout` exists; those three roles are still a single flat `PlaceholderPage` each in `App.tsx`, not even nested under a layout route). `apps/portal`'s Next.js version remains the reference to port markup/behavior from for any of these, the same way `LoginPage`/`PublicHeader`/`AdminLayout`/user-management were ported.
4. Calendar (shared owner/agent/admin) should be built as an `src/features/` component from the start, per §2 rule 5, once Properties establishes the pattern for a 3-role shared component.

---

## 9. Guardrails / do-nots (portal-specific, in addition to marketing's §9)

- **Do not** add a role picker back into any login or signup form. If a dev-mode convenience is truly needed, gate it behind `import.meta.env.DEV` and make it visually obvious it's a dev-only control, never ship it live.
- **Do not** treat `RoleRoute` as sufficient authorization. It prevents UI flash of the wrong dashboard; it does not prevent a network request to a protected endpoint.
- **Do not** add `portal/` to `pnpm-workspace.yaml` or otherwise fold it into the turborepo — it is intentionally standalone, matching `marketing/`.
- **Do not** resume or extend `apps/portal` (the Next.js version) — it is reference-only, same status as `apps/marketing`.
- **Do not** invent a second data model for portal features — extend marketing's schema (§4 there) with new tables/columns as needed, documented in that same file.
- **Do not** hardcode Cognito user pool IDs, client IDs, or API base URLs — use `VITE_`-prefixed env vars with a committed `.env.example`, same convention as marketing's §7.
- **Do not** store Cognito tokens in `localStorage` without deliberately deciding to (see §6.3) — this is a security decision, not a default.
- **Do not** build the `NavLinks` marketing routes (`/Collections`, `/Experiences`, `/Owner`, `/Packages`) as portal-internal pages — they belong to `marketing/` and should link out to it.

---

## 10. Verify before calling any step done

- `npm run build` and `npm run lint` both pass in `portal/` (this is the actual CI gate today — there is no test runner configured yet).
- Any new protected route is unreachable both via the UI (`RoleRoute` redirects) **and** via a direct API call from an unauthorized role/unauthenticated request (test with curl/Postman, not just by clicking around).
- If you touch `src/auth/`, confirm `react-refresh/only-export-components` still passes — keep context objects and provider components in separate files as already structured.
- Cross-check any new database column/table against `marketing/Context_Instruction.md` §4 to avoid schema drift between the two frontends.
- Update `portal/Project_Specification.md` and this file at the end of the day, per the project owner's stated workflow — these are living documents, not one-time output.
