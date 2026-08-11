import { axiosInstance } from '@services/axiosInstance';

/**
 * Active hierarchy levels, ordered by `level` ascending (SUPER_ADMIN first).
 * Authenticated — the backend gates this behind the session, so it cannot be
 * prefetched before login.
 *
 * Rows carry only `_id`, `hierarchyLevel` and `level`; the module returns no
 * `parentId`, so this list is flat and cannot describe reporting structure.
 */
export async function listHierarchy() {
  const { data } = await axiosInstance.get('/hierarchy');
  return data;
}
