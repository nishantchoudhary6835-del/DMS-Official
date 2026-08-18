# EGKMS — Document Management Module Documentation

## 1. Module Overview

The Document Management module is responsible for creating, viewing, updating, versioning, archiving, restoring, and deleting documents according to the EGKMS access-control and lifecycle rules.

The module works together with the Workflow module:

```text
Document
   ↓
DRAFT
   ↓
Submit for Review
   ↓
Workflow
   ↓
Revision / Approval / Rejection
   ↓
Document Lifecycle
   ↓
Published / Active / Archived
```

The Document module does **not** duplicate workflow routing logic. Reviewer assignment, approval, return, rejection, resubmission, reminders, escalation, and final workflow approval remain in the Workflow module.

---

## 2. Module Files

```text
document/
├── document.model.js
├── documentVersion.model.js
├── document.validator.js
├── document.service.js
├── document.controller.js
└── document.routes.js
```

| File | Responsibility |
|---|---|
| `document.model.js` | Main document schema |
| `documentVersion.model.js` | Stores previous/current document versions |
| `document.validator.js` | Validates request data |
| `document.service.js` | Business logic and database operations |
| `document.controller.js` | Handles HTTP requests/responses |
| `document.routes.js` | Defines endpoints and middleware |

---

## 3. Request Flow

```text
Frontend / Postman
        ↓
Route
        ↓
authenticate
        ↓
accessControl(resource, action)
        ↓
Validation
        ↓
Controller
        ↓
Service
        ↓
MongoDB / File Storage
        ↓
Response
```

The frontend should not contain business rules such as reviewer routing or version-number calculation.

---

## 4. Authentication

Uses the existing HttpOnly-cookie flow. Do not manually calculate or manage the access/refresh token in the Document module.

---

## 5. Access Control

```javascript
accessControl("DOCUMENT", "ACTION")
```

Expected permission actions: `DOCUMENT.CREATE`, `DOCUMENT.VIEW`, `DOCUMENT.EDIT`, `DOCUMENT.DELETE`, `DOCUMENT.ARCHIVE`, `DOCUMENT.RESTORE`. The actual Permission/RolePermission records must exist in the database before these endpoints can be used.

---

## 6. API Summary

| Method | Endpoint | Purpose |
|---|---|---|
| `POST` | `/document` | Create document |
| `GET` | `/document` | Get accessible documents |
| `GET` | `/document/:documentId` | Get one document |
| `PATCH` | `/document/:documentId` | Update document + create new version |
| `GET` | `/document/:documentId/versions` | Get version history |
| `PATCH` | `/document/:documentId/status` | Lifecycle/status transition |
| `PATCH` | `/document/:documentId/archive` | Archive document |
| `PATCH` | `/document/:documentId/restore` | Restore archived document |
| `DELETE` | `/document/:documentId` | Delete according to access/lifecycle rules |

---

## 7. Create Document

`POST /api/v1/document`, `multipart/form-data`.

Fields: `file`, `title`, `description`, `documentType` (e.g. `POLICY`), `department` (ObjectId), `team` (ObjectId).

Do not send backend-controlled values: `owner`, `createdBy`, `status`, `currentVersion`.

Initial state: `status = DRAFT`, `currentVersion = v1.0`.

---

## 8. Department and Team References

Send MongoDB ObjectIds, never names. The backend validates that the selected Team belongs to the selected Department.

---

## 9. Get Documents

`GET /api/v1/document` — returns documents accessible to the authenticated user per existing access control. Supports `search`, `documentType`, `status`, `department`, `team`, `page`, `limit`. The frontend should not assume the user can see every document in the database.

---

## 10. Get Document by ID

`GET /api/v1/document/:documentId` — for Document Details, Preview, Edit Screen, Workflow Information, Version Information.

---

## 11. Update Document

`PATCH /api/v1/document/:documentId`, `multipart/form-data` if a replacement file is supplied. Do not send `owner`, `createdBy`, `currentVersion`.

---

## 12. Update and Version Creation

Every successful document modification creates a new version (`v1.0 → v1.1 → v1.2`). The old version is preserved in `DocumentVersion`. The frontend must use the `currentVersion` returned by the backend instead of calculating the next version itself.

---

## 13. Revision and Update Flow

```text
PENDING_REVIEW
      ↓ RETURN
REVISION
      ↓ Document Owner
PATCH Document → New Version
      ↓ Resubmit
PENDING_REVIEW
```

Document update and Workflow resubmission are separate API operations.

---

## 14. Version History

`GET /api/v1/document/:documentId/versions` — each version can contain `version`, `fileUrl`, `filePublicId`, `fileName`, `fileType`, `fileSize`, `createdBy`, `createdAt`.

