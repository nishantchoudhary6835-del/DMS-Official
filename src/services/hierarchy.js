import { axiosInstance } from '@services/axiosInstance';

// Active hierarchy levels, `level` ascending (SUPER_ADMIN first). Authenticated,
// so it cannot be prefetched. Flat — no `parentId`, so no reporting structure.
export async function listHierarchy() {
  const { data } = await axiosInstance.get('/hierarchy');
  return data;
}
