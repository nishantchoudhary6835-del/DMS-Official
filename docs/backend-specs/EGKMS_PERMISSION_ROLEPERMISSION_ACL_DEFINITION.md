# EGKMS Permission, RolePermission & ACL Definition

## 1. Document Overview

**Project:** Enterprise Governance & Knowledge Management System (EGKMS)
**Module:** Permission Management, RolePermission & ACL / Access Control
**Purpose:** Document the permission definitions, hierarchy assignments,
global ACL rules, specific ACL behavior, and testing completed during the
current permission-engine work.

> **Source of truth:** The EGKMS FRS remains the primary source for project
> requirements. The permission matrix below documents the **current
> implemented configuration** and should not be treated as an independent
> requirement.

---

## 2. Permission Engine Overview

```text
Authenticated User
        ↓
Employee / Hierarchy
        ↓
Permission
        ↓
RolePermission
        ↓
ACL
        ↓
ALLOW / DENY
        ↓
Protected API
```

**Permission** — defines what action exists for a resource (`TEAM + CREATE → TEAM.CREATE`).

**RolePermission** — defines which hierarchy level is eligible for that permission (`TEAM.CREATE → TEAM_LEAD`).

**ACL** — defines where/for whom the permission is allowed or denied. Supports Employee-specific, Team-specific, Department-specific, and Global hierarchy-level rules, checked most-specific first:

```text
Employee → Team → Department → Global Hierarchy
```

---

## 3. Supported Hierarchy Levels

```text
SUPER_ADMIN → GOVERNANCE → EXECUTIVE → DEPARTMENT_HEAD → MANAGER →
TEAM_LEAD → EMPLOYEE → INTERN
```

---

## 4. Permission Definition

`RESOURCE + ACTION`. Supported actions: `VIEW`, `CREATE`, `EDIT`, `DELETE`,
`REVIEW`, `APPROVE`, `PUBLISH`, `ARCHIVE`, `RESTORE`. Only an `ACTIVE`
Permission participates in access checks.

---

## 5. Permissions Created

Current seed: 25 permissions (old 6 deleted). Covers `USER`, `EMPLOYEE`,
`DEPARTMENT`, `TEAM` (`VIEW`/`CREATE`/`EDIT`/`DELETE` each) and `DOCUMENT`
(all 9 actions: `VIEW`, `CREATE`, `EDIT`, `DELETE`, `REVIEW`, `APPROVE`,
`PUBLISH`, `ARCHIVE`, `RESTORE`).

---

## 6. Permission Resource Summary

| Resource | VIEW | CREATE | EDIT | DELETE | REVIEW | APPROVE | PUBLISH | ARCHIVE | RESTORE |
|---|---|---|---|---|---|---|---|---|---|
| USER | ✓ | ✓ | ✓ | ✓ | — | — | — | — | — |
| EMPLOYEE | ✓ | ✓ | ✓ | ✓ | — | — | — | — | — |
| DEPARTMENT | ✓ | ✓ | ✓ | ✓ | — | — | — | — | — |
| TEAM | ✓ | ✓ | ✓ | ✓ | — | — | — | — | — |
| DOCUMENT | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |

A permission existing in the Permission collection does **not** automatically
grant access to any hierarchy.

---

## 7. RolePermission Matrix

Seed: 62 RolePermission records created, 0 skipped.

| Hierarchy | Permissions | Count |
|---|---|---|
| SUPER_ADMIN | All 25 | 25 |
| GOVERNANCE | DOCUMENT.VIEW/CREATE/EDIT/DELETE/REVIEW/APPROVE/PUBLISH | 7 |
| EXECUTIVE | DEPARTMENT.VIEW/CREATE, DOCUMENT.VIEW/CREATE/EDIT/DELETE/REVIEW/APPROVE | 8 |
| DEPARTMENT_HEAD | DOCUMENT.VIEW/CREATE/EDIT/DELETE/REVIEW/APPROVE | 6 |
| MANAGER | DOCUMENT.VIEW/EDIT/DELETE/REVIEW/APPROVE | 5 |
| TEAM_LEAD | TEAM.VIEW/CREATE/EDIT, DOCUMENT.VIEW/REVIEW | 5 |
| EMPLOYEE | DOCUMENT.VIEW/CREATE/EDIT | 3 |
| INTERN | DOCUMENT.VIEW/CREATE/EDIT | 3 |
| **TOTAL** | | **62** |

---

## 8. RolePermission Count Verification

