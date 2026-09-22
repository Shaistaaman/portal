# Skylife — Project Specification

**Status:** living document, updated at the end of each working day.
**Scope:** what the two frontend applications are, who the four user roles are, and what each role is allowed to see and do.

---

## 1. The two applications

Skylife is one product split across two independently deployed frontends sharing one backend.

### `marketing/` — public marketing site

- Audience: **anonymous visitors** (prospective guests, prospective property owners).
- Purpose: showcase the property collection, curated experiences, and travel packages; let a visitor request a stay, request an experience, enquire about a package, apply as a property owner, request a valuation, or subscribe to the newsletter.
- Auth: none for browsing. A visitor who wants to submit certain requests, or who wants to track/manage a booking, is sent to `portal/login` or `portal/signup` — marketing itself never authenticates anyone; it hands off to the portal.
- Model: request-to-book, not instant-book. Submitting a stay/experience/package request does not confirm a booking or move payment — the admin team reviews and confirms.
- Deployment: static SPA, S3 + CloudFront.

### `portal/` — authenticated role-based application

- Audience: the four authenticated roles below — this is where every one of them signs in and does their actual work.
- Purpose: role-specific dashboards and shared tools — property management, booking/experience approval, calendar, financials, user management — gated by what each role is permitted to do.
- Auth: required for every screen except the login/signup pages themselves. Backed by Amazon Cognito (planned — see `Context_Instruction.md` §6; today auth is a frontend-only mock with no backend).
- Deployment: static SPA, S3 + CloudFront (separate build/bucket from marketing, same CloudFront distribution or a sibling one).

Both apps call the same backend API and read/write the same database — see `Context_Instruction.md` in this folder and in `marketing/` for the technical architecture. This file is about **who is allowed to do what**, not how it's built.

---

## 2. Roles

