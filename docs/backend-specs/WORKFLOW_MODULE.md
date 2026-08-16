# EGKMS — Workflow / Approval Module Documentation

## 1. Module Overview

The Workflow module manages document submission, reviewer routing, review actions, revision, rejection, resubmission, automatic reminders, automatic escalation, and final publication.

The backend determines the reviewer. The frontend must never manually choose the next reviewer.

---

## 2. FRS-Aligned Normal Approval Flow

The normal document approval hierarchy is:

```text
Employee
   ↓
Team Lead
   ↓
Manager
   ↓
Department Head
   ↓
Executive
   ↓
Governance
   ↓
Published
```

The workflow must not skip organizational levels during the normal approval path.

---

## 3. Important Concepts

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

### Current reviewer

`currentReviewer` is the Employee `_id` of the person who must act next.

### Current level

`currentLevel` identifies the hierarchy level currently responsible for the review.

Example:

```text
currentLevel    = TEAM_LEAD
currentReviewer = Amit's Employee._id
status          = PENDING_REVIEW
```

---

## 4. Submit Document API

### Endpoint

```http
POST /api/v1/workflow/:documentId/submit
```

### Purpose

Submits a Draft/Revision document for review.

### Backend routing

```text
Authenticated User
        ↓
User.employeeId
        ↓
Employee
        ↓
Employee.team
        ↓
Team.teamLead
        ↓
Team Lead
        ↓
Create / update Workflow
        ↓
PENDING_REVIEW
```

The frontend does not send the reviewer ID.

---

## 5. Submit Request

No reviewer needs to be supplied by the frontend.

Example:

```text
POST /api/v1/workflow/6a7f011ae39b2059de652fcd/submit
```

Authentication is handled by the existing project authentication flow.

Expected workflow result:

```text
status          = PENDING_REVIEW
currentLevel    = TEAM_LEAD
currentReviewer = Team Lead Employee._id
lastAction      = SUBMITTED
```

---

## 6. Pending Workflows API

### Endpoint

```http
GET /api/v1/workflow/pending
```

### Purpose

Returns workflows assigned to the logged-in reviewer.

Backend matching:

```text
Logged-in Employee
        ↓
Employee._id
        ↓
workflow.currentReviewer
        ↓
Matching PENDING_REVIEW workflows
```

Example:

```text
Amit logs in
   ↓
GET /workflow/pending
   ↓
Only workflows assigned to Amit
```

An Employee who is not the reviewer should not receive the workflow in this endpoint.

---

## 7. My Submissions API

### Endpoint

```http
GET /api/v1/workflow/my-submissions
```

### Purpose

Allows the document owner to see their submitted workflow status.

Frontend can display:

```text
Document
Current Reviewer
Current Level
Workflow Status
Last Action
Submitted At
Reviewed At
```

Example:

```text
Document:
Employee Leave Policy

Current Reviewer:
Amit Shinde

Current Level:
TEAM_LEAD

Status:
PENDING_REVIEW

Last Action:
SUBMITTED
```

---

# 8. Review API

### Review endpoint

Use the existing workflow review endpoint:

```http
POST /api/v1/workflow/:workflowId/review
```

Example workflow ID:

```text
6a7f3b7b0e246d39d67df5aa
```

### Request body

```json
{
  "action": "APPROVE"
}
```

or:

```json
{
  "action": "RETURN"
}
```

or:

```json
{
  "action": "REJECT"
}
```

The reviewer must be the workflow's current reviewer.

---

## 9. APPROVE Flow

### Team Lead

```text
TEAM_LEAD
   ↓ APPROVE
MANAGER
```

### Manager

```text
MANAGER
   ↓ APPROVE
DEPARTMENT_HEAD
```

### Department Head

```text
DEPARTMENT_HEAD
   ↓ APPROVE
EXECUTIVE
```

### Executive

```text
EXECUTIVE
   ↓ APPROVE
GOVERNANCE
```

### Governance

```text
GOVERNANCE
   ↓ APPROVE
Document = PUBLISHED
Workflow = COMPLETED
```

Governance is the normal final approval level.

---

## 10. Governance → Published

When the current workflow level is:

```text
GOVERNANCE
```

and the Governance reviewer approves:

```text
workflow.currentReviewer = null
workflow.status = COMPLETED
workflow.lastAction = APPROVED
workflow.reviewedAt = current time

Document.status = PUBLISHED
```

Expected message:

```text
Document approved and published successfully.
```

The workflow does not automatically change the document to `ACTIVE` here. `PUBLISHED` and `ACTIVE/COMMENCED` are separate lifecycle states.

