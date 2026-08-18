# `POST /document` — ACL scope never resolves for multipart requests

## Symptom

`POST /api/v1/document` returns `403` with:

```json
{ "success": false, "message": "No active ACL (Access Control List) rule found." }
```

...even when an `ACTIVE`, `ALLOW` ACL rule exists that exactly matches the
caller's `hierarchyLevel`, `department`, and `team`. Confirmed live and
reproduced with a full paper trail (account `EMP-007`, `INTERN`,
department "Information Technology", team "TEST Engineering") — every
field of the ACL rule and the employee's own record matched exactly
(hierarchy, department, team, both `ACTIVE`), and the request still failed.

## Root cause

In `src/modules/document/document.routes.js`, the create route ran:

```js
router.post(
  "/",
  authenticate,
  accessControl("DOCUMENT", "CREATE"),
  upload.single("file"),
  validate(createDocumentValidator),
  documentController.createDocument
);
```

`accessControl` runs **before** `upload.single("file")`. The request is
`multipart/form-data`, so `req.body` is empty until multer parses it —
`accessControl.middleware.js` resolves ACL scope from
`req.body?.department` / `req.body?.team` (`document.routes` §L30-44), and
both are `undefined` at the point this middleware runs.

With `departmentId`/`teamId` unresolved, `accessControl.service.js`'s
`checkAccess` (§4.3/§4.4) skips the Team-tier and Department-tier ACL
lookups entirely (both are gated on `teamObjectId`/`departmentObjectId`
being truthy), and falls through to the Global-tier lookup (§4.5), which
requires `department: null, team: null`. A rule scoped to a specific
department/team can never satisfy that query — so it's invisible to this
request no matter how correctly it's configured.

Note this is why a **Global** ACL rule (department/team both blank)
happens to still work: `departmentId`/`teamId` resolving to `null` due to
this bug is exactly what the Global-tier query expects, so Global and
Employee-scoped rules are unaffected. Only Department-scoped and
Team-scoped rules are silently unreachable for this one route.

## Why this wasn't caught earlier

The affected ACL rule (`INTERN + DOCUMENT.CREATE`, department + team
scoped) was created 2026-08-17. Document creation for this same account
worked before that date — almost certainly because whatever rule covered
it before was Global-scoped, which this bug doesn't affect. The bug has
likely always existed in the create route; it only became visible once a
non-global rule became the only match for a given hierarchy/permission
pair.

## Fix

Move `upload.single("file")` before `accessControl(...)` so `req.body` is
populated by the time access control reads it:

```diff
 router.post(
   "/",
   authenticate,
-  accessControl("DOCUMENT", "CREATE"),
   upload.single("file"),
+  accessControl("DOCUMENT", "CREATE"),
   validate(createDocumentValidator),
   documentController.createDocument
 );
```

Applied and verified to at least compile against a local clone of
`kirangawande39/DMS` (branch `develop`) — not deployed, since this
account only has read access to that repo. `PATCH /:documentId` (update)
has the identical ordering today but is not confirmed broken the same
way: `req.params.documentId` is present before multer runs, so
`checkAccess`'s document-context resolution (§4.1) can derive
department/team from the *existing* document record even when the
request body isn't parsed yet. Worth the same reorder for consistency and
because an edit should arguably be checked against the *new*
department/team being submitted, not silently falling back to the old
one — but that changes behavior in a way that hasn't been tested live, so
treat it as a secondary follow-up, not bundled with this fix.

## Immediate workaround (no deploy required)

Until this ships, any ACL rule scoped to a specific department or team is
effectively unusable for `POST /document`. Use a **Global** rule instead
(department, team, and employee all blank) — confirmed to work around the
bug entirely, since the Global-tier query's expectations happen to match
what the broken resolution produces anyway.