Four roles, each mapped 1:1 to a Cognito group once real auth is wired in. Role is always determined by the backend (the authenticated session's group claim) — never chosen by the user in any UI.

| Role       | Who they are                                                                                               | Where they sign in                                                                                       |
| ---------- | ---------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| **Admin**  | Skylife staff who run the business — review/approve requests, manage the property catalogue, manage users. | `portal/admin/login` (own subdomain/path in production)                                                  |
| **Owner**  | Property owners whose properties Skylife manages.                                                          | `portal/owner/login`                                                                                     |
| **Agent**  | Booking agents/partners who search and book on behalf of clients.                                          | `portal/agent/login`                                                                                     |
| **Client** | Guests — the people actually staying, requesting experiences, or booking packages.                         | `portal/login`, reached via a marketing CTA (never a direct link a client is expected to bookmark first) |

---

## 3. Privileges by role

Legend: ✅ full access · 🟡 partial/scoped access · 🔒 view-only · ❌ no access

| Capability                                                                                |                                                          Admin                                                           |                                                                       Owner                                                                       |                        Agent                         |                            Client                             |
| ----------------------------------------------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------: | :-----------------------------------------------------------------------------------------------------------------------------------------------: | :--------------------------------------------------: | :-----------------------------------------------------------: |
| **Property list — view**                                                                  |                                             ✅ all properties, all statuses                                              |                            🟡 own properties only, all statuses (`in_review` + `active` + `in_inactive` + `rejected`)                             | 🔒 `active` properties only (view-only, for booking) |      🔒 `active` properties only (for browsing/booking)       |
| **Property — add / edit**                                                                 |                                ✅ full CRUD; creating/editing sets status to `in_review`                                 | 🟡 can create/edit own; creating/editing sets status to `in_review` for admin review; can edit a `rejected` property and resubmit (→ `in_review`) |                          ❌                          |                              ❌                               |
| **Property approval / rejection**                                                         | ✅ exclusive — only admin can move `in_review` → `active` (approve) or `in_review` → `rejected` (with a required reason) |                                                  ❌ (sees rejection reason, cannot self-approve)                                                  |                          ❌                          |                              ❌                               |
| **Property activate / deactivate**                                                        |                       ✅ can toggle `active` ↔ `in_inactive` on any property, no re-review needed                        |                                   ✅ can toggle `active` ↔ `in_inactive` on own properties, no re-review needed                                   |                          ❌                          |                              ❌                               |
| **Property view (detail)**                                                                |                                                            ✅                                                            |                                                                     ✅ (own)                                                                      | 🔒 view-only, no action menu (for booking purposes)  |              🔒 view-only (for booking purposes)              |
| **Property featured / un-featured** (marketing landing page, capped at 6/city — see §4.1) |                                                       ✅ exclusive                                                       |                                                                        ❌                                                                         |                          ❌                          |                              ❌                               |
| **Calendar**                                                                              |                                                    ✅ all properties                                                     |                                                                 🟡 own properties                                                                 |        🟡 properties they're booking against         | ❌ (sees own booking dates only, not the management calendar) |
| **Experiences — list / add / edit**                                                       |                                                       ✅ exclusive                                                       |                                                                        ❌                                                                         |     🔒 view only (to recommend/book for clients)     |                   🔒 view only (to request)                   |
| **Packages — list / add / edit**                                                          |                                                       ✅ exclusive                                                       |                                                                        ❌                                                                         |                     🔒 view only                     |                   🔒 view only (to enquire)                   |
| **Booking requests — view / approve / reject**                                            |                                                          ✅ all                                                          |                                                      🔒 own properties' requests, view only                                                       |     🟡 can create requests on behalf of a client     |               🟡 can create + view own requests               |
| **Financials**                                                                            |                                                     ✅ platform-wide                                                     |                                                      🟡 own properties' revenue/payouts only                                                      |                          ❌                          |                              ❌                               |
| **User management (staff + owner accounts)**                                              |                                                       ✅ exclusive                                                       |                                                                        ❌                                                                         |                          ❌                          |                              ❌                               |
| **Messages**                                                                              |                                                            ✅                                                            |                                                                  🟡 own threads                                                                   |                    🟡 own threads                    |                        🟡 own threads                         |
| **Reviews**                                                                               |                                                   ✅ moderate/respond                                                    |                                                           🔒 own properties, view only                                                            |                          ❌                          |              🟡 can leave a review for own stays              |
| **Settings (org-wide)**                                                                   |                                                       ✅ exclusive                                                       |                                                                        ❌                                                                         |                          ❌                          |                              ❌                               |
| **Own profile / account settings**                                                        |                                                            ✅                                                            |                                                                        ✅                                                                         |                          ✅                          |                              ✅                               |

Notes:

- This table reflects product decisions made so far (property list/detail/calendar shared per the admin+owner approval workflow already agreed) plus reasonable defaults for capabilities not yet explicitly discussed (agent/client scoping on messages, reviews, financials). Anything marked 🟡/🔒 without a prior explicit decision should be **confirmed with the project owner before implementing**, not assumed final.
- "Exclusive" means: build once, keep it out of any shared component — see `Context_Instruction.md` §2 rule 5 for the shared-vs-exclusive UI convention.
- Enforcement is server-side (API Gateway JWT authorizer + Lambda checking the Cognito group claim on every request). The portal's `RoleRoute` component is a client-side UX convenience (fast redirect to the right login, no flash of the wrong dashboard) and must never be treated as the actual security boundary.

---

## 4. Property status lifecycle (admin ↔ owner)

**Statuses:** `in_review | active | in_inactive | rejected`. (Supersedes an earlier draft of this document that used `draft/pending/approved` — those terms are not used anywhere in the implementation; the four statuses above are the actual enum, confirmed with the project owner.)

```
                    (admin OR owner creates/edits a property)
                                    |
                                    v
                               in_review
                              /          \
      (admin approves)      /            \  (admin rejects, reason required)
                            v              v
                         active         rejected
                        /      \            |
   (admin OR owner       \      \           | (owner edits + resubmits)
    toggles freely,        \      \_________/
    no re-review)           v
                       in_inactive
                       (toggle back to active any time,
                        by admin or owner, no re-review)
```

- Creating or editing a property (by admin or owner) always sets/resets status to `in_review`, **except** toggling `active` ↔ `in_inactive`, which does not require re-review and is not a create/edit in this sense.
- Only **admin** can move a property out of `in_review` into `active` (approve) or `rejected` (reject, with a required reason).
- Once `active`, both **admin and owner** can freely toggle `active` ↔ `in_inactive` without triggering another review cycle.
- A `rejected` property is visible to its owner with the admin's rejection reason; the owner can edit it, which resubmits it as `in_review`.
- Only `active` properties are visible in agent/client-facing browsing and booking flows. Agent access to properties is **view-only** — no add/edit, no approve/reject, no activate/deactivate.
- Admin sees all statuses on all properties at all times. Owner sees all statuses, scoped to their own properties only.

### 4.1 Featured properties (admin-only, capped per city)

- Every property has an `isFeatured` boolean, set **only by admin** — never exposed to the owner-facing add/edit form.
- The marketing site's landing-page Collection section shows up to **6 featured properties per city**. "City" is the property's `location` field (e.g. `"Tuscany, Italy"`, `"Rome, Italy"`) used as the grouping key.
- Admin sets this from the property detail view's action menu (Feature / Un-feature toggle), which shows the current count for that city (e.g. "Feature (3/6 in Rome, Italy)") before acting.
- If a city already has 6 featured properties, attempting to feature a 7th is blocked with a notice naming the city and asking admin to un-feature one first — it is not silently allowed or auto-swapped.
- Un-featuring has no cap and is always allowed.
- Owner and agent never see this control; only admin can feature/un-feature, on any property regardless of who owns it.

### 4.2 Experiences (admin-only, no approval workflow)

Experiences are simpler than properties — **admin-exclusive CRUD**, no owner/agent/client involvement in managing them (owner has ❌; agent/client are 🔒 view-only for booking/recommending, per §3).

- **Statuses:** `active | in_active` only. No `in_review`/`rejected`, no approval cycle, no featured concept. It is a plain on/off toggle the admin flips from the experience detail view's action menu.
- Admin creates/edits an experience through a 3-step wizard (Identity → Imagery → Details). Unlike the property wizard there is no management-level step and no featured question.
- An experience has: name, location, one or more images, duration (free text, e.g. "3 Hours"), price per person (€), max guests, one or more categories (from a fixed set: History & Culture, Culinary Adventures, Outdoor Tours, Closed-to-the-Public, Family, At-Home, One-Day City Escapes), available season (free text), description, and special requirements.
- New experiences and edits take effect immediately (no review) — the status toggle is the only gate on whether an experience is live.

---

## 5. Open questions to resolve as the product evolves

Track decisions here as they're made, rather than letting them live only in chat history:

- [x] ~~Whether agent has any property access~~ — resolved: agent gets view-only access to `active` properties (for booking purposes), no add/edit/approve/reject/activate-deactivate. See §3 and §4.
- [ ] Exact agent commission/booking-on-behalf-of flow — not yet specified beyond "agent browses and books for clients."
- [ ] Owner financial/payout detail — schema and screen not yet designed.
- [ ] Whether staff roles (admin/agent/owner) are reached via path (`/admin/login`) or subdomain (`admin.skylifemanagement.com`) in production — currently path-based internally regardless; subdomain is a possible DNS-layer addition later (see `Context_Instruction.md` §2 rule 3).
- [ ] Review moderation rules for admin (auto-publish vs. approval-gated).

---

## 6. Change log

Update this section (or replace it with the latest state) at the end of each working day, per the project owner's process.

- **Initial version** — established the two-app split, the four-role privilege table, and the property approval lifecycle, reflecting decisions made while building the portal's login/signup/navbar.
- **Login/signup finalized** — staff login pages (admin/agent/owner) now share the same "Login to the Premium Traveler Experience" heading as the client-facing login, removing role-specific headings. Dev credentials documented per role in `Context_Instruction.md`.
- **Admin dashboard built** — sidebar/header shell, KPI cards, notification/profile/mobile-menu popovers. See `Context_Instruction.md` for file map.
- **User Management built** — list (filter/paginate/activate-deactivate), add/edit forms with agent-only agency fields. Unified what had been two out-of-sync mock datasets in the Next.js reference into one shared dataset.
- **Property status model finalized**, superseding this document's original `draft/pending/approved/rejected` draft (never implemented, dropped): the real enum is `in_review | active | in_inactive | rejected`. Admin-only approve/reject out of `in_review`; admin **and** owner can freely toggle `active` ↔ `in_inactive` without re-review. See §4 for the full lifecycle diagram.
- **Agent property access decided** — view-only, `active`-only, no management actions. `PropertyList` widened from a 2-role (`admin`/`owner`) to a 3-role (`admin`/`owner`/`agent`) component. See §3.
- **Properties list/detail UI refined**: search-by-name box added to the list panel; detail panel reordered so beds/baths/sqm, description, and owner info sit above the hero image (was below); the standalone "Property Calendar" button below the image was removed (it remains in the 3-dot action menu only).
- **Featured properties introduced** — admin-only `isFeatured` flag, capped at 6 featured properties per city (grouped by the `location` field) to match the marketing site's landing-page Collection section. Feature/Un-feature toggle lives in the property detail action menu, shows the current per-city count, and is blocked with a notice once a city is at its cap. A "Do you want this property to be featured?" yes/no question was added to `AddPropertyWizard`'s last step, admin-only. See §3 and §4.1.
- **Dashboard buttons rounded + Add Property/Add Experience wired** — dashboard KPI cards and CTA buttons now use `rounded-lg` to match User Management/Properties; the "Add Property" and "Add Experience" buttons navigate to their respective add wizards.
- **Experiences built** — admin-only feature: two-panel list/detail (`ExperienceList`, with search + status toggle via the shared `ConfirmModal`), a 3-step add/edit wizard (`AddExperienceWizard`) that is fully wired and produces a real object (the Next.js reference had unwired steps and no submission). Statuses are `active`/`in_active` only, no approval workflow. See §4.2.
