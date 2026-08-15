# Server errors: document upload, team lookup, workflow submissions

**Status:** Three separate, confirmed backend bugs. Nothing here is
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

## 2. `GET /team?department=<id>&status=ACTIVE` — 500, `Cannot read properties of undefined (reading 'department')`

### What was found

```
GET /api/v1/team?department=6a7178421c73966a2997d72b&status=ACTIVE
→ 500 (1336ms, 2653ms — reproduced twice)
{
  "success": false,
  "errorName": "TypeError",
  "message": "Cannot read properties of undefined (reading 'department')",
  "errors": []
}
```

`6a7178421c73966a2997d72b` is a real, active department id — confirmed
immediately beforehand by a successful `GET /department` call that returned
it in the list. So this isn't a bad/unknown id being passed.

### Why this is a backend bug

`Cannot read properties of undefined (reading 'department')` means the
handler tried to read a `.department` property off something that was
`undefined` — most likely `req.query` being accessed unsafely, or a
destructure that assumes a body/object exists when this is a GET request
with query parameters, not a POST body. This is unrelated to the document
upload bug above; it's the team list endpoint specifically failing when
filtered by `department` + `status` together (the exact query the frontend
sends every time it needs to scope a team picker to one department — used
on the Create Document, Create Employee, and Create ACL forms).

### Impact

Any screen that scopes a team dropdown to a chosen department — Create
Document, Create Employee, Create Access Rule — silently gets an empty/
errored team list instead of the department's actual teams.

### What to check

The team list controller's query-parameter handling, specifically whatever
code path is only reached when `department` and `status` are both present
together — the `undefined.department` access suggests a specific branch for
the combined filter that isn't reached by a `department`-only or
`status`-only query.

---

## 3. `GET /workflow/my-submissions` — returns 404 instead of 200 with an empty list

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

---

## Summary

| Endpoint | Problem | Severity |
| --- | --- | --- |
| `POST /document` | 500 — `documentService.createDocument` isn't a function | **Blocking** — document upload is completely broken |
| `GET /team?department=&status=` | 500 — reads `.department` off `undefined` | **Blocking** for any department-scoped team picker |
| `GET /workflow/my-submissions` | 404 instead of 200+empty on no results | Non-blocking, but breaks the empty-state UX and is inconsistent with the rest of the API |

All three were reproduced more than once with identical results, so these
aren't one-off flukes — they're consistently broken as of this writing.
