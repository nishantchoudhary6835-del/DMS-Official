import { axiosInstance } from '@services/axiosInstance';
import { normalizeEmail } from '@utils/format';

const PROTECTED_FIELDS = [
  'password',
  'refreshTokenHash',
  'failedLoginAttempts',
  'lockUntil',
  'passwordChangedAt',
  'lastLogin',
  'employeeId',
];

export async function listUsers() {
  const { data } = await axiosInstance.get('/user');
  return data;
}

export async function getUserById(userId) {
  const { data } = await axiosInstance.get(`/user/${userId}`);
  return data;
}

export async function updateUser(userId, changes) {
  const payload = { ...changes };

  PROTECTED_FIELDS.forEach((field) => delete payload[field]);

  if (payload.email) payload.email = normalizeEmail(payload.email);

  const { data } = await axiosInstance.patch(`/user/${userId}`, payload);
  return data;
}

export async function updateUserStatus(userId, accountStatus) {
  const { data } = await axiosInstance.patch(`/user/${userId}/status`, {
    accountStatus,
  });
  return data;
}

export async function resetUserPassword(userId, newPassword) {
  const { data } = await axiosInstance.post(`/user/${userId}/reset-password`, {
    newPassword,
  });
  return data;
}

export async function deleteUser(userId) {
  const { data } = await axiosInstance.delete(`/user/${userId}`);
  return data;
}
