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

/** action is one of 'APPROVE' | 'RETURN' | 'REJECT' — see WORKFLOW_MODULE.md §8. */
export async function reviewWorkflow(workflowId, action) {
  const { data } = await axiosInstance.post(`/workflow/${workflowId}/review`, {
    action,
  });
  return data;
}

export async function resubmitWorkflow(workflowId) {
  const { data } = await axiosInstance.post(`/workflow/${workflowId}/resubmit`);
  return data;
}