Matches the seed result exactly (62 created, 0 skipped) — see table above.

---

## 9. RolePermission Rules

Fields: `hierarchyLevel`, `permission`, `assignedBy`, `status`, `createdAt`,
`updatedAt`. Validation: permission must exist and be `ACTIVE`, hierarchy
level must be valid, duplicate `hierarchyLevel + permission` is rejected
(unique index), record becomes `ACTIVE`.

---

## 10. Global ACL Rules

After the RolePermission matrix, a global ACL seed ran. Global ACL concept:

```text
Hierarchy Level + Permission + department=null + team=null + employee=null
      ↓
ALLOW
```

The global ACL seed reads active RolePermissions and creates the
corresponding global `ALLOW` ACL for each. Example:
`EMPLOYEE + DOCUMENT.CREATE → Global ACL → ALLOW`.

By this same rule, **`INTERN + DOCUMENT.CREATE` should also have a global
ALLOW ACL**, since §7 lists `DOCUMENT.CREATE` as one of INTERN's three
assigned RolePermissions.

---

## 11. ACL Structure

Fields: `hierarchyLevel`, `permission`, `department`, `team`, `employee`,
`effect` (`ALLOW`/`DENY`), `status`, `createdBy`, `createdAt`, `updatedAt`.
Context levels: Global, Department, Team, Employee.

---

## 12. ACL Resolution Priority

Most specific first: Employee-specific → Team-specific → Department-specific
→ Global hierarchy-level. A specific DENY overrides a global ALLOW.

---

## 13. ALLOW / DENY Decision

```text
No active ACL      → DENY
ACL effect = DENY  → DENY
ACL effect = ALLOW → Request continues
```

---

## 14–19. Layer separation, seed/testing results, permission engine status

Permission / RolePermission / Global ACL / ACL Middleware / ALLOW / DENY /
specific-employee-DENY-override are all marked `COMPLETED + TESTED` in this
document, including a documented pass of "Document Authorization" testing
(§16.7) and a full worked example of an EMPLOYEE creating a document via
Global ACL ALLOW (§21) — the same shape of request that INTERN + CREATE
should also satisfy per §10.

---

## 20. Current Gaps / Important Notes (from the source doc)

**No-ACL test:** `No matching active ACL → DENY` is documented as intended
behavior, not a bug — but that also means an accidentally-missing or
accidentally-deactivated global ACL row silently manifests as this same
"no active ACL" denial, indistinguishable from an intentional restriction
without checking the ACL/RolePermission records directly.

---

## Frontend note (added here, not in the source doc) — live discrepancy found 2026-08-18

Tested live against `https://dms-s32w.onrender.com` with account `EMP-007`
(hierarchyLevel `INTERN`, department `Information Technology`, team
assigned) attempting `POST /api/v1/document`:

```json
{
  "success": false,
  "message": "No active ACL (Access Control List) rule found."
}
```
`403`, ~2.4s response time.

Per this spec's own §7.8 and §10, INTERN has `DOCUMENT.CREATE` as an active
RolePermission, and the global ACL seed is documented as generating a
corresponding global `ALLOW` ACL for every active RolePermission — so this
exact request should have succeeded. It previously did succeed for this same
account (`WORKFLOW_SUBMIT_MISSING_TEAM.md`'s 2026-08-16 log, and
`DOCUMENT_MANAGEMENT.md` §19's frontend note both confirm a working
`POST /document` for an intern-level account around that date).

This is either:
1. A regression — the global ALLOW ACL row for `INTERN + DOCUMENT.CREATE`
   was deleted or deactivated sometime between 2026-08-16 and 2026-08-18
   (the ACL module's delete/status-toggle write paths were flagged as
   "unverified" in this repo's own `README.md` at the time — live testing
   of those screens is a plausible cause), or
2. The global ACL seed in §10 was never actually run against this specific
   deployed environment/database, and the document in §16.3/§16.4 describes
   a different environment where it was.

Either way, this is a data-layer fix, not a code fix — every field this
spec describes already has full CRUD support in this app's ACL screens
(`src/services/acl.js`, `CreateAclScreen.jsx`). The fix is to log in as
SUPER_ADMIN, open Access Rules, and confirm whether a rule matching
`hierarchyLevel: INTERN`, `permission: DOCUMENT.CREATE`, `department: null`,
`team: null`, `employee: null`, `effect: ALLOW`, `status: ACTIVE` exists —
create it if missing, reactivate it if deactivated.
