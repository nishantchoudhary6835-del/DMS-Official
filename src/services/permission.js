import { axiosInstance } from '@services/axiosInstance';

/**
 * Confirmed live and auth-gated (401 "No auth token" without a token, same
 * shape as /hierarchy, /department, /team). Route existence and the shared
 * error contract are verified — the specific behaviors this file guesses at
 * (409 on a duplicate resource+action, no delete-blocking) are still
 * unconfirmed against a real authenticated response.
 */

/**
 * Fields the backend owns. They come back on every response, and echoing any
 * of them on a write is wrong elsewhere in this codebase — so they are
 * stripped rather than trusted not to be present here too.
 */
const SERVER_OWNED = ['createdBy', 'createdAt', 'updatedAt', '__v', '_id'];

export async function createPermission({ resource, action, description = '' }) {
  const { data } = await axiosInstance.post('/permission', {
    resource: String(resource ?? '').trim(),
    action,
    description: String(description ?? '').trim(),
  });
  return data;
}

/**
 * No query parameters are documented, so — like /department — filtering
 * happens client-side against the full list rather than over the wire.
 */
export async function listPermissions() {
  const { data } = await axiosInstance.get('/permission');
  return data;
}

export async function getPermissionById(id) {
  const { data } = await axiosInstance.get(`/permission/${id}`);
  return data;
}

export async function updatePermission(id, changes) {
  const payload = { ...changes };

  SERVER_OWNED.forEach((field) => delete payload[field]);

  // Status has its own endpoint. Accepting it here would give two routes to
  // one change, only one of them documented.
  delete payload.status;

  if (payload.resource !== undefined) {
    payload.resource = String(payload.resource).trim();
  }
  if (payload.description !== undefined) {
    payload.description = String(payload.description).trim();
  }

  const { data } = await axiosInstance.patch(`/permission/${id}`, payload);
  return data;
}

export async function updatePermissionStatus(id, status) {
  const { data } = await axiosInstance.patch(`/permission/${id}/status`, {
    status,
  });
  return data;
}

export async function deletePermission(id) {
  const { data } = await axiosInstance.delete(`/permission/${id}`);
  return data;
}
