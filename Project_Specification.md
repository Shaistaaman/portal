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

| Capability                                                                                |                                                          Admin                                                           |                                                                       Owner                                                                       |                        Agent                         |                       Client                       |
| ----------------------------------------------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------: | :-----------------------------------------------------------------------------------------------------------------------------------------------: | :--------------------------------------------------: | :------------------------------------------------: |
| **Property list — view**                                                                  |                                             ✅ all properties, all statuses                                              |                            🟡 own properties only, all statuses (`in_review` + `active` + `in_inactive` + `rejected`)                             | 🔒 `active` properties only (view-only, for booking) | 🔒 `active` properties only (for browsing/booking) |
| **Property — add / edit**                                                                 |                                ✅ full CRUD; creating/editing sets status to `in_review`                                 | 🟡 can create/edit own; creating/editing sets status to `in_review` for admin review; can edit a `rejected` property and resubmit (→ `in_review`) |                          ❌                          |                         ❌                         |
| **Property approval / rejection**                                                         | ✅ exclusive — only admin can move `in_review` → `active` (approve) or `in_review` → `rejected` (with a required reason) |                                                  ❌ (sees rejection reason, cannot self-approve)                                                  |                          ❌                          |                         ❌                         |
| **Property activate / deactivate**                                                        |                       ✅ can toggle `active` ↔ `in_inactive` on any property, no re-review needed                        |                                   ✅ can toggle `active` ↔ `in_inactive` on own properties, no re-review needed                                   |                          ❌                          |                         ❌                         |
| **Property view (detail)**                                                                |                                                            ✅                                                            |                                                                     ✅ (own)                                                                      | 🔒 view-only, no action menu (for booking purposes)  |        🔒 view-only (for booking purposes)         |
| **Property featured / un-featured** (marketing landing page, capped at 6/city — see §4.1) |                                                       ✅ exclusive                                                       |                                                                        ❌                                                                         |                          ❌                          |                         ❌                         |
| **Calendar — view** (see §4.5)                                                            |                                                    ✅ all properties                                                     |                                                              🟡 own properties only                                                               |                  ✅ all properties                   |                         ❌                         |
| **Calendar — create booking**                                                             |                                              ✅ Self / Guest / Maintenance                                               |                                                       🟡 Self / Maintenance, own properties                                                       |                   🟡 Self / Guest                    |                         ❌                         |
| **Calendar — edit/delete booking**                                                        |                                             ✅ any booking, all transitions                                              |                                                 🟡 own-property bookings; status → Completed only                                                 |   🟡 own-created bookings; status → Completed only   |                         ❌                         |
| **Calendar — payment/refund/no-show transitions**                                         |                                                       ✅ exclusive                                                       |                                                                        ❌                                                                         |                          ❌                          |                         ❌                         |
| **Experiences — list / add / edit**                                                       |                                                       ✅ exclusive                                                       |                                                                        ❌                                                                         |     🔒 view only (to recommend/book for clients)     |             🔒 view only (to request)              |
| **Packages — list / add / edit**                                                          |                                                       ✅ exclusive                                                       |                                                                        ❌                                                                         |                     🔒 view only                     |             🔒 view only (to enquire)              |
| **Booking requests — view / approve / reject**                                            |                                                          ✅ all                                                          |                                                      🔒 own properties' requests, view only                                                       |     🟡 can create requests on behalf of a client     |         🟡 can create + view own requests          |
| **Financials**                                                                            |                                                     ✅ platform-wide                                                     |                                                      🟡 own properties' revenue/payouts only                                                      |                          ❌                          |                         ❌                         |
| **User management (staff + owner accounts)**                                              |                                                       ✅ exclusive                                                       |                                                                        ❌                                                                         |                          ❌                          |                         ❌                         |
| **Messages**                                                                              |                                                            ✅                                                            |                                                                  🟡 own threads                                                                   |                    🟡 own threads                    |                   🟡 own threads                   |
| **Reviews**                                                                               |                                                   ✅ moderate/respond                                                    |                                                           🔒 own properties, view only                                                            |                          ❌                          |        🟡 can leave a review for own stays         |
| **Settings (org-wide)**                                                                   |                                                       ✅ exclusive                                                       |                                                                        ❌                                                                         |                          ❌                          |                         ❌                         |
| **Own profile / account settings**                                                        |                                                            ✅                                                            |                                                                        ✅                                                                         |                          ✅                          |                         ✅                         |

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

