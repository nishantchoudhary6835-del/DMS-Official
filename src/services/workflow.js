import { axiosInstance } from '@services/axiosInstance';

/**
 * WORKFLOW_MODULE.md §31 now marks the full lifecycle — review, resubmit,
 * reminder, escalation — as implemented on the backend. Reminder/escalation
 * are scheduler-driven and have no frontend-callable route (§15-19), so
 * this file covers everything else: submit, the two scoped lists, review,
 * and resubmit.
 */

export async function submitDocumentForReview(documentId) {
  const { data } = await axiosInstance.post(`/workflow/${documentId}/submit`);
  return data;
}

export async function listPendingWorkflows() {
  const { data } = await axiosInstance.get('/workflow/pending');
  return data;
}

export async function listMySubmissions() {
  const { data } = await axiosInstance.get('/workflow/my-submissions');
  return data;
}

/**
 * action is one of 'APPROVE' | 'RETURN' | 'REJECT' — see WORKFLOW_MODULE.md
 * §8. The backend requires a non-empty `reviewComment` when action is RETURN
 * or REJECT (400 "Review comment is required when action is ${action}."
 * otherwise) — confirmed by reading workflow.service.js directly. APPROVE
 * ignores it and clears any previous comment on the document regardless of
 * what's sent, so it's only included when actually provided.
 */
export async function reviewWorkflow(workflowId, action, reviewComment = null) {
  const payload = { action };
  if (reviewComment) payload.reviewComment = reviewComment;

  const { data } = await axiosInstance.post(`/workflow/${workflowId}/review`, payload);
  return data;
}

/**
 * Despite living under /workflow, this route is `/workflow/:documentId/resubmit`
 * — same shape as submit — and the backend does `Document.findById(documentId)`
 * directly (confirmed by reading workflow.service.js's resubmitDocument).
 * Sending a workflow id here 404s "Document not found"; it only happens to
 * share a URL prefix with the workflow-scoped /:workflowId/review route
 * above, not its parameter's meaning.
 */
export async function resubmitDocument(documentId) {
  const { data } = await axiosInstance.post(`/workflow/${documentId}/resubmit`);
  return data;
}
