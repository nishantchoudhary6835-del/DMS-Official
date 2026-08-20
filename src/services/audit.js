import { axiosInstance } from '@services/axiosInstance';

// GET /api/v1/audit (the spec writes /api/audit). `data` is `{ logs, pagination }`,
// so it cannot feed useListResource; SUPER_ADMIN-gated, filtered and paged server-side.
export async function listAuditLogs(filters = {}) {
  const params = {};

  // An empty string is a real value to axios and would be sent as `?module=`
  // for the backend to match. Only forward filters that were actually set.
  Object.entries(filters).forEach(([key, value]) => {
    if (value === null || value === undefined || value === '') return;
    params[key] = value;
  });

  const { data } = await axiosInstance.get('/audit', { params });
  return data;
}
