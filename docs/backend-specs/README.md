# Backend specifications

The API contracts this frontend was built against, supplied by the backend
team. They are committed here because they previously existed only as loose
files in a Downloads folder — losing them would leave the client code with no
record of what it was written to satisfy.

| Document | Covers |
| --- | --- |
| `AUTH_FLOW.md` | Registration, login, OTP, refresh, session cookies |
| `HIERARCHY_MODULE.md` | `GET /hierarchy` — the nine levels and their `level` ranks |
| `DEPARTMENT_MANAGEMENT.md` | Department CRUD, status, head assignment, delete rules |
| `TEAM_MANAGEMENT.md` | Team CRUD, department scoping, team-lead assignment |
| `EMPLOYEE_MANAGEMENT.md` | Employee CRUD, filters, registration state |
| `USER_MANAGEMENT.md` | Account status, lockout, role administration |
| `DOCUMENT_MANAGEMENT.md` | Document create + update/versioning (`POST`/`PATCH /document`) — earlier snapshot; superseded by `DOCUMENT_MODULE_DOCUMENTATION.md` for anything beyond create/update |
| `DOCUMENT_UPDATE_VERSION.md` | One-page quick guide to the update → new-version flow; a trimmed pointer at `DOCUMENT_MANAGEMENT.md` §8-10 |
| `DOCUMENT_MODULE_DOCUMENTATION.md` | 2026-08-18 update — documents the full CRUD surface: `GET /document` (list), `GET /document/:id` (detail), `GET /document/:id/versions`, `PATCH /document/:id/status`, `PATCH /document/:id/archive`, `PATCH /document/:id/restore`, `DELETE /document/:id`. Only create/update have ever been exercised live; the rest are documented but unverified |
| `WORKFLOW_MODULE.md` | Full submit → review → approve/return/reject → resubmit → publish lifecycle, plus routing rules the frontend must never duplicate |
| `WORKFLOW_REVIEW_ESCALATION.md` | One-page quick guide to reminders/escalation timing; a trimmed pointer at `WORKFLOW_MODULE.md` §15-19 |
| `EGKMS-System-Specification.pdf` | Whole-product specification |
| `EGKMS-Backend-Change-Request.pdf` | Requested backend changes |
| `React-folder-structure.pdf` | Reference folder layout |
| `CORS_CHANGE_REQUEST.md` | CORS allow-list and cookie `SameSite` changes needed for direct (proxy-less) frontend access |
| `DOCUMENT_TEAM_WORKFLOW_SERVER_ERRORS.md` | Originally three server-side bugs; document upload 500 and `GET /team` 500 are now resolved. `GET /workflow/my-submissions` is still open and got worse on 2026-08-17: a confirmed real owner gets 404 for their own completed document while a different account (the approver, not the author) sees it under their own submissions — looks like it scopes by the wrong field, not just a 404-vs-empty status code issue |
| `TEAM_LIST_ENDPOINT_ERROR.md` | `GET /team` 500'd on every call — **resolved 2026-08-16**, every variant now returns 200 |
| `WORKFLOW_SUBMIT_MISSING_TEAM.md` | Workflow submit 400 ("Unable to determine next workflow authority") — confirmed by elimination to be the Super Admin test account's own missing `Employee.team`, not the document's `team` field |
| `OTP_EMAIL_SEND_TIMEOUT.md` | `POST /auth/send-email-otp` always fails — IPv6 SMTP connection issue in `src/config/mail.js`, root-caused against the backend's own source; two fixes attached (minimal `family: 4` patch, or switch to Brevo's HTTP API) |
| `EGKMS_PERMISSION_ROLEPERMISSION_ACL_DEFINITION.md` | Fills the gap `PERMISSION_MODULE.md`/`ACL_MODULE.md`/`ROLE_PERMISSION_MODULE.md` left — the full Permission → RolePermission → ACL engine (25 permissions, 62 RolePermission assignments, global-ACL-from-RolePermission seeding, Employee/Team/Department/Global precedence). Has a documented live discrepancy: INTERN should have a global ALLOW ACL for `DOCUMENT.CREATE` per this doc's own §7.8/§10, but a live 2026-08-18 test got 403 "No active ACL rule found" for exactly that request on an account that succeeded at the same call on 2026-08-16 |
| `DOCUMENT_CREATE_ACL_MIDDLEWARE_ORDER_BUG.md` | Root cause of the discrepancy above, found by reading the backend source directly (`kirangawande39/DMS`, branch `develop`): `document.routes.js` runs `accessControl` before `upload.single("file")` on the create route, so `req.body` (which ACL scope resolution reads department/team from) is empty at that point for every multipart request — silently disabling Department- and Team-scoped ACL rules for `POST /document` specifically. One-line middleware reorder fix included, plus a zero-deploy workaround (use a Global-scoped rule instead) |
| `DOCUMENT_VIEW_API.md` | New Document View API (`GET /document/:id/view`, returns PDF binary) replacing the old `fileUrl`/Cloudinary-direct-link approach — `fileUrl`/`filePublicId` are no longer sent in any document response at all. Implemented client-side (`useViewDocument`, blob fetch + object URL, web-only); not yet confirmed live — the spec's own examples use a plural `/documents/:id/view` path while every other confirmed document route in this app is singular, same kind of documented-vs-actual mismatch as `ROLE_PERMISSION_MODULE.md`'s route casing |