---

# 11. RETURN / Revision Flow

`RETURN` means the reviewer needs the document owner to make changes.

It is **not** a final rejection.

Example:

```text
TEAM_LEAD
   ↓ RETURN
REVISION
   ↓
Owner edits document
   ↓
New version
   ↓
Resubmit
```

Expected workflow state after return:

```text
status = REVISION
lastAction = RETURNED
currentReviewer = null
```

The document owner can then update the document.

---

## 12. Document Update After RETURN

Document update and workflow resubmission are separate operations.

```text
Workflow
PENDING_REVIEW
      ↓
RETURN
      ↓
REVISION
      ↓
Document Owner
      ↓
PATCH Document
      ↓
New Version
      ↓
Resubmit
```

Example version:

```text
v1.0
 → revision
v1.1
```

The frontend should refresh the document after the update and display the returned `currentVersion`.

---

# 13. Resubmit API

### Endpoint

```http
POST /api/v1/workflow/:workflowId/resubmit
```

### Purpose

Resubmits a revised document for review.

Expected result:

```text
status          = PENDING_REVIEW
currentReviewer = Team Lead Employee._id
currentLevel    = TEAM_LEAD
lastAction      = SUBMITTED
```

The workflow starts again from the Team Lead after the owner resubmits.

---

# 14. REJECT Flow

`REJECT` means the review process is terminated.

Example:

```text
PENDING_REVIEW
      ↓
REJECT
      ↓
REJECTED
```

Expected workflow:

```text
status          = REJECTED
lastAction      = REJECTED
currentReviewer = null
```

Rejected workflow is not automatically moved to the next reviewer.

---

# 15. Automatic Reminder and Escalation

The current implementation supports automatic reviewer reminders and escalation.

Configuration:

```env
WORKFLOW_REVIEW_INTERVAL_HOURS=24
WORKFLOW_ESCALATION_CHECK_MINUTES=5
```

### Meaning

`WORKFLOW_REVIEW_INTERVAL_HOURS` is the reviewer timeout interval.

It is currently configured as:

```text
24 hours
```

The FRS defines the reminder/escalation behavior but does not specify an exact numeric timeout. Therefore the timeout is configurable.

`WORKFLOW_ESCALATION_CHECK_MINUTES` controls how frequently the scheduler checks workflows. It does **not** mean the reviewer has only 5 minutes to respond.

---

## 16. Reminder Sequence

Current implementation:

```text
PENDING_REVIEW
      ↓
Timeout
      ↓
REMINDER #1
      ↓
Timeout
      ↓
REMINDER #2
      ↓
Still no response
      ↓
Automatic Escalation
```

The workflow stores reminder information such as:

```text
reminderCount
lastReminderAt
```

---

# 17. Escalation Flow

The normal reviewer chain is preserved.

If a reviewer does not respond after the configured reminder cycle:

```text
Current Reviewer
      ↓
Automatic Escalation
      ↓
Next higher reviewer
```

Current hierarchy escalation path:

```text
TEAM_LEAD
    ↓
MANAGER
    ↓
DEPARTMENT_HEAD
    ↓
EXECUTIVE
    ↓
GOVERNANCE
```

For the Executive unresolved case, escalation can reach:

```text
EXECUTIVE
    ↓
SUPER_ADMIN
```

The workflow stores:

```text
escalationCount
escalatedAt
```

---

# 18. Super Admin Escalation

Super Admin is not the normal next reviewer after Executive approval.

Super Admin becomes the reviewer when the workflow is escalated to Super Admin.

Example:

```text
EXECUTIVE
   ↓
No response
   ↓
Reminder
   ↓
Reminder
   ↓
ESCALATION
   ↓
SUPER_ADMIN
```

At this point:

```text
currentLevel    = SUPER_ADMIN
currentReviewer = Super Admin Employee._id
status          = PENDING_REVIEW
```

---

# 19. Super Admin Final Approval / Publish

When Super Admin is the current reviewer and approves:

```text
SUPER_ADMIN
      ↓ APPROVE
Workflow = COMPLETED
      ↓
Document = PUBLISHED
```

Expected workflow values:

```text
status          = COMPLETED
currentReviewer = null
lastAction      = APPROVED
```

The document becomes:

```text
status = PUBLISHED
```

This is the final publish path for the escalated workflow.

---

# 20. Reviewer Authorization

A reviewer cannot review a workflow just because they have a higher role.

The backend checks the current reviewer.

Example:

```text
Workflow currentReviewer = Amit
        ↓
Rajesh tries to review
        ↓
DENIED
```

