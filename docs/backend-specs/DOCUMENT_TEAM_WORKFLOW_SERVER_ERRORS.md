# Server errors: document upload, team lookup, workflow submissions

**Status:** Originally three separate, confirmed backend bugs. Bug #1
(document upload) is now resolved — see the update in that section. The
other two are unaffected by this update. Nothing remaining here is
fixable from the frontend repo — the frontend is sending correctly-formed
requests in every case below and displaying exactly what the server sent
back.

**Audience:** Backend team (`kirangawande39/DMS`).

**Why this document exists:** while testing document upload against the
live deployed API (`https://dms-s32w.onrender.com`), three endpoints
returned server-side errors. All three were reproduced multiple times with
consistent results, captured directly from the proxy's request log (which
records the raw response body for every call), not inferred from the
frontend.

---

## 1. `POST /document` — 500, `documentService.createDocument is not a function`

**Resolved as of 2026-08-16.** A later retest (logged in
[`WORKFLOW_SUBMIT_MISSING_TEAM.md`](./WORKFLOW_SUBMIT_MISSING_TEAM.md))
shows `POST /document` returning a clean `201 Created` with a real
document body. Left below for the record, since it's the reproduction
that made the original bug traceable.

### What was found

```
POST /api/v1/document
→ 500 (1502ms, 3786ms, 6465ms — reproduced 3 times)
{
  "success": false,
  "errorName": "TypeError",
  "message": "documentService.createDocument is not a function",
  "errors": []
}
```

### Why this is a backend bug, not a request problem

The error is a `TypeError` naming an internal service method
(`documentService.createDocument`) as not being a function — this is not a
validation error, not a 4xx, and not related to the shape of the multipart
payload. A malformed request from the client would produce a different
error (a validation message naming a missing/invalid field). This is the
backend's own document controller calling a method that doesn't exist on
whatever `documentService` currently resolves to — most likely a broken
import, a service file that no longer exports `createDocument`, or a typo
introduced in a refactor.

### Impact

Document upload — the one endpoint `DOCUMENT_MANAGEMENT.md` describes as
already "COMPLETED + TESTED" — is completely non-functional right now.
Every upload attempt fails with this same error regardless of payload.

### What to check

The document controller's `createDocument` handler, and whatever module it
imports as `documentService` — confirm the import path is correct and that
the service module actually exports a `createDocument` function matching
what the controller expects.

---

## 2. `GET /team` — 500 on every call — see `TEAM_LIST_ENDPOINT_ERROR.md`

**Moved to its own document.** What was originally written here as a
department+status-combined-filter bug turned out, on retesting, to be
broader — `GET /team` 500s with `Cannot read properties of undefined
(reading 'department')` on *every* call, including a bare one with no query
params at all. That's a big enough correction and a severe enough bug (it
breaks the Team list screen outright, not just a scoped dropdown) to warrant
its own writeup rather than staying buried as one bullet here. Full detail,
reproductions, and root-cause hypothesis:
[`TEAM_LIST_ENDPOINT_ERROR.md`](./TEAM_LIST_ENDPOINT_ERROR.md).

---

## 3. `GET /workflow/my-submissions` — returns 404 instead of 200 with an empty list, and appears to scope by the wrong field

**Upgraded 2026-08-17** from a status-code/UX nitpick to a data-correctness
bug — see "Update" below. The original 404-vs-200 finding is left in place
first since it's still true and still worth fixing on its own.

### What was found

```
GET /api/v1/workflow/my-submissions
→ 404 (5919ms, 6714ms — reproduced twice)
{
  "success": false,
  "errorName": "Error",
  "message": "No document submissions found.",
  "errors": []
}
```

### Why this is worth fixing, even though it's not a crash

