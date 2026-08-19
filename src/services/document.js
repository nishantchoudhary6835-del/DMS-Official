import { Platform } from 'react-native';

import { axiosInstance } from '@services/axiosInstance';
import { referenceId } from '@utils/format';

/**
 * Confirmed live and auth-gated: POST /document -> 401 "No auth token"
 * without a token, the same contract every other module's create route has.
 * `createDocument`/`updateDocument` are both confirmed working live (see
 * WORKFLOW_SUBMIT_MISSING_TEAM.md's 2026-08-16 log and DOCUMENT_MANAGEMENT.md
 * §19's frontend note). `getDocumentById` is written to
 * DOCUMENT_MODULE_DOCUMENTATION.md §10 (added 2026-08-18, which is also the
 * first time a document detail route was documented at all) but has not yet
 * been exercised against the live backend — treat it as documented, not
 * confirmed, until it's actually been called and its response observed.
 */

/**
 * Web: expo-document-picker attaches the real browser File object as
 * `asset.file`, which already carries name/type — appended directly rather
 * than rebuilt.
 * Native: there is no File API, so React Native's FormData polyfill instead
 * wants this `{ uri, name, type }` shape.
 */
function toFilePart(asset) {
  if (!asset) return null;

  if (Platform.OS === 'web' && asset.file) return asset.file;

  return {
    uri: asset.uri,
    name: asset.name ?? 'document',
    type: asset.mimeType ?? 'application/octet-stream',
  };
}

/**
 * Shared by create and update — §9's update example sends the same fields
 * as §3's create table, file included, just optionally on update.
 */
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

/**
 * §9 warns against setting Content-Type by hand for a FormData body, but
 * that only holds for a bare axios instance. `axiosInstance` sets
 * `Content-Type: application/json` as an instance-level default
 * (axiosInstance.js), and axios's transformRequest only clears that for
 * FormData when no Content-Type is already present — here one always is, so
 * without this override axios silently JSON.stringifies the FormData and
 * sends it as `application/json` instead of multipart, dropping the file
 * entirely. Setting it to `undefined` per-request removes the instance
 * default so axios/the browser can attach the real multipart boundary.
 */
export async function createDocument(values) {
  const { data } = await axiosInstance.post('/document', buildDocumentFormData(values), {
    headers: { 'Content-Type': undefined },
  });
  return data;
}

/** The backend clamps `limit` to 100 (`document.service.js`'s getDocuments). */
const DOCUMENT_PAGE_LIMIT = 100;

/**
 * Stops a malformed `totalPages` from turning this into an endless request
 * loop. 20 pages at 100 each is 2000 documents — far past anything this
 * screen is useful for, and a sane place to give up rather than hang.
 */
const MAX_DOCUMENT_PAGES = 20;

/**
 * GET /document — DOCUMENT_MODULE_DOCUMENTATION.md §9.
 *
 * This endpoint IS paginated, which the spec doesn't mention: the backend
 * defaults to `limit: 20` and sorts by `updatedAt` descending. Requesting it
 * bare therefore returned only the 20 most recently touched documents in
 * scope — and since callers narrow that to "documents I own" client-side
 * (see useDocuments.js), someone in a busy department could own fifteen
 * documents and see two, with nothing to indicate the list was truncated.
 * So every page is fetched and concatenated here.
 *
 * The response is already scoped server-side (`buildDocumentScope`): owner,
 * own department, or own team — everything, for SUPER_ADMIN. That's wider
 * than "mine", which is why the client-side ownership filter still exists on
 * top of it.
 *
 * Paging while another user is editing can in principle repeat or skip a
 * document as rows shift between pages under the `updatedAt` sort. There's
 * no cursor/snapshot option on this endpoint to avoid it, and the window is
 * a few hundred milliseconds, so it's accepted rather than worked around.
 */
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

/**
 * PATCH /document/:documentId — DOCUMENT_MANAGEMENT.md §8-9. `file` is the
 * only field that's genuinely optional here (§14's example only appends it
 * "if (selectedFile)"); title/documentType/department are re-sent every
 * time rather than treated as a partial update, since §9's own example
 * always includes them and nothing documents partial-update support the
 * way Department/Employee's PATCH explicitly does.
 */
export async function updateDocument(documentId, values) {
  const { data } = await axiosInstance.patch(
    `/document/${documentId}`,
    buildDocumentFormData(values),
    { headers: { 'Content-Type': undefined } }
  );
  return data;
}

/**
 * GET /document/:documentId/view — DOCUMENT_VIEW_API.md. Replaces the old
 * fileUrl-from-Cloudinary approach: that spec states fileUrl/filePublicId
 * are no longer sent in any document response, and this is now the only way
 * to view a document's file at all.
 *
 * The spec writes this path as plural (`/documents/:id/view`) everywhere it
 * appears. The route is singular — confirmed in the backend source, where
 * `routes/index.js` mounts the document router at `/document` and
 * `document.routes.js` declares `/:documentId/view` beneath it. Singular is
 * correct and the spec is wrong, the same documented-vs-actual mismatch
 * ROLE_PERMISSION_MODULE.md turned out to have with its own base path.
 *
 * The backend does still return `fileUrl`/`filePublicId` in the *create*
 * response, despite §4/§7 saying they are never sent: both are
 * `select: false` on the model, so reads honour the spec, but create returns
 * the in-memory document it just built. Nothing in this app reads either
 * field, so that's a backend-side gap rather than something to handle here.
 *
 * Returns raw PDF bytes on success, so `responseType: 'blob'` is required —
 * but that setting applies to error responses too, and the backend's own
 * error body is JSON (400/401/403/404/500), not PDF. Without recovering it,
 * axios hands back a Blob where callers expect `{ message }`, and
 * normalizeError silently falls through to a generic message. The catch
 * block re-reads that blob as text and reattaches it as parsed JSON so the
 * usual error handling keeps working unchanged.
 */
/**
 * PATCH /document/:documentId/archive — DOCUMENT_MODULE_DOCUMENTATION.md
 * §17. Confirmed to exist live (401 "No auth token" without a token, not
 * 404) but not yet exercised with real auth/data.
 */
export async function archiveDocument(documentId) {
  const { data } = await axiosInstance.patch(`/document/${documentId}/archive`);
  return data;
}

/** PATCH /document/:documentId/restore — DOCUMENT_MODULE_DOCUMENTATION.md §18. Same confirmation status as archiveDocument above. */
export async function restoreDocument(documentId) {
  const { data } = await axiosInstance.patch(`/document/${documentId}/restore`);
  return data;
}

/**
 * DELETE /document/:documentId — DOCUMENT_MODULE_DOCUMENTATION.md §19.
 *
 * `canDeleteDocument` in document.service.js allows this in exactly two
 * cases: a SUPER_ADMIN deleting anything, or the owner deleting their own
 * document while it is still DRAFT. Everything under review, approved,
 * published, active or archived is protected. It is also permanent — the
 * document and all its DocumentVersion rows are removed, not soft-deleted.
 */
export async function deleteDocument(documentId) {
  const { data } = await axiosInstance.delete(`/document/${documentId}`);
  return data;
}

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