Typical error:

```text
You are not authorized to review this document.
```

This is expected behavior.

The frontend should not attempt to bypass this check.

---

# 21. Frontend Review UI

The frontend should display action buttons according to the current workflow state and user permissions.

For a reviewer:

```text
Document Details
       ↓
Current Workflow
       ↓
Review Actions
       ├── Approve
       ├── Return
       └── Reject
```

The frontend sends only the selected action.

Example:

```json
{
  "action": "RETURN"
}
```

The backend decides the next level.

---

# 22. Frontend Must NOT Decide Routing

Do not implement:

```javascript
if (level === "TEAM_LEAD") {
  nextReviewer = managerId;
}
```

The frontend should never contain the approval hierarchy as routing logic.

Instead:

```text
Frontend
   ↓
POST review action
   ↓
Backend Workflow Service
   ↓
Determine next reviewer
   ↓
Return updated workflow
```

---

# 23. Response Handling

After every workflow action, refresh workflow/document data.

Example:

```javascript
await axios.post(
  `/api/v1/workflow/${workflowId}/review`,
  { action: "APPROVE" },
  { withCredentials: true }
);

// Then refresh:
await getPendingWorkflows();
await getDocument();
```

This is important because:

```text
currentReviewer
currentLevel
status
lastAction
```

can all change after one review action.

---

# 24. Workflow State Examples

### Submitted

```text
currentLevel    = TEAM_LEAD
status          = PENDING_REVIEW
lastAction      = SUBMITTED
currentReviewer = Team Lead
```

### Approved by Team Lead

```text
currentLevel    = MANAGER
status          = PENDING_REVIEW
lastAction      = APPROVED
currentReviewer = Manager
```

### Returned

```text
currentLevel    = current review level
status          = REVISION
lastAction      = RETURNED
currentReviewer = null
```

### Resubmitted

```text
currentLevel    = TEAM_LEAD
status          = PENDING_REVIEW
lastAction      = SUBMITTED
currentReviewer = Team Lead
```

### Rejected

```text
status          = REJECTED
lastAction      = REJECTED
currentReviewer = null
```

### Published

```text
workflow.status = COMPLETED
document.status = PUBLISHED
currentReviewer = null
```

---

# 25. Current Workflow Data

A workflow record includes:

```text
document
currentReviewer
currentLevel
status
lastAction
lastActionBy
submittedAt
reviewedAt
createdAt
updatedAt
reminderCount
lastReminderAt
escalationCount
escalatedAt
```

Not every field has a value in every state.

For example:

```text
reviewedAt = null
```

while the workflow is waiting for review.

---

# 26. Workflow Testing Flow

For a complete manual test, use this sequence:

```text
1. Employee creates document
        ↓
2. Document = DRAFT
        ↓
3. Employee submits
        ↓
4. Team Lead receives workflow
        ↓
5. Team Lead approves
        ↓
6. Manager receives workflow
        ↓
7. Manager approves
        ↓
8. Department Head receives workflow
        ↓
9. Department Head approves
        ↓
10. Executive receives workflow
        ↓
11. Executive approves
        ↓
12. Governance receives workflow
        ↓
13. Governance approves
        ↓
14. Document = PUBLISHED
```

For revision:

```text
Reviewer
   ↓
RETURN
   ↓
Owner
   ↓
PATCH Document
   ↓
New Version
   ↓
Resubmit
   ↓
Team Lead
```

For rejection:

```text
Reviewer
   ↓
REJECT
   ↓
Workflow = REJECTED
```

For escalation:

```text
Reviewer
   ↓
No response
   ↓
Reminder #1
   ↓
Reminder #2
   ↓
Escalation
   ↓
Next reviewer
```

For Executive escalation:

```text
Executive
   ↓
No response
   ↓
Reminders
   ↓
Super Admin
   ↓
Approve
   ↓
Published
```

---

# 27. Important Test Data

Before testing, verify:

```text
Employee.department → correct Department
Employee.team → correct Team
Team.department → same Department
Team.teamLead → correct Team Lead
Team Lead.hierarchyLevel → TEAM_LEAD
Manager.hierarchyLevel → MANAGER
Department Head.hierarchyLevel → DEPARTMENT_HEAD
Executive.hierarchyLevel → EXECUTIVE
Governance.hierarchyLevel → GOVERNANCE
Super Admin.hierarchyLevel → SUPER_ADMIN
Employee.status → ACTIVE
Team.status → ACTIVE
Department.status → ACTIVE
```

