# Team list endpoint (`GET /team`) fails on every call

**Status:** Confirmed, broader than originally scoped — see the note below.
Nothing here is fixable from the frontend repo.

**Audience:** Backend team (`kirangawande39/DMS`).

**Why this document exists:** this was originally folded into
`DOCUMENT_TEAM_WORKFLOW_SERVER_ERRORS.md` §2 as a bug specific to combining
the `department` and `status` filters. Retesting since — while building the
frontend's workflow review UI — showed that framing was too narrow: `GET
/team` fails identically with no query params at all. That's a big enough
correction, and a severe enough bug on its own (it breaks the Team list
screen outright, not just a scoped dropdown), to warrant its own document
rather than staying buried as one bullet in a three-bug roundup.

---

## What was found

Four variants, all reproduced, all returning the identical error:

```
GET /api/v1/team
→ 500
{ "success": false, "errorName": "TypeError",
  "message": "Cannot read properties of undefined (reading 'department')", "errors": [] }

GET /api/v1/team?status=ACTIVE
→ 500 (same error)

GET /api/v1/team?status=INACTIVE
→ 500 (same error)

GET /api/v1/team?department=6a7178421c73966a2997d72b&status=ACTIVE
→ 500 (same error, reproduced multiple times across sessions)
```

`6a7178421c73966a2997d72b` is a real, active department id — confirmed by a
successful `GET /department` call returning it in the list moments before.
So this was never a bad/unknown id, and — as the bare call shows — it isn't
about which query params are present either. **Every call to this endpoint
fails identically, including one with zero query parameters.**

For contrast, in the same session `POST /team` succeeded and created a real
team:

```
POST /api/v1/team
→ 201
{
  "success": true,
  "message": "Team created successfully.",
  "data": {
    "_id": "6a809cea4c61f199cf87e98f",
    "name": "TEST",
    "department": {
      "_id": "6a7178421c73966a2997d72b",
      "name": "Information Technology",
      "code": "IT",
      "status": "ACTIVE"
    },
    "teamLead": null,
    "status": "ACTIVE",
    "createdBy": "6a709395067edbac89537d0f",
    "createdAt": "2026-08-15T17:07:54.640Z",
    "updatedAt": "2026-08-15T17:07:54.640Z"
  }
}
```

So this is a read-path bug only — creation is confirmed working, and there's
no evidence update/delete are affected either.

## Why this is a backend bug

`Cannot read properties of undefined (reading 'department')` means the
handler tried to read a `.department` property off something `undefined`.
The original hypothesis — a branch reached only when `department` and
`status` are combined — is ruled out by the bare parameterless call above
failing the same way: with no query at all, the unsafe `.department` read
can't be coming from `req.query`. More likely candidates:

- An aggregation/`.populate()` step that unconditionally assumes each team
  document already has a resolved `department` reference, run regardless of
  any filter.
- A `req.user` / auth-context field expected to carry a `.department` that
  isn't attached before this handler runs.

Either way, whatever throws runs on every request to this route, before any
filter-specific logic executes.

## Impact

- The Team List screen (`GET /team`, no filters) is completely broken —
  this is not limited to scoped pickers.
- Every screen that scopes a team dropdown to a department — Create
  Document, Create Employee, Create Access Rule — fails for the same
  underlying reason.
- Downstream, this is why documents can currently only be created with
  `team: null` — there's no way to populate a team picker at all. See
  `WORKFLOW_SUBMIT_MISSING_TEAM.md` for how that compounds into a separate
  workflow-submit failure.
- `POST /team` (create) is unaffected and confirmed working live.

## What to check

Start in the base list handler itself, not a combined-filter branch — the
parameterless call proves the failure happens before any query-param logic
runs. Look for a `.department` read that fires unconditionally on every
request to this route (a shared response-mapping/populate step, or
middleware this route wires through that a department-scoped route also
happens to use).
