import { axiosInstance } from '@services/axiosInstance';

/**
 * WORKFLOW_MODULE.md §17 marks only submission, reviewer routing, pending
 * workflows, and my-submissions as "IMPLEMENTED + TESTED". Approve, return,
 * escalate, and audit routes are explicitly listed as remaining, so this
 * file has only the three endpoints that exist.
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
