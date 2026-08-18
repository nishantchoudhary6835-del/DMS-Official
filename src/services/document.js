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
 * to view a document's file at all. The spec's own examples use a plural
 * `/documents/:id/view` path, but every other confirmed document route in
 * this app is singular (`/document`) — using singular here to match until
 * proven otherwise live, the same kind of documented-vs-actual mismatch
 * ROLE_PERMISSION_MODULE.md turned out to have with its own base path.
 *
 * Returns raw PDF bytes on success, so `responseType: 'blob'` is required —
 * but that setting applies to error responses too, and the backend's own
 * error body is JSON (400/401/403/404/500), not PDF. Without recovering it,
 * axios hands back a Blob where callers expect `{ message }`, and
 * normalizeError silently falls through to a generic message. The catch
 * block re-reads that blob as text and reattaches it as parsed JSON so the
 * usual error handling keeps working unchanged.
 */
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
