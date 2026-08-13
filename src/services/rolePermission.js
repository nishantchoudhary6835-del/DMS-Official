import { axiosInstance } from '@services/axiosInstance';
import { referenceId } from '@utils/format';

/**
 * ROLE_PERMISSION_MODULE.md §6 documents this route as camelCase
 * `/rolePermission`, matching /permission and /department's convention. The
 * deployed backend disagrees: probed directly, `/rolePermission` 404s while
 * `/role-permission` (kebab-case) answers 401 "No auth token" — the live,
 * auth-gated shape every other module route has. Using the confirmed path,
 * not the documented one.
 */
const BASE_PATH = '/role-permission';

/**
 * Fields the backend owns, including `assignedBy` — set server-side from the
 * authenticated user per ROLE_PERMISSION_MODULE.md §3, never sent by the
 * client.
 */
const SERVER_OWNED = ['assignedBy', 'createdAt', 'updatedAt', '__v', '_id'];

export async function createRolePermission({ hierarchyLevel, permission }) {
  const { data } = await axiosInstance.post(BASE_PATH, {
    hierarchyLevel,
    permission: referenceId(permission),
  });
  return data;
}

/**
 * No query parameters are documented, so — like /department and /permission
 * — filtering happens client-side against the full list.
 */
export async function listRolePermissions() {
  const { data } = await axiosInstance.get(BASE_PATH);
  return data;
}

export async function getRolePermissionById(id) {
  const { data } = await axiosInstance.get(`${BASE_PATH}/${id}`);
  return data;
}

export async function updateRolePermission(id, changes) {
  const payload = { ...changes };

  SERVER_OWNED.forEach((field) => delete payload[field]);

  // Status has its own endpoint — accepting it here would give two routes to
  // one change, only one of them documented.
  delete payload.status;

  if ('permission' in payload) payload.permission = referenceId(payload.permission);

  const { data } = await axiosInstance.patch(`${BASE_PATH}/${id}`, payload);
  return data;
}

export async function updateRolePermissionStatus(id, status) {
  const { data } = await axiosInstance.patch(`${BASE_PATH}/${id}/status`, {
    status,
  });
  return data;
}

export async function deleteRolePermission(id) {
  const { data } = await axiosInstance.delete(`${BASE_PATH}/${id}`);
  return data;
}
