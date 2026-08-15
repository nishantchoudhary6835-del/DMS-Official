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
| `EGKMS-System-Specification.pdf` | Whole-product specification |
| `EGKMS-Backend-Change-Request.pdf` | Requested backend changes |
| `React-folder-structure.pdf` | Reference folder layout |
| `CORS_CHANGE_REQUEST.md` | CORS allow-list and cookie `SameSite` changes needed for direct (proxy-less) frontend access |
| `DOCUMENT_TEAM_WORKFLOW_SERVER_ERRORS.md` | Three confirmed server-side bugs: document upload 500, department-scoped team lookup 500, workflow my-submissions 404-on-empty |
| `WORKFLOW_SUBMIT_MISSING_TEAM.md` | Workflow submit 400 ("Unable to determine next workflow authority") — a downstream effect of the still-open team-lookup 500 above |

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

The Hierarchy, Department and Team modules are implemented and their read paths
are confirmed against the live backend. **No write path has been exercised** —
create, edit, status toggle, delete-protection refusal, the Team-Lead-only
delete 403, and duplicate-name-per-department are all unverified.

Also outstanding: `clearHierarchyCache()` is exported but never wired to logout;
the dashboard still renders from `src/screens/home/placeholders.js` rather than
`useDashboard()`; and `@tanstack/react-query` is configured but entirely unused.

Note for local development: Metro's file watcher does not fire on the machine
this was built on, so every change required a full dev-server restart.