`PERMISSION_MODULE.md` and `ACL_MODULE.md`/`ROLE_PERMISSION_MODULE.md`
themselves (the per-module versions cited by name in `src/services/`
comments) still haven't turned up — `EGKMS_PERMISSION_ROLEPERMISSION_ACL_DEFINITION.md`
above covers the same ground in one combined document instead. If the
per-module originals turn up, they belong here too.

`AUTH_FLOW.md` here differs from `docs/AUTH_FLOW.md` in the backend repo
(`kirangawande39/DMS`) — that copy is longer. Treat the backend repo's version
as authoritative and this one as the snapshot the client was written against.

## Open questions against these specs

Recorded here because they were found by testing against the live Render
deployment and are not written down anywhere else.

**Sessions cannot renew.** `POST /auth/refresh` returns 401
`"Invalid refresh token."` even with a refreshToken that has ~7 days left. The
accessToken has `Max-Age=900`, so a session dies after 15 minutes and the user
is signed out. The client interceptor behaves correctly — it catches the 401,
attempts refresh exactly once, and signs out cleanly when that fails. Leading
hypothesis is that refresh tokens are held in server memory and wiped when the
Render instance spins down; a 27s cold-start response was observed alongside
the failure. This is the most serious outstanding issue and it is backend-side.

**Login takes ~3.5s.** Measured 5574 / 4004 / 3352 ms. Reads are 1087–1859 ms
regardless of payload size, which puts an infrastructure floor of ~1.1s on the
free tier. The remaining ~2.4s is bcrypt. Lowering the cost factor is the only
code-level fix available.

## Client-side state

The Hierarchy, Department, and Team modules are implemented and their read
paths are confirmed against the live backend — Team's `GET /team` 500 is
resolved as of 2026-08-16 (see `TEAM_LIST_ENDPOINT_ERROR.md`). **Most other
write paths remain unexercised** — edit, status toggle, delete-protection
refusal, the Team-Lead-only delete 403, and duplicate-name-per-department are
all unverified.

Document upload (`POST /document`) is confirmed working as of the same
retest. As of 2026-08-18, `DOCUMENT_MODULE_DOCUMENTATION.md` documents a
list/detail GET route, version history, status/archive/restore, and delete —
none of it built or exercised from this app yet, but a Document List/Detail
screen and the RETURN→edit→resubmit loop (previously blocked, see the
Workflow review/resubmit plan) are both unblocked on the backend side now.

The dashboard (`HomeScreen`) now renders from real hooks
(`usePendingWorkflows`, `useMySubmissions`, `useDashboard`, `useDepartments`)
instead of `src/screens/home/placeholders.js`, which has been removed. Panels
with no backing endpoint at all (an org-wide approval-stage breakdown, a
strategic-ideas pipeline, an audit-log feed) were dropped rather than kept as
fabricated numbers.

The new Published Documents screen (`src/screens/workflow/PublishedDocumentsScreen.jsx`)
filters `GET /workflow/my-submissions` to `status: COMPLETED` — there's no
org-wide document list endpoint, so like My Submissions it's scoped to "my
own." It inherits the my-submissions owner-scoping bug above: confirmed
live, an account's own published document did not appear for them.

Also outstanding: `clearHierarchyCache()` is exported but never wired to
logout; `@tanstack/react-query` is configured but entirely unused.

Note for local development: Metro's file watcher does not fire on the machine
this was built on, so every change required a full dev-server restart.
