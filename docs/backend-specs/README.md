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
| `DOCUMENT_MANAGEMENT.md` | Document create + update/versioning (`POST`/`PATCH /document`) — no list or detail GET route is documented anywhere in it |
| `DOCUMENT_UPDATE_VERSION.md` | One-page quick guide to the update → new-version flow; a trimmed pointer at `DOCUMENT_MANAGEMENT.md` §8-10 |
| `WORKFLOW_MODULE.md` | Full submit → review → approve/return/reject → resubmit → publish lifecycle, plus routing rules the frontend must never duplicate |
| `WORKFLOW_REVIEW_ESCALATION.md` | One-page quick guide to reminders/escalation timing; a trimmed pointer at `WORKFLOW_MODULE.md` §15-19 |
| `EGKMS-System-Specification.pdf` | Whole-product specification |
| `EGKMS-Backend-Change-Request.pdf` | Requested backend changes |
| `React-folder-structure.pdf` | Reference folder layout |
| `CORS_CHANGE_REQUEST.md` | CORS allow-list and cookie `SameSite` changes needed for direct (proxy-less) frontend access |
| `DOCUMENT_TEAM_WORKFLOW_SERVER_ERRORS.md` | Originally three server-side bugs; document upload 500 and `GET /team` 500 are now resolved, only the workflow my-submissions 404-on-empty is still open |
| `TEAM_LIST_ENDPOINT_ERROR.md` | `GET /team` 500'd on every call — **resolved 2026-08-16**, every variant now returns 200 |
| `WORKFLOW_SUBMIT_MISSING_TEAM.md` | Workflow submit 400 ("Unable to determine next workflow authority") — confirmed by elimination to be the Super Admin test account's own missing `Employee.team`, not the document's `team` field |
| `OTP_EMAIL_SEND_TIMEOUT.md` | `POST /auth/send-email-otp` always fails — IPv6 SMTP connection issue in `src/config/mail.js`, root-caused against the backend's own source; two fixes attached (minimal `family: 4` patch, or switch to Brevo's HTTP API) |

**Still missing from this folder:** `PERMISSION_MODULE.md`, `ACL_MODULE.md`,
and `ROLE_PERMISSION_MODULE.md` are cited by name in `src/services/`
comments as the specs those three already-built, already-shipping modules
were written against, but none of the three were ever saved here — same
loose-file-in-chat problem this folder exists to prevent. If they turn up,
they belong here.

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
retest, but there is still no documented list/detail GET route for
documents, so no Document List/Detail screen can be built yet — see
`DOCUMENT_MANAGEMENT.md`'s frontend note.

The dashboard (`HomeScreen`) now renders from real hooks
(`usePendingWorkflows`, `useMySubmissions`, `useDashboard`, `useDepartments`)
instead of `src/screens/home/placeholders.js`, which has been removed. Panels
with no backing endpoint at all (an org-wide approval-stage breakdown, a
strategic-ideas pipeline, an audit-log feed) were dropped rather than kept as
fabricated numbers.

Also outstanding: `clearHierarchyCache()` is exported but never wired to
logout; `@tanstack/react-query` is configured but entirely unused.

Note for local development: Metro's file watcher does not fire on the machine
this was built on, so every change required a full dev-server restart.