---

## 15. Status / Lifecycle

Document lifecycle states: `DRAFT`, `SUBMITTED`, `REVIEW`, `REVISION`, `APPROVED`, `PUBLISHED`, `ACTIVE`, `AMENDMENT`, `ARCHIVED`.

Workflow states (`PENDING_REVIEW`, `REVISION`, `REJECTED`, `COMPLETED`) are a **separate field** from Document status — do not conflate them.

---

## 16. Workflow Integration

The Document module does not decide the next reviewer. Submission remains `POST /api/v1/workflow/:documentId/submit`, routed Team Lead → Manager → Department Head → Executive → Governance → Published.

---

## 17. Archive

`PATCH /api/v1/document/:documentId/archive` → moves an eligible document to `ARCHIVED`. Must not silently archive a document in an invalid lifecycle state.

---

## 18. Restore

`PATCH /api/v1/document/:documentId/restore`. Frontend should refresh the document after a successful restore.

---

## 19. Delete

`DELETE /api/v1/document/:documentId`. Must respect ACL permission, ownership/role rules, and lifecycle state. Should not casually delete historical versions or audit information — archival is preferred over physical deletion where governance requires preservation.

---

## 20. File Upload

`upload.single("file")` — field name must be `file`. Frontend does not directly manage the storage provider (S3 per FRS; Cloudinary in the current dev implementation).

---

## 21–23. Frontend Examples & Rules

Standard `FormData` create/update pattern already implemented in `src/services/document.js`. Do not manually set the multipart boundary.

**Send:** `department`/`team`/`documentId` as `_id`s, `file` as the selected File.
**Never send:** `owner`, `createdBy`, `currentVersion`, workflow reviewer, workflow currentLevel, next reviewer.

---

## 24. Error Handling

Standard `400`/`401`/`403`/`404`/`409`/`500` contract, same as every other module.

---

## 25. Postman Testing Order

```text
Login → Create → Get All → Get by ID → Update → Check currentVersion →
Version History → Submit → Return for Revision → Update → New version →
Resubmit → Complete Workflow → Archive → Restore → Delete
```

---

## 26–30. Version Testing, Complete Flow, Responsibility Separation, FRS Alignment

See full flow diagram in module overview. Document module owns document data/file/ownership/version/lifecycle/archive/restore/delete; Workflow module owns submit/routing/approve/return/reject/resubmit/reminders/escalation/publish; Audit module owns logging both (frontend must not create audit records itself).

---

## 31. Important Developer Notes

1. Do not calculate versions in React.
2. Do not choose reviewers in React.
3. Do not send owner/createdBy from the frontend.
4. Always use MongoDB `_id` for Department and Team references.
5. Refresh document data after update.
6. Refresh workflow data after submit/review/resubmit.
7. Treat `currentReviewer: null` as a valid state.
8. Treat `currentVersion` as backend-controlled.
9. Do not delete old versions during an update.
10. Do not bypass ACL middleware.
11. Do not duplicate Workflow logic inside Document.
12. Do not create audit records from the frontend.

---

## 32. Quick API Reference

```text
POST   /api/v1/document
GET    /api/v1/document
GET    /api/v1/document/:documentId
PATCH  /api/v1/document/:documentId
GET    /api/v1/document/:documentId/versions
PATCH  /api/v1/document/:documentId/status
PATCH  /api/v1/document/:documentId/archive
PATCH  /api/v1/document/:documentId/restore
DELETE /api/v1/document/:documentId

POST /api/v1/workflow/:documentId/submit
GET  /api/v1/workflow/pending
GET  /api/v1/workflow/my-submissions
POST /api/v1/workflow/:workflowId/review
POST /api/v1/workflow/:workflowId/resubmit
```

---

> **Frontend note (added here, not in the backend's original doc):** this is
> the backend team's own account of itself, supplied 2026-08-18, superseding
> `DOCUMENT_MANAGEMENT.md`'s explicit statement that no list/detail GET route
> was documented. `POST /document` and `PATCH /document/:id` are the only two
> endpoints from this table that have ever been exercised against the live
> backend from this app (see `DOCUMENT_MANAGEMENT.md` §19's frontend note and
> `WORKFLOW_SUBMIT_MISSING_TEAM.md`). `GET /document`, `GET /document/:id`,
> `GET /document/:id/versions`, `PATCH /document/:id/status`,
> `PATCH /document/:id/archive`, `PATCH /document/:id/restore`, and
> `DELETE /document/:id` are all net-new and unverified live — treat them as
> "documented" not "confirmed" until each is actually called and its response
> observed, same standard applied to every other spec in this folder.
