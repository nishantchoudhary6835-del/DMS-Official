import { axiosInstance } from '@services/axiosInstance';
import { referenceId } from '@utils/format';

/**
 * Fields the backend owns. They come back on every response, and echoing any
 * of them on a write is documented as wrong — so they are stripped rather
 * than trusted not to be there.
 */
const SERVER_OWNED = ['createdBy', 'createdAt', 'updatedAt', '__v', '_id'];

function normalizeCode(code) {
  // The backend uppercases this anyway ("hr" -> "HR"). Doing it here too keeps
  // the field from visibly rewriting itself once the response lands.
  return String(code ?? '').trim().toUpperCase();
}

export async function createDepartment({ name, code, head = null }) {
  const { data } = await axiosInstance.post('/department', {
    name: String(name ?? '').trim(),
    code: normalizeCode(code),
    head: referenceId(head),
  });
  return data;
}

export async function listDepartments() {
  const { data } = await axiosInstance.get('/department');
  return data;
}

export async function getDepartmentById(id) {
  const { data } = await axiosInstance.get(`/department/${id}`);
  return data;
}

export async function updateDepartment(id, changes) {
  const payload = { ...changes };

  SERVER_OWNED.forEach((field) => delete payload[field]);

  // Status has its own endpoint. Letting it ride along here would give two
  // paths to the same change, only one of which is documented.
  delete payload.status;

  if (payload.name !== undefined) payload.name = String(payload.name).trim();
  if (payload.code !== undefined) payload.code = normalizeCode(payload.code);

  // `head` is nullable and clearing it is a real operation, so an explicit
  // null has to survive — only an absent key means "leave it alone".
  if ('head' in payload) payload.head = referenceId(payload.head);

  const { data } = await axiosInstance.patch(`/department/${id}`, payload);
  return data;
}

export async function updateDepartmentStatus(id, status) {
  const { data } = await axiosInstance.patch(`/department/${id}/status`, {
    status,
  });
  return data;
}

export async function deleteDepartment(id) {
  const { data } = await axiosInstance.delete(`/department/${id}`);
  return data;
}