This one isn't a broken function — it's a status-code/contract choice that
doesn't match how every other list endpoint in this API behaves. `GET
/department`, `GET /team`, `GET /acl`, etc. all return `200` with `data:
[]` when there's nothing to show; only `my-submissions` treats "no results"
as a `404` error. A client has no reliable way to distinguish "you have
genuinely submitted nothing yet" (a normal, common state — every new
employee starts here) from a real 404 ("this endpoint or resource doesn't
exist"), since both produce the same status code and error shape.

### Impact

The frontend's "Submitted Documents" screen currently has no way to render
a clean "no submissions yet" empty state — it renders this as an error
banner instead, because that's genuinely what a 404 means everywhere else
in this API.

### What to fix

Return `200` with `{ "success": true, "data": [] }` when the logged-in
employee has no submissions, matching every other list endpoint's
convention. Reserve `404` for cases where something referenced by the URL
itself doesn't exist (there's no id in this URL, so a 404 here doesn't
have an obvious meaning to begin with).

### Update (2026-08-17): the 404 isn't always "genuinely empty" — a real owner got it for a document they demonstrably own

Building a "Published Documents" screen (filters `my-submissions` to
`status: COMPLETED`) surfaced something worse than the status-code issue
above: an intern account (`EMP-007`, `nishantchoudhary6835@gmail.com`)
called `GET /workflow/my-submissions` and got the same 404 shown above —
but that account unambiguously owns a real, completed workflow. The same
workflow's `document.owner` and `workflow.owner` are both `EMP-007`
throughout its whole lifecycle (create → submit → escalate → approve).

At almost the same time, a **different** account —
`superadmin@dms.com` (`SA-001`, `SUPER_ADMIN`) — called the same endpoint
for themselves and got a `200` including that exact workflow as one of
their own "my submissions," even though Super Admin never authored it —
they only supplied the final `APPROVE` action
(`lastActionBy: "6a709395067edbac89537d0e"`, Super Admin's own id).

```
# Logged in as SA-001 (Super Admin) — this account did not create this document
GET /api/v1/workflow/my-submissions → 200
{
  "data": [
    {
      "_id": "6a82ac993e3c5dd4f296df90",
      "document": {
        "owner": { "employeeId": "EMP-007", "firstName": "Nishant", ... },
        "status": "PUBLISHED"
      },
      "status": "COMPLETED",
      "lastAction": "APPROVED",
      "lastActionBy": "6a709395067edbac89537d0e"   // Super Admin's own id
    },
    "...2 more"
  ]
}

# Logged in as EMP-007 (Nishant Choudhary, INTERN) — the actual document.owner
GET /api/v1/workflow/my-submissions → 404
{ "success": false, "message": "No document submissions found.", "errors": [] }
```

Reproduced twice more for `EMP-007` in a **fresh incognito window, single
account only, no other session active** — ruling out cross-tab cookie
interference as the cause. The 404 is consistent and repeatable for the
true owner.

This suggests `my-submissions` may not be scoping strictly by
`document.owner`/`workflow.owner` as its name implies — the Super Admin
result is consistent with scoping by something like "workflows I've most
recently acted on" (`lastActionBy`) instead, or some other non-owner field.
Whatever the actual query is, it produces the exact inverse of what the
endpoint name promises: the true owner sees nothing, and an uninvolved-in-
authorship approver sees it as their own.

### Impact (revised)

This is no longer just an empty-state UX gap. A real employee's own
completed, published document is completely invisible to them through the
one endpoint meant to show it, while it incorrectly appears under another
account's submissions. Any frontend screen scoped to "documents I
submitted" (My Submissions, and the new Published Documents view) is
silently wrong for at least this account.

### What to fix (revised)

Audit whatever query backs `GET /workflow/my-submissions` and confirm it
filters by the true document/workflow owner (matching the authenticated
user's own `Employee._id`), not by `lastActionBy`, `currentReviewer`
history, or any other field. The 404-vs-200-empty fix above is still
correct and still needed, but is secondary to this.

---

## Summary

| Endpoint | Problem | Severity |
| --- | --- | --- |
| `POST /document` | ~~500 — `documentService.createDocument` isn't a function~~ **Resolved 2026-08-16** | Was blocking; now returns 201 |
| `GET /team` (any/no query params) — [detail](./TEAM_LIST_ENDPOINT_ERROR.md) | ~~500 — reads `.department` off `undefined` on every call~~ **Resolved 2026-08-16** | Was blocking; now returns 200 |
| `GET /workflow/my-submissions` | 404 instead of 200+empty on no results; **and** appears to scope by the wrong field — the true owner got 404 for a document they demonstrably own, while a different account (only the final approver, not the author) saw it under their own "my submissions" | Was non-blocking UX; **now confirmed data-correctness — still open** |

The first two were reproduced more than once with identical results before
their fixes landed, so they weren't one-off flukes — they were consistently
broken at the time of writing. Both are confirmed fixed as of the 2026-08-16
retest logged in `WORKFLOW_SUBMIT_MISSING_TEAM.md`. Only the third bug is
still open.
