import { axiosInstance } from '@services/axiosInstance';
import { normalizeEmail } from '@utils/format';

export async function createEmployee({
  employeeId,
  firstName,
  lastName,
  email,
  hierarchyLevel,
  department = null,
  team = null,
  reportingManager = null,
}) {
  const { data } = await axiosInstance.post('/employee', {
    employeeId: String(employeeId ?? '').trim().toUpperCase(),
    firstName: String(firstName ?? '').trim(),
    lastName: String(lastName ?? '').trim(),
    email: normalizeEmail(email),
    hierarchyLevel,
    department,
    team,
    reportingManager,
  });
  return data;
}

export async function listEmployees(filters = {}) {
  const params = {};

  if (filters.hierarchyLevel) params.hierarchyLevel = filters.hierarchyLevel;
  if (filters.department) params.department = filters.department;
  if (filters.team) params.team = filters.team;
  if (filters.status) params.status = filters.status;

  const { data } = await axiosInstance.get('/employee', { params });
  return data;
}

export async function getEmployeeById(id) {
  const { data } = await axiosInstance.get(`/employee/${id}`);
  return data;
}

export async function getEmployeeByEmail(email) {
  const { data } = await axiosInstance.get(
    `/employee/email/${encodeURIComponent(normalizeEmail(email))}`
  );
  return data;
}

export async function updateEmployee(id, changes) {
  const payload = { ...changes };

  delete payload.isRegistered;
  delete payload.createdBy;

  if (payload.email) payload.email = normalizeEmail(payload.email);
  if (payload.employeeId) {
    payload.employeeId = String(payload.employeeId).trim().toUpperCase();
  }

  const { data } = await axiosInstance.patch(`/employee/${id}`, payload);
  return data;
}

export async function updateEmployeeStatus(id, status) {
  const { data } = await axiosInstance.patch(`/employee/${id}/status`, {
    status,
  });
  return data;
}

export async function deleteEmployee(id) {
  const { data } = await axiosInstance.delete(`/employee/${id}`);
  return data;
}
