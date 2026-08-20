import { axiosInstance } from '@services/axiosInstance';

// §31 marks the full lifecycle implemented. Reminder/escalation are
// scheduler-driven with no callable route, so this covers everything else.

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

// action is 'APPROVE' | 'RETURN' | 'REJECT' (§8). RETURN/REJECT 400 without a
// non-empty `reviewComment`; APPROVE ignores it, so it is only sent when given.
export async function reviewWorkflow(workflowId, action, reviewComment = null) {
  const payload = { action };
  if (reviewComment) payload.reviewComment = reviewComment;

  const { data } = await axiosInstance.post(`/workflow/${workflowId}/review`, payload);
  return data;
}

// Despite the /workflow prefix this route takes a *document* id — the backend
// does `Document.findById`. A workflow id 404s "Document not found".
export async function resubmitDocument(documentId) {
  const { data } = await axiosInstance.post(`/workflow/${documentId}/resubmit`);
  return data;
}
