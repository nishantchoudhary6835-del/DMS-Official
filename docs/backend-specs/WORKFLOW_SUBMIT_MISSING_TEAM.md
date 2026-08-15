# Workflow submit fails with "Unable to determine next workflow authority"

**Status:** Confirmed, but see the correction below — this needs a backend
check, not just the already-reported team-lookup fix. Nothing here is
fixable from the frontend repo.

**Correction (2026-08-15):** the original version of this document attributed
the error to the created document having `"team": null`. Re-reading
`WORKFLOW_MODULE.md` §4 shows that's wrong — submit routing never reads the
document's `team` field. It resolves the reviewer from the *submitting
user's own Employee record*. The "Why this happens" and "What to fix"
sections below have been corrected accordingly.

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

Per `WORKFLOW_MODULE.md` §4, submit routing does **not** read the document's
`team` field at all. It resolves the next reviewer from the *submitting
user's own Employee record*:

```
Authenticated User → User.employeeId → Employee → Employee.team → Team.teamLead
```

So "Unable to determine next workflow authority" means the account that
submitted (`superadmin@dms.com` in this test run) has no `team` assigned on
its Employee record, or that team has no `teamLead` set. The `"team": null`
visible on the created document in the log above is a red herring for this
particular error — it's caused by the same broken `GET /team` lookup, but
through an unrelated path, since document.team isn't what submit reads.

`WORKFLOW_MODULE.md` §27 ("Important Test Data") lists exactly this as a
prerequisite to check before testing:

```
Employee.team    → correct Team
Team.teamLead    → correct Team Lead
```

and warns "incorrect hierarchy relationships can cause incorrect routing."
Whether the Super Admin test account actually has a team assigned isn't
something the frontend can see or fix — it needs a backend-side check of
that Employee record.

## Impact

Unknown scope from the frontend side. If `superadmin@dms.com`'s Employee
record has no team (or its team has no teamLead), submit will fail for
every document that account creates, regardless of the document's own
`team` field. Whether this also affects other/normal Employee accounts
depends on whether their Employee.team is correctly set — can't be
determined without backend-side data.

## What to fix

Two separate things, not one:

1. `GET /team` still 500s on every call, not just department-scoped ones
   (already reported in
   [`TEAM_LIST_ENDPOINT_ERROR.md`](./TEAM_LIST_ENDPOINT_ERROR.md)) — worth
   fixing regardless, since it breaks the Team list screen and every team
   dropdown, not just document creation.
2. Independently, verify `superadmin@dms.com`'s Employee record has a `team`
   assigned, and that team has a `teamLead`. If not, submit-for-review will
   keep failing with this exact error even after (1) is fixed, since per §4
   the routing logic never looks at the document's team — only the
   submitter's.

If it's useful as a secondary safeguard: consider whether `POST
/workflow/:id/submit` should return a clearer, field-specific error (e.g.
"This document has no team assigned — submission requires a team lead to
route to") instead of the current message, so a team-less document fails
with an actionable reason rather than a routing-internals message. This is
a nice-to-have, not a substitute for fixing the underlying team lookup.
