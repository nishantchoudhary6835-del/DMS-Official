# Workflow submit fails with "Unable to determine next workflow authority"

**Status:** Confirmed by elimination as of 2026-08-16 — see the update below.
This needs a backend-side check of the Super Admin test account's Employee
record. Nothing here is fixable from the frontend repo.

**Correction (2026-08-15):** the original version of this document attributed
the error to the created document having `"team": null`. Re-reading
`WORKFLOW_MODULE.md` §4 shows that's wrong — submit routing never reads the
document's `team` field. It resolves the reviewer from the *submitting
user's own Employee record*. The "Why this happens" and "What to fix"
sections below have been corrected accordingly.

**Update (2026-08-16):** the document-side theory is now ruled out, not just
suspected. `GET /team` was fixed since the correction above (confirmed —
every variant now returns 200), so a full retest was run: a team was created
and given a real `teamLead` (`Amit Shinde`, `TEAM_LEAD`), a fresh document
was created attached to that fully-populated team, and submit was retried
three times against two separate documents. All three attempts failed with
the identical 400. With the document's team and that team's lead both
verifiably correct, the only remaining variable per §4's routing chain is
`superadmin@dms.com`'s own `Employee.team` — which is almost certainly unset,
since Super Admin sits outside the normal department/team hierarchy by
design. See the reproduction below.

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

### Retest with a fully-populated document team (2026-08-16)

```
POST /api/v1/team → 201, teamLead: null   (team created)
PATCH /api/v1/team/<id> → 200, teamLead: { hierarchyLevel: "TEAM_LEAD", ... }  (lead assigned)

POST /api/v1/document → 201, "team": "<the team above, now with a real lead>"
POST /api/v1/workflow/<that document's id>/submit
→ 400 (1279ms)
{ "success": false, "errorName": "Error",
  "message": "Unable to determine next workflow authority.", "errors": [] }

POST /api/v1/document → 201 (a second, fresh document, same fully-populated team)
POST /api/v1/workflow/<that document's id>/submit
→ 400 (1315ms)
{ "success": false, "errorName": "Error",
  "message": "Unable to determine next workflow authority.", "errors": [] }
```

Same error, twice more, against documents whose team assignment is no longer
in question — real team, real active `teamLead`. This is what upgrades the
theory below from "likely" to confirmed by elimination.

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
visible on the first created document in the log above looked like a
plausible cause originally, but the 2026-08-16 retest (above) ran the exact
same submit against a document with a fully-populated team and lead and got
the identical failure — so the document's team was never the actual cause,
just a correlated symptom of the same `GET /team` outage that has since been
fixed.

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

Every document created and submitted while logged in as `superadmin@dms.com`
fails at the submit step — confirmed across four separate documents now,
regardless of how the document's own team/department is set up. Since Super
Admin sits outside the normal department/team hierarchy, this account may
never be able to hold an `Employee.team` value at all, which would mean
submit-for-review is **structurally impossible from the Super Admin account
specifically** — not a data-entry gap that can be fixed by editing a record,
but a mismatch between how this account is modeled and what §4's routing
requires. Whether normal Employee accounts (with a real team assigned) can
submit successfully is still unverified from the frontend — that's the next
thing to test, by assigning a team to an existing employee (e.g. via Edit
Employee → Team, confirmed settable in the UI) and submitting from that
account instead.

## What to fix

`GET /team` (previously 500ing on every call, see
[`TEAM_LIST_ENDPOINT_ERROR.md`](./TEAM_LIST_ENDPOINT_ERROR.md)) appears
fixed as of 2026-08-16 — every variant returned 200 in this session. That
was a prerequisite for testing this issue at all, but fixing it did not fix
submit itself, confirming this is a separate, still-open problem.

What's actually needed: a backend-side check of whether
`superadmin@dms.com`'s Employee record has a `team` assigned, and if Super
Admin accounts are expected to have one at all. If the intent is that Super
Admin can create and submit documents like any other employee, either that
account needs a team assigned, or §4's routing needs an explicit exception
for the Super Admin level (e.g. skip straight to a level that doesn't
require a team lookup). If Super Admin is never meant to submit documents
for review in the first place, that's a product decision worth confirming
explicitly rather than leaving as an unexplained 400.

If it's useful as a secondary safeguard: consider whether `POST
/workflow/:id/submit` should return a clearer, field-specific error (e.g.
"This document has no team assigned — submission requires a team lead to
route to") instead of the current message, so a team-less document fails
with an actionable reason rather than a routing-internals message. This is
a nice-to-have, not a substitute for fixing the underlying team lookup.