### 4.3 Packages (admin-only, no approval workflow)

Packages follow the same admin-exclusive model as experiences (owner ❌; agent/client 🔒 view-only per §3), with `active | in_active` status and no approval cycle.

- Admin creates/edits a package through a 3-step wizard modeled on the provided reference designs:
  - **Step 1 — Identity:** package name, duration, base price (USD), guest capacity, best season, description.
  - **Step 2 — Visuals:** upload one or more images for the package banner / "At a Glance" gallery.
  - **Step 3 — Specifications:** a top-level "Highlights" bullet list, plus one or more repeating "What You Get In This Package?" inclusion blocks — each with a heading, category, image, and highlights description.
- New packages and edits take effect immediately; the status toggle is the only gate on whether a package is live.
- There was no Next.js reference implementation for packages (the reference app's packages page was a "coming soon" stub) — the portal's version is built fresh from the wizard reference screens.

### 4.4 Blogs (admin-only, no approval workflow)

Admin-exclusive, same active/in_active model as Experiences/Packages. Nav item sits after Financial.

- 2-step add/edit wizard: **Step 1 Identity** (banner image, title, subtitle); **Step 2 Blog Details** (a highlights bullet list + repeating heading/category/image/content sections — same structure as the Packages Specifications step).

### 4.5 Calendar & Bookings (shared: admin / agent / owner)

The calendar is a shared feature (like PropertyList) with a `role` prop; **no client access**. Client booking requests come from the marketing app, not here.

**Views** (toggle top-right, Month default):

- **Month:** full month grid; day cells show booking blocks with property title + guest name, color-coded by status. A `Month YYYY` label with `<` / `>` arrows pages between months (Google-Calendar style), starting from the current month.
- **Timeline:** rows = properties, columns = days; booking bars span their date range across a property's row (guest name + nights). Horizontally scrollable from today forward across ~a year, loaded gradually (pagination-style on scroll).

**Role scoping:**

- Admin & agent: see all properties' calendars.
- Owner: sees only their own properties' calendars (mocked to a demo owner id for now, same approach as PropertyList).

**iCal:** each property can have **up to 3 iCal URLs**, added/edited in `AddPropertyWizard` (a repeatable URL field, max 3). There is **no calendar-level "Add iCal" button** — iCal is property-specific and lives on the property.

**Booking creation** — a separate add/edit page per role (`/{role}/calendar/add-booking`, `/{role}/calendar/:id/edit`), not the reference's right-side popover.

- **Contact fields are recorded for every booking, all types, all roles**: guest/occupant name, phone, email, plus Adults/Children steppers. (Even admin creating a Self or Maintenance booking provides a contact name/phone/email.)
- **Booking Type is filtered per role:** admin = Self / Guest / Maintenance; owner = Self / Maintenance; agent = Self / Guest.
- **Pricing shown on the booking page:** `base price × nights + cleaning fee + service fee + taxes`. Base price comes from the property; **cleaning fee, service fee, and taxes are admin-only org-level values set in Settings** (a new admin-only pricing section in Settings — distinct from the removed Organization Settings block).
- **Overlap:** if the property/date range overlaps an existing booking, the UI **warns but allows** (real double-booking prevention is a backend concern per marketing's Context_Instruction §5).

**Status model (6 statuses):** `payment_pending | confirmed | blocked | completed | no_show | cancelled_refunded`.

Legend colors: Confirmed = green, Payment Pending = orange, Blocked = red, Completed = blue, No-Show = slate/gray, Cancelled/Refunded = dark (struck-through).

**Initial status by booking type:**

- Guest → **Payment Pending**
- Self → **Confirmed**
- Maintenance → **Blocked**

**Transitions (all manual, on the edit page; gated by role and date):**

- Payment Pending → Confirmed — **admin only** (records payment)
- Payment Pending → Cancelled/Refunded — **admin only** (pre-arrival cancel)
- Confirmed → Completed — admin / agent / owner, **only once checkout date < today**
- Confirmed → No-Show — **admin only**, only once checkout date < today
- No-Show → Reschedule — **admin only**; reopens the booking at **Payment Pending** with new dates (treated as a fresh charge, since prices may have risen)
- No-Show → Cancelled/Refunded — **admin only**
- Blocked (maintenance) → delete/remove only; no flow into booking states
- Completed, Cancelled/Refunded → **terminal**

The status dropdown is gated so owner/agent effectively only ever see **Completed** (when a Confirmed booking's checkout has passed); everything else is read-only to them.

**Edit / delete scope:**

- Admin: any booking, all allowed transitions.
- Owner: only bookings on their **own properties**.
- Agent: only bookings **they created**.

**Marketing-app impact (documented here, enforced in backend — no marketing code now):** a property's dates that are in **Payment Pending** are hidden from client search on the marketing site (so a client can't request already-pending dates), while staff still see them in the portal as a booking opportunity. Confirmed/Blocked dates are unavailable to everyone.

### 4.6 Financials (admin-managed record keeping; owner/agent view-only)

Financials is a document record keeper, **not** an accounting engine — uploaded files are stored and re-downloadable but never parsed (the portal does not read the numbers inside).

- **Admin** uploads/manages records; **owner and agent can view only the records tagged to them** (the "Tag to" mechanism below). Client has no access.
- **List view** — a User-Management-style table (title + notes, category badge, tagged-to owner/agent, period, file name/size, uploaded-by/date, download + delete). Search by title/file name; filters for Category, Year, and **Tag to** (a grouped select of Owners / Agents, plus All / Untagged).
- **Add File page** — a file upload (XLSX/XLS/CSV) plus required Title, Period (month + year), Category (Revenue / Payouts / Expenses / Taxes / Other), an optional **Tag to** (grouped owners/agents; leaving it blank = admin-only untagged record), and optional Notes.
- **Tag to** owner/agent options are sourced from the shared user list (mock `MOCK_USERS` filtered to owner/agent today; the users API in future). Tagging is how a record becomes visible to that owner/agent's own (future) financials view — owners/agents never see untagged or other users' records.
- File storage is a backend concern (S3 presigned upload); mocked/local for now.

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
- **Property/Experience detail images normalized** — both now use `w-full max-w-lg` + 3:2 aspect so they render at identical dimensions.
- **Packages built** — admin-only feature mirroring Experiences: two-panel list/detail (`PackageList`, search + status toggle via `ConfirmModal`) and a 3-step add/edit wizard (`AddPackageWizard`: Identity / Visuals / Specifications, the last with a highlights bullet list and repeating heading/category/image/highlights inclusion blocks). Built fresh from the reference designs; no Next.js reference existed. See §4.3.
- **Settings built for all roles** — one shared `AccountSettings` component used by every role, with an Agency Details block gated to agent. Admin settings render inside `AdminLayout`; owner/agent/client settings are standalone pages (`RoleSettingsPage`) until those roles get their own layouts. Routes: `/admin/settings`, `/owner/settings`, `/agent/settings`, `/client/settings`. All saves are local-only pending backend.
- **Settings trimmed** — after review, the settings screen keeps Profile (with a working photo upload), Change Password, and a single Email-notifications toggle. The SMS/Product-update toggles, the Language & Region section, and the Organization Settings section were removed for all roles.
- **Blogs built** — admin-only feature (nav item added after Financial), mirroring Experiences/Packages: two-panel list/detail (`BlogList`, search + status toggle via `ConfirmModal`) and a **2-step** add/edit wizard (`AddBlogWizard`): Step 1 Identity (banner image, title, subtitle), Step 2 Blog Details (a highlights bullet list + repeating heading/category/image/content sections, mirroring the Packages Specifications step). Statuses are `active`/`in_active`, no approval workflow. Routes `/admin/blogs`, `/admin/blogs/add-blog`, `/admin/blogs/:id/edit`.
- **Calendar stage 1 built** — (a) `AddPropertyWizard` gained a repeatable "iCal Links" field (max 3 URLs) in the Identity step, backed by a new `Property.icalUrls` field; (b) Settings gained an admin-only "Booking Fees" section (cleaning fee, service fee, taxes %) used to estimate booking totals.
- **Calendar stage 2 built** — the calendar itself: `features/calendar/` with the 6-status `Booking` type + transition rules (`transitions.ts`) + mock bookings (dates generated relative to today), and a shared `Calendar` component (role prop admin/owner/agent). Month view (full grid, prev/next month paging, status-colored booking blocks showing property + guest name) and Timeline view (property rows × day columns, booking bars, horizontal scroll that gradually loads more days up to a year). Role scoping: admin/agent see all properties, owner sees only own (mocked). Routes `/admin/calendar` (in AdminLayout), `/owner/calendar`, `/agent/calendar` (standalone).
- **Financials built** — admin record-keeping feature (§4.6): a User-Management-style records table (`FinancialRecordsList`) with search + Category/Year/**Tag-to** filters and download/delete, and an Add File page (`AddFinancialRecordForm`) with a file upload plus required Title / Period (month+year) / Category and optional Tag-to + Notes. Files are stored-not-parsed. Records can be **tagged to an owner or agent** (grouped searchable select sourced from the shared user list) so those users can later view only their own tagged records. Routes `/admin/financial`, `/admin/financial/add-file`.
- **Calendar shows only bookable properties** — `in_review`, `rejected`, and `in_inactive` properties are hidden from both calendar views and the booking-form property dropdown; only `active` (bookable) properties appear.
- **Calendar refinements** — added 4 more mock properties (12 total) so the timeline shows vertical scroll; added a "Property" filter dropdown to the calendar (All properties, or a single property, applied to both Month and Timeline views); the Timeline now has a month-band header row labelling each contiguous run of same-month days plus a divider on the 1st of each month, so day numbers rolling over (…30, 31, 1, 2…) are never ambiguous. Also centralized the demo nightly-rate lookup into `mockProperties.nightlyRateFor` (previously duplicated in `mockBookings` and `BookingForm`).
- **Calendar stage 3 built** — add/edit booking pages, completing the calendar feature. Shared `BookingForm` (property select, check-in/out, contact name/phone/email recorded for all types, adults/children steppers hidden for maintenance, booking-type filtered per role, live fee-inclusive price breakdown, overlap warn-but-allow). `AddBookingPage` derives initial status from booking type. `EditBookingPage` prefills the form and adds a status-actions panel gated by `allowedTransitions` (admin-only payment/refund/no-show; all roles Completed after checkout), an admin-only no-show Reschedule action (reopens a fresh Payment Pending booking), and a delete gated by `canEditBooking` (admin any / owner own-property / agent own-created). Routes: `/{admin|owner|agent}/calendar/add-booking` and `/{...}/calendar/:id/edit`. All persistence mocked (TODO AWS).
- **Calendar & Bookings spec finalized** (see §4.5, calendar/booking UI built in later stages) — shared admin/agent/owner Month + Timeline calendar; property iCal (max 3 URLs, set in the property wizard); separate add/edit booking pages; 6-status booking state machine (payment_pending/confirmed/blocked/completed/no_show/cancelled_refunded) with role- and date-gated manual transitions (admin-only payment/refund/no-show/reschedule; all three can mark Completed after checkout); per-role booking-type filtering; fee-inclusive pricing driven by new admin-only Cleaning/Service/Tax fee inputs in Settings; overlap warns-but-allows.