Incorrect hierarchy relationships can cause incorrect routing.

---

# 28. Frontend Quick Reference

### Submit

```http
POST /api/v1/workflow/:documentId/submit
```

### Pending

```http
GET /api/v1/workflow/pending
```

### My submissions

```http
GET /api/v1/workflow/my-submissions
```

### Review

```http
POST /api/v1/workflow/:workflowId/review
```

Body:

```json
{
  "action": "APPROVE"
}
```

or:

```json
{
  "action": "RETURN"
}
```

or:

```json
{
  "action": "REJECT"
}
```

### Resubmit

```http
POST /api/v1/workflow/:workflowId/resubmit
```

---

# 29. Common Frontend Mistakes

### Mistake 1 — Sending reviewer ID

Do not send:

```json
{
  "reviewerId": "..."
}
```

The backend determines the reviewer.

### Mistake 2 — Sending hierarchy level

Do not send:

```json
{
  "currentLevel": "MANAGER"
}
```

The backend controls workflow level.

### Mistake 3 — Treating RETURN as REJECT

```text
RETURN → Revision → Owner edits → Resubmit
REJECT → Workflow terminated
```

### Mistake 4 — Assuming reviewer never changes

After approval:

```text
currentReviewer
```

changes to the next reviewer.

Always refresh the workflow.

### Mistake 5 — Assuming current reviewer is always present

After:

```text
RETURN
REJECT
COMPLETED
```

`currentReviewer` can be `null`.

---

# 30. FRS Alignment

The workflow supports the FRS requirements for:

```text
Hierarchical document review
Team Lead review
Manager review
Department Head review
Executive review
Governance approval
Revision / Return
Rejection
Resubmission
Reminder
Automatic escalation
Super Admin escalation
Final publication
```

The FRS also requires audit logging for workflow/lifecycle transitions. Audit logging is handled separately from this workflow routing documentation.

---

# 31. Current Implementation Status

```text
Document Submission             ✅
Team Lead Routing               ✅
Pending Workflows               ✅
My Submissions                  ✅
Team Lead Approval              ✅
Manager Approval                ✅
Department Head Approval        ✅
Executive Approval              ✅
Governance Approval             ✅
Governance → Published          ✅
Return / Revision               ✅
Reject                          ✅
Resubmit                        ✅
Document Update Integration     ✅
New Version on Update           ✅
Reminder #1                     ✅
Reminder #2                     ✅
Automatic Escalation            ✅
Executive → Super Admin         ✅
Super Admin → Published         ✅
Configurable Timeout            ✅
```

---

# 32. Production Configuration

Before deployment, use the production configuration rather than the short testing interval.

Current recommended configuration:

```env
WORKFLOW_REVIEW_INTERVAL_HOURS=24
WORKFLOW_ESCALATION_CHECK_MINUTES=5
```

The scheduler check interval is only how often the system checks for overdue workflows.

It is not the reviewer response deadline.

For testing, a short value such as:

```env
WORKFLOW_REVIEW_INTERVAL_HOURS=0.01
```

may be used temporarily.

After testing, restore the production value.

---

# 33. Complete Frontend Flow

```text
CREATE
  ↓
Document = DRAFT
  ↓
EDIT
  ↓
New Version
  ↓
SUBMIT
  ↓
Team Lead
  ↓
┌────────────────┬────────────────┬────────────────┐
│ APPROVE        │ RETURN         │ REJECT         │
│ ↓              │ ↓              │ ↓              │
│ Manager        │ Revision       │ Rejected       │
│                │ ↓              │                │
│                │ Edit           │                │
│                │ ↓              │                │
│                │ New Version    │                │
│                │ ↓              │                │
│                │ Resubmit       │                │
└────────────────┴────────────────┴────────────────┘

APPROVE PATH
  ↓
Manager
  ↓
Department Head
  ↓
Executive
  ↓
Governance
  ↓
Published

TIMEOUT PATH
  ↓
Reminder #1
  ↓
Reminder #2
  ↓
Escalation
  ↓
Next Reviewer
  ↓
Executive unresolved case
  ↓
Super Admin
  ↓
Published
```

---

# 34. Final Frontend Rule

The frontend is responsible for:

```text
Display
Input
Action selection
API call
Loading state
Success/error handling
Refreshing data
```

The backend is responsible for:

```text
Reviewer selection
Hierarchy routing
Authorization
Approval transition
Revision transition
Rejection
Resubmission
Reminder
Escalation
Publication
Version integration
```

This separation keeps the frontend simple and prevents the frontend from duplicating EGKMS business rules.
