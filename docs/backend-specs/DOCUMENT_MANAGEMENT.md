# EGKMS — Document Management Module

## 1. Module Overview

The Document Management module handles document creation, file upload, ownership, document updates, and version creation.

Current implemented lifecycle covered by this module:

```text
Authenticated User
        ↓
Create Document
        ↓
DRAFT
        ↓
v1.0
        ↓
Update Document
        ↓
New Version Created
        ↓
v1.1 / v1.2 / ...
        ↓
Submit for Workflow Review
```

> **Storage Note:** The FRS specifies an AWS S3 Private Bucket as the final storage technology. Cloudinary is currently used by the development/testing implementation. Do not change the current storage integration unless the project decision is to migrate it to S3.

---

## 2. Create Document API

**Method:** `POST`

**Endpoint:**

```text
/api/v1/document
```

The API creates a document and uploads its file.

### Authentication

The API requires authentication. The project uses the existing HttpOnly-cookie authentication flow.

Frontend:

```javascript
await axios.post("/api/v1/document", formData, {
  withCredentials: true
});
```

Do not manually send an `Authorization` header when using the project's HttpOnly-cookie flow unless the backend deployment configuration specifically requires it.

---

## 3. Create Request Format

Because a real file is uploaded, use:

```text
multipart/form-data
```

Postman:

```text
Body → form-data
```

Fields:

| Key | Type | Required | Description |
|---|---|---:|---|
| `file` | File | Yes | PDF/DOCX/etc. supported by current upload validation |
| `title` | Text | Yes | Document title |
| `description` | Text | As required by validator | Document description |
| `documentType` | Text | Yes | Example: `POLICY` |
| `department` | Text | Yes | Department MongoDB `_id` |
| `team` | Text | Optional | Team MongoDB `_id` |

Example:

```text
file          → EmployeeLeavePolicy.pdf
title         → Employee Leave Policy
description   → Company employee leave policy
documentType  → POLICY
department    → 6a7178421c73966a2997d72b
team          → 6a79a5240bfaf71ffa3e23d7
```

**Important:** send MongoDB ObjectIds, not department/team names.

---

## 4. File Upload

The current route uses:

```javascript
upload.single("file")
```

Therefore the file field must be exactly:

```text
file
```

Current development flow:

```text
Selected File
     ↓
FormData
     ↓
Multer
     ↓
Cloudinary
     ↓
File URL / Public ID
     ↓
MongoDB Document
```

The frontend does not upload directly to Cloudinary.

---

## 5. Document Ownership

The frontend must **not** send the document owner.

Backend derives ownership from the authenticated account:

```text
Authenticated User
        ↓
User.employeeId
        ↓
Employee
        ↓
Document.owner
```

The backend also controls `createdBy`.

Do not manually send:

```text
owner
createdBy
status
currentVersion
```

---

## 6. Department and Team Validation

Department:

```text
Department
    ↓
exists
    ↓
ACTIVE
```

Team, when supplied:

```text
Team
    ↓
exists
    ↓
ACTIVE
    ↓
belongs to selected Department
```

Example:

```text
Information Technology
        ↓
Frontend Engineering
        ↓
Document
```

If the Team does not belong to the selected Department, the request is rejected.

---

## 7. Initial Document State

After successful creation:

```text
status = DRAFT
currentVersion = v1.0
```

Create and Submit are separate operations.

```text
POST /api/v1/document
        ↓
DRAFT
        ↓
POST /api/v1/workflow/:documentId/submit
        ↓
Workflow starts
```

---

# 8. Update Document + Version Creation

## Purpose

When an editable document is changed after creation, the current implementation creates a **new document version**.

Example:

```text
Existing
v1.0
  ↓
Update
  ↓
New Version
v1.1
```

A later update can produce:

```text
v1.1
  ↓
Update
  ↓
v1.2
```

The API response confirms this behavior with:

```text
Document updated and new version created successfully.
```

### Important frontend rule

The frontend should treat the returned `currentVersion` as the source of truth.

Do not calculate the next version number in React.

Backend controls:

```text
currentVersion
fileUrl
filePublicId
fileName
fileType
fileSize
updatedAt
```

