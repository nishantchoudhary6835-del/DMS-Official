import { Platform } from 'react-native';

import { axiosInstance } from '@services/axiosInstance';
import { referenceId } from '@utils/format';

/**
 * Confirmed live and auth-gated: POST /document -> 401 "No auth token"
 * without a token, the same contract every other module's create route has.
 * GET /document -> 404, which matches DOCUMENT_MANAGEMENT.md's own account
 * of itself. `updateDocument` below is written to the same doc's §9/§14 but
 * has not itself been exercised against the live backend yet — there is
 * still no documented list or detail GET route, so the only place this app
 * can reach an update from is the moment right after a create response, per
 * CreateDocumentScreen's comment on the same limitation.
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
