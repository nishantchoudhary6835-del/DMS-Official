import { axiosInstance, dedupedGet } from '@services/axiosInstance';

export async function listUsers() {
  const { data } = await dedupedGet('/user');
  return data;
}

export async function getUserById(userId) {
  const { data } = await axiosInstance.get(`/user/${userId}`);
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