---

## 9. Update Document API

Use the update endpoint exposed by the current Document routes.

**Method:** `PATCH`

**Endpoint pattern:**

```text
/api/v1/document/:documentId
```

> Use the exact route registered in the current backend if your route prefix differs.

The `:documentId` is the MongoDB `Document._id`.

Example:

```text
6a7f011ae39b2059de652fcd
```

### Request

If a new file is being uploaded, use:

```text
multipart/form-data
```

Postman:

```text
Body → form-data
```

Typical fields:

```text
title
description
documentType
department
team
file
```

Only send fields that the update validator accepts. Do not send backend-controlled fields such as `owner`, `createdBy`, or `currentVersion`.

### Example update

```text
title:
Employee Leave Policy - Updated

description:
Updated company employee leave policy with revised leave rules

documentType:
POLICY

department:
6a7178421c73966a2997d72b

team:
6a79a5240bfaf71ffa3e23d7

file:
UpdatedPolicy.pdf
```

### Result

Expected behavior:

```text
Document
    ↓
Updated metadata/file
    ↓
New version
    ↓
currentVersion = v1.1
```

---

## 10. Update + Workflow Relationship

Updating a document and submitting it for review are separate actions.

```text
DRAFT
  ↓
Update
  ↓
v1.1
  ↓
Submit
  ↓
Workflow PENDING_REVIEW
```

When a reviewer returns a document for revision:

```text
PENDING_REVIEW
      ↓
RETURN
      ↓
REVISION
      ↓
Owner edits document
      ↓
New version
      ↓
Resubmit
      ↓
PENDING_REVIEW
```

The frontend should refresh the document after a successful update and should display the returned `currentVersion`.

---

## 11. Document Status vs Workflow Status

These are different fields.

### Document status

Examples:

```text
DRAFT
SUBMITTED
REVISION
PUBLISHED
```

### Workflow status

Examples:

```text
PENDING_REVIEW
REVISION
REJECTED
COMPLETED
```

Do not use the workflow status as the document status.

Example:

```text
Document.status = REVISION
Workflow.status = REVISION
```

After successful resubmission:

```text
Document.status = SUBMITTED
Workflow.status = PENDING_REVIEW
```

After final publication:

```text
Document.status = PUBLISHED
Workflow.status = COMPLETED
```

---

## 12. Submit for Review

The Document Management module does not decide the reviewer.

Use:

```http
POST /api/v1/workflow/:documentId/submit
```

Flow:

```text
Document = DRAFT / REVISION
        ↓
Submit
        ↓
Workflow finds Employee
        ↓
Employee → Team
        ↓
Team → Team Lead
        ↓
PENDING_REVIEW
```

---

## 13. Frontend Create Example

```javascript
const formData = new FormData();

formData.append("title", title);
formData.append("description", description);
formData.append("documentType", documentType);
formData.append("department", departmentId);

if (teamId) {
  formData.append("team", teamId);
}

formData.append("file", selectedFile);

await axios.post("/api/v1/document", formData, {
  withCredentials: true
});
```

Do not manually set:

```text
Content-Type: multipart/form-data
```

when using browser `FormData` with Axios. The browser must create the multipart boundary.

---

## 14. Frontend Update Example

```javascript
const formData = new FormData();

formData.append("title", title);
formData.append("description", description);
formData.append("documentType", documentType);
formData.append("department", departmentId);

if (teamId) {
  formData.append("team", teamId);
}

if (selectedFile) {
  formData.append("file", selectedFile);
}

await axios.patch(
  `/api/v1/document/${documentId}`,
  formData,
  {
    withCredentials: true
  }
);
```

After success:

```text
Refresh document data
        ↓
Read currentVersion
        ↓
Display new version
```

---

## 15. Frontend Responsibilities

```text
Create Form
    ↓
Collect title/description/type
    ↓
Select Department._id
    ↓
Select Team._id
    ↓
Select File
    ↓
Create FormData
    ↓
POST Create API
    ↓
Show DRAFT
```

For editing:

```text
Open Document
    ↓
Edit allowed fields
    ↓
Optionally select replacement file
    ↓
PATCH Document
    ↓
New Version Created
    ↓
Refresh Document
    ↓
Display currentVersion
```

For submission:

```text
Click Submit for Review
    ↓
POST /workflow/:documentId/submit
    ↓
Show PENDING_REVIEW
    ↓
Show current reviewer/current level from workflow response
```

---

## 16. Backend Controlled Fields

Frontend should not decide:

```text
owner
createdBy
status
currentVersion
workflow reviewer
workflow currentLevel
workflow approval result
```

Backend determines these values.

---

## 17. Current API / Flow Reference

```text
POST /api/v1/document
    → Create Document
    → DRAFT
    → v1.0

PATCH /api/v1/document/:documentId
    → Update Document
    → Create New Version
    → v1.1 / v1.2 / ...

POST /api/v1/workflow/:documentId/submit
    → Start Review Workflow
```

---

## 18. Common Errors

### Invalid Department ObjectId

Send:

```text
department = Department._id
```

Not:

```text
department = "Information Technology"
```

### Invalid Team ObjectId

Send:

```text
team = Team._id
```

Not:

```text
team = "Frontend Engineering"
```

### File required

Use:

```text
Key: file
Type: File
```

### Owner should not be sent

The backend derives the owner from the authenticated account.

### Version should not be sent

The backend creates the next version.

---

## 19. Current Implementation Status

```text
Document Model              ✅
Document Validator          ✅
Document Service            ✅
Document Controller         ✅
Document Routes             ✅
Multer                      ✅
Cloudinary Upload           ✅
Create Document              ✅
DRAFT Creation               ✅
Version v1.0                 ✅
Document Update               ✅
New Version Creation          ✅
Version Increment             ✅
Submit Integration             ✅
```

> **Frontend note:** this status table is the backend's own account of itself. `POST /document` (create) has been directly, live-tested from this frontend and is confirmed working (201, per `WORKFLOW_SUBMIT_MISSING_TEAM.md`'s 2026-08-16 log) — the earlier `documentService.createDocument is not a function` 500 documented in `DOCUMENT_TEAM_WORKFLOW_SERVER_ERRORS.md` is resolved as of that retest. `PATCH /document/:documentId` (update/versioning) has not yet been exercised from this app. No document **list** or **detail** GET route is documented anywhere in this file, so a Document List/Detail screen still cannot be built against a confirmed contract.

---

## 20. FRS Alignment

The FRS requires document ownership, controlled document lifecycle, version control, workflow/approval, auditability, access control, and publishing.

Current implementation covered here:

```text
Create
  ↓
DRAFT
  ↓
Update
  ↓
New Version
  ↓
Submit
  ↓
Workflow
```

The FRS defines the broader lifecycle:

```text
Draft
  ↓
Submitted
  ↓
Review
  ↓
Revision
  ↓
Approved
  ↓
Published
  ↓
Active / Commenced
  ↓
Amendment
  ↓
Version Update
  ↓
Archived
```

Not every lifecycle state is handled by the Create/Update API itself. Workflow and lifecycle APIs are responsible for their respective transitions.

---

## 21. Quick Frontend Checklist

```text
Create:
[ ] Use multipart/form-data
[ ] File key = file
[ ] Send Department._id
[ ] Send Team._id when applicable
[ ] Do not send owner
[ ] Do not send createdBy
[ ] Do not send status
[ ] Do not send currentVersion

Update:
[ ] Use document MongoDB _id in URL
[ ] Send only allowed editable fields
[ ] Upload replacement file only when needed
[ ] Do not send currentVersion
[ ] Refresh after success
[ ] Display returned currentVersion

Submit:
[ ] Use Workflow submit API
[ ] Do not choose reviewer manually
[ ] Read currentReviewer/currentLevel from workflow response
```

---

# 22. Summary

The Document Management module now supports both **document creation** and **document updating with new version creation**.

Frontend developers should remember:

```text
Document._id
      ↓
used for update and workflow submit

Department._id
      ↓
send as department

Team._id
      ↓
send as team

currentVersion
      ↓
backend controlled

owner
      ↓
backend controlled
```
