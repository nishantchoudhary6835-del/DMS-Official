# EGKMS — Workflow Review, Reminder & Escalation Quick Guide

## Normal Review Flow

```text
Employee → Team Lead → Manager → Department Head → Executive → Governance → Published
```

## Review Actions

```text
APPROVE → next reviewer
RETURN  → REVISION → owner edits → new version → RESUBMIT
REJECT  → REJECTED / review terminated
```

## Timeout

Production configuration:

```env
WORKFLOW_REVIEW_INTERVAL_HOURS=24
WORKFLOW_ESCALATION_CHECK_MINUTES=5
```

The FRS defines reminders and escalation but does not specify an exact numeric timeout; the timeout is therefore configurable.

## Escalation

```text
No response → Reminder #1 → Reminder #2 → Escalation
```

An unresolved Executive review can escalate to Super Admin. When Super Admin is the current reviewer and approves, the workflow completes and the document becomes `PUBLISHED`.

## Frontend Rule

The frontend never chooses the next reviewer. It sends the action and refreshes workflow/document data after the response.
