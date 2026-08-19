# Super Admin gets 403 "Employee information not found." on every `authorize("SUPER_ADMIN")` route

## Symptom

Logged in as `superadmin@dms.com` (`SA-001`, `SUPER_ADMIN`), every single call
this session to the four endpoints gated by `authorize("SUPER_ADMIN")`
(`role.middleware.js`) returned `403`:

```json
{ "success": false, "message": "Employee information not found." }
```

Confirmed 100% reproducible — every occurrence in this session's request log
(9 calls across `GET /user`, `GET /acl`, `GET /role-permission`,
`GET /permission`), zero successes:

```text
GET /api/v1/user            -> 403 "Employee information not found."
GET /api/v1/acl              -> 403 "Employee information not found."
GET /api/v1/role-permission  -> 403 "Employee information not found."
GET /api/v1/permission       -> 403 "Employee information not found."
```

In the same session, from the same logged-in account, `GET /employee`,
`GET /department`, `GET /team`, `GET /hierarchy` all return `200` normally.

## Root cause (traced against `kirangawande39/DMS`, branch `develop`)

`req.employee` is set in exactly one place and read in exactly one place in
the whole codebase:

**Set** — `src/middleware/auth.middleware.js`:
```javascript
const authenticate = (req, res, next) => {
  passport.authenticate("jwt", { session: false }, (error, user, info) => {
    ...
    req.user = user;

    // Passport attaches current employee information to the authenticated user.
    if (user._employee) {
      req.employee = user._employee;
    }

    next();
  })(req, res, next);
};
```

`user._employee` is itself set inside the JWT passport strategy in
`src/config/passport.js`:
```javascript
const employee = await Employee.findById(user.employeeId).select(
  "_id employeeId firstName lastName hierarchyLevel department team status"
);
if (!employee) return done(null, false);
if (employee.status !== "ACTIVE") return done(null, false);
user._employee = employee;
return done(null, user);
```

**Read** — `src/middleware/role.middleware.js`'s `authorize(...allowedLevels)`:
```javascript
const employee = req.employee;
if (!employee) {
  return res.status(403).json({ success: false, message: "Employee information not found." });
}
```

Every route gated with `authorize("SUPER_ADMIN")` — `user.routes.js`,
`permission/acl/acl.routes.js`, `permission/permission/permission.routes.js`,
`permission/rolePermission/rolePermission.routes.js` — depends on
`req.employee` being set. Every route gated with `accessControl(resource,
action)` instead (`employee.routes.js`, `department.routes.js`,
`team.routes.js`, `document.routes.js`, `workflow.routes.js`) does **not** —
`accessControl.middleware.js` reads `req.user.employeeId` directly and does
its own `checkAccess` lookup, never touching `req.employee` at all. That's
why this bug is completely invisible on every other module: `req.employee`
being broken has zero effect on any route that doesn't specifically read it,
and `authorize("SUPER_ADMIN")` is the only consumer in the entire codebase.

Since the exact same `authenticate` middleware runs before both kinds of
routes, and `GET /employee`/`GET /department` (accessControl-gated) succeed
for this account in the same session — proving passport's JWT strategy does
run and does authenticate this account successfully — the failure has to be
specifically in whether `user._employee` survives to be readable as
`req.employee` by the time `authorize()` runs. This local clone's source
reads as logically correct on paper, so either the deployed instance
(`https://dms-s32w.onrender.com`) is running different code than this
`develop` checkout, or there's a runtime behavior (Mongoose document
property assignment, some request-scope issue) not obvious from static
reading. Recommend adding a log line right before the `if (!employee)`
check in `role.middleware.js` to see what `req.employee` actually is at that
point in production.

## Impact

Super Admin cannot access **Users/Accounts, Permissions, Role Assignments,
or Access Rules** at all — every request 403s before the hierarchy check
even runs. This is a hard block, not a scoping issue: there is no
frontend-side workaround, since the account is being told its own employee
record can't be found regardless of what it requests.

## Not a frontend bug

Nothing in this app calls these four endpoints any differently than
`GET /employee`/`GET /department`, which work fine for the same account.
`src/components/shell/navigation.js`'s sidebar entries for these four
screens are unchanged from when they last worked; this needs a backend fix.
