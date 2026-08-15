# Workflow submit fails with "Unable to determine next workflow authority"

**Status:** Confirmed. Downstream effect of an already-reported bug, not a
new one — see the last section. Nothing here is fixable from the frontend
repo.

**Audience:** Backend team (`kirangawande39/DMS`).

**Why this document exists:** with `POST /document` now fixed, document
upload followed by "submit for review" was tested end-to-end for the first
time. Submission fails every time with a 400 naming a workflow-routing
problem, and the request log makes the actual cause traceable to a single
missing field.

---

## What was found

Three consecutive calls from one test run, in order:

```
GET /api/v1/team?department=6a7178421c73966a2997d72b&status=ACTIVE
→ 500 (1231ms)
{
  "success": false,
  "errorName": "TypeError",
  "message": "Cannot read properties of undefined (reading 'department')",
  "errors": []
}
```

```
POST /api/v1/document
→ 201 (2956ms)
{
  "success": true,
  "message": "Document created successfully",
  "data": {
    "title": "TEST",
    "department": "6a7178421c73966a2997d72b",
    "team": null,
    "status": "DRAFT",
    "_id": "6a7f0732e9b609566550a400",
    ...
  }
}
```

```
POST /api/v1/workflow/6a7f0732e9b609566550a400/submit
→ 400 (1516ms)
{
  "success": false,
  "errorName": "Error",
  "message": "Unable to determine next workflow authority.",
  "errors": []
}
```

## Why this happens

The document was created with `"team": null`. Per `WORKFLOW_MODULE.md`,
reviewer routing is `Employee → Team → Team.teamLead` — the next reviewer is
resolved from the document's team, specifically that team's assigned team
lead. With no team on the document, there is no team lead to route to, so
the workflow-submit handler correctly has nothing to resolve and returns
this error.

The document has no team not because the user left it blank by choice, but
because the Team dropdown had nothing to offer: the first call in the log
above, `GET /team?department=&status=ACTIVE`, 500s. This is the same bug
already reported in
[`DOCUMENT_TEAM_WORKFLOW_SERVER_ERRORS.md`](./DOCUMENT_TEAM_WORKFLOW_SERVER_ERRORS.md)
(§2) — it was never fixed, only the separate `documentService.createDocument`
bug (§1 of that document) was. Every department-scoped team lookup still
fails, so every document created through the UI right now gets `team: null`,
and every workflow submission on such a document will hit this same 400.

## Impact

Submit-for-review is completely blocked for any document created since the
team lookup started failing — which, as far as this testing can tell, is
all of them. This isn't a separate defect to schedule; it's the practical
consequence of §2 in the existing bug report, and it raises that bug's
severity: it doesn't just break a dropdown, it blocks the entire approval
workflow from ever starting.

## What to fix

Fix `GET /team?department=&status=ACTIVE` (already described in
`DOCUMENT_TEAM_WORKFLOW_SERVER_ERRORS.md` §2). No separate change should be
needed here — once documents can actually be created with a team attached,
this workflow-submit error should resolve on its own, since the routing
logic itself is doing the right thing given the input it's currently
getting.

If it's useful as a secondary safeguard: consider whether `POST
/workflow/:id/submit` should return a clearer, field-specific error (e.g.
"This document has no team assigned — submission requires a team lead to
route to") instead of the current message, so a team-less document fails
with an actionable reason rather than a routing-internals message. This is
a nice-to-have, not a substitute for fixing the underlying team lookup.
