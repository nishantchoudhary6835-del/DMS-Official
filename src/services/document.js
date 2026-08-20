import { Platform } from 'react-native';

import { axiosInstance } from '@services/axiosInstance';
import { referenceId } from '@utils/format';

// Confirmed live and auth-gated; create/update are exercised against the live
// backend. `getDocumentById` is written to §10 but not yet called for real.

// Web: expo-document-picker hands back the real File as `asset.file`, already
// carrying name/type. Native has no File API and wants `{ uri, name, type }`.
function toFilePart(asset) {
  if (!asset) return null;

  if (Platform.OS === 'web' && asset.file) return asset.file;

  return {
    uri: asset.uri,
    name: asset.name ?? 'document',
    type: asset.mimeType ?? 'application/octet-stream',
  };
}

// Shared by create and update — §9's update example sends the same fields as
// §3's create table, file included, just optionally on update.
function buildDocumentFormData({ title, description = '', documentType, department, team = null, file = null }) {
  const formData = new FormData();

  formData.append('title', String(title ?? '').trim());
  formData.append('description', String(description ?? '').trim());
  formData.append('documentType', String(documentType ?? '').trim());
  formData.append('department', referenceId(department));

  const teamId = referenceId(team);
  if (teamId) formData.append('team', teamId);

  const filePart = toFilePart(file);
  if (filePart) formData.append('file', filePart);

  return formData;
}

// axiosInstance defaults Content-Type to application/json, and axios only clears
// that for FormData when unset — without `undefined` here the file is dropped.
export async function createDocument(values) {
  const { data } = await axiosInstance.post('/document', buildDocumentFormData(values), {
    headers: { 'Content-Type': undefined },
  });
  return data;
}

/** The backend clamps `limit` to 100 (`document.service.js`'s getDocuments). */
const DOCUMENT_PAGE_LIMIT = 100;

// Stops a malformed `totalPages` from looping forever. 20 pages at 100 each is
// far past what this screen is useful for, and a sane place to give up.
const MAX_DOCUMENT_PAGES = 20;

// GET /document is paginated (limit 20) though the spec omits it, so a bare
// request truncated silently. Every page is fetched and concatenated here.
export async function listDocuments() {
  const params = { page: 1, limit: DOCUMENT_PAGE_LIMIT };

  const { data: firstPage } = await axiosInstance.get('/document', { params });

  const documents = Array.isArray(firstPage?.data) ? [...firstPage.data] : [];
  const totalPages = Number(firstPage?.pagination?.totalPages) || 1;
  const lastPage = Math.min(totalPages, MAX_DOCUMENT_PAGES);

  for (let page = 2; page <= lastPage; page += 1) {
    const { data: nextPage } = await axiosInstance.get('/document', {
      params: { page, limit: DOCUMENT_PAGE_LIMIT },
    });

    if (!Array.isArray(nextPage?.data) || !nextPage.data.length) break;

    documents.push(...nextPage.data);
  }

  // Same envelope the single-request version returned, so useListResource's
  // `response.data` extraction is unchanged.
  return { ...firstPage, data: documents };
}

/** GET /document/:documentId — DOCUMENT_MODULE_DOCUMENTATION.md §10. */
export async function getDocumentById(documentId) {
  const { data } = await axiosInstance.get(`/document/${documentId}`);
  return data;
}

// PATCH /document/:documentId. `file` is the only genuinely optional field —
// title/documentType/department are re-sent every time, as §9's example does.
export async function updateDocument(documentId, values) {
  const { data } = await axiosInstance.patch(
    `/document/${documentId}`,
    buildDocumentFormData(values),
    { headers: { 'Content-Type': undefined } }
  );
  return data;
}

// PATCH /document/:documentId/archive — §17. Confirmed to exist live (401
// without a token, not 404) but not yet exercised with real auth/data.
export async function archiveDocument(documentId) {
  const { data } = await axiosInstance.patch(`/document/${documentId}/archive`);
  return data;
}

/** PATCH /document/:documentId/restore — DOCUMENT_MODULE_DOCUMENTATION.md §18. Same confirmation status as archiveDocument above. */
export async function restoreDocument(documentId) {
  const { data } = await axiosInstance.patch(`/document/${documentId}/restore`);
  return data;
}

// DELETE /document/:documentId. `canDeleteDocument` allows exactly two cases:
// SUPER_ADMIN, or the owner while still DRAFT. Permanent, not soft-deleted.
export async function deleteDocument(documentId) {
  const { data } = await axiosInstance.delete(`/document/${documentId}`);
  return data;
}

// The only way to read a file now fileUrl is gone; route is singular despite the
// spec. `responseType: 'blob'` hits errors too, so the catch re-reads them as JSON.
export async function viewDocument(documentId) {
  try {
    const response = await axiosInstance.get(`/document/${documentId}/view`, {
      responseType: 'blob',
    });
    return response.data;
  } catch (caught) {
    const data = caught?.response?.data;

    if (data instanceof Blob && data.type.includes('json')) {
      try {
        caught.response.data = JSON.parse(await data.text());
      } catch {
        // Not actually JSON — leave the original Blob in place.
      }
    }

    throw caught;
  }
}
