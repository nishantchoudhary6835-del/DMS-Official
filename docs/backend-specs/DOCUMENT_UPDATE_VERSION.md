# EGKMS — Document Update & Version Quick Guide

This guide explains the newly implemented document update flow.

```text
DRAFT / REVISION
   ↓ PATCH Document
Update metadata/file
   ↓
New Version Created
   ↓
v1.1 / v1.2 / ...
   ↓
Refresh document
   ↓
Submit through Workflow when ready
```

## Frontend Rules

- Use the Document MongoDB `_id` in the update URL.
- Send only fields accepted by the update validator.
- Send `department` and `team` as MongoDB ObjectIds.
- Do not send `owner`, `createdBy`, `status`, or `currentVersion`.
- Use `multipart/form-data` when replacing the file.
- After a successful update, refresh the document and display the returned `currentVersion`.
- The backend, not React, calculates the next version.

## Example

```text
v1.0
 → PATCH
v1.1
 → Submit
PENDING_REVIEW
```
