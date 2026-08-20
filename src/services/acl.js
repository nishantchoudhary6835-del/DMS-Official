import { axiosInstance } from '@services/axiosInstance';
import { referenceId } from '@utils/format';

// Confirmed live and auth-gated. Unlike /rolePermission, this path matches
// ACL_MODULE.md §7 exactly.

const SERVER_OWNED = ['createdBy', 'createdAt', 'updatedAt', '__v', '_id'];

export async function createAcl({
  hierarchyLevel,
  permission,
  department = null,
  team = null,
  employee = null,
  effect,
}) {
  const { data } = await axiosInstance.post('/acl', {
    hierarchyLevel,
    permission: referenceId(permission),
    department: referenceId(department),
    team: referenceId(team),
    employee: referenceId(employee),
    effect,
  });
  return data;
}

// No query parameters are documented, so filtering happens client-side
// against the full list, same as /permission, /department, /rolePermission.
export async function listAcls() {
  const { data } = await axiosInstance.get('/acl');
  return data;
}

export async function getAclById(id) {
  const { data } = await axiosInstance.get(`/acl/${id}`);
  return data;
}

export async function updateAcl(id, changes) {
  const payload = { ...changes };

  SERVER_OWNED.forEach((field) => delete payload[field]);

  // Status has its own endpoint — accepting it here would give two routes to
  // one change, only one of them documented.
  delete payload.status;

  if ('permission' in payload) payload.permission = referenceId(payload.permission);

  // Each is nullable and clearing it is a real operation (a Department rule
  // back to Global), so an explicit null must survive. Absent means "leave".
  if ('department' in payload) payload.department = referenceId(payload.department);
  if ('team' in payload) payload.team = referenceId(payload.team);
  if ('employee' in payload) payload.employee = referenceId(payload.employee);

  const { data } = await axiosInstance.patch(`/acl/${id}`, payload);
  return data;
}

export async function updateAclStatus(id, status) {
  const { data } = await axiosInstance.patch(`/acl/${id}/status`, { status });
  return data;
}

export async function deleteAcl(id) {
  const { data } = await axiosInstance.delete(`/acl/${id}`);
  return data;
}
