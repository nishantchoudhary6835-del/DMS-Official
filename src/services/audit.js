import { axiosInstance } from '@services/axiosInstance';

/**
 * GET /audit — AUDIT_MODULE.md.
 *
 * The spec writes this path as `/api/audit` in every one of its examples.
 * The real route is `/api/v1/audit`: `routes/index.js` registers it with
 * `router.use("/audit", auditRoutes)` on the same router as every other
 * module, and that router is served under `/api/v1`. Confirmed by reading
 * the backend source — the same documented-vs-actual mismatch
 * DOCUMENT_VIEW_API.md had with its plural `/documents/:id/view`.
 *
 * Two other things the response does differently from the rest of the API:
 *
 * 1. `data` is an object (`{ logs, pagination }`), not the array itself.
 *    audit.controller.js returns the service result whole instead of
 *    lifting `logs` to `data` and `pagination` beside it, which is what
 *    `GET /document` does. So this cannot feed useListResource.
 * 2. It is gated by `authorize("SUPER_ADMIN")` — a fixed hierarchy check —
 *    not by the configurable accessControl engine every other list route
 *    uses. Nothing an admin can grant will open it to a lower level.
 *
 * Filters are applied server-side (audit.service.js): `module`, `action`,
 * `actor`, `targetId`, `targetType`, `from`, `to`, plus `page`/`limit`
 * (default 20, clamped to 100). `module` and `action` are upper-cased by the
 * backend before matching. Results always sort newest first.
 */
export async function listAuditLogs(filters = {}) {
  const params = {};

  // An empty string is a real value to axios and would be sent as
  // `?module=`, which the backend would then try to match. Only forward
  // filters that were actually set.
  Object.entries(filters).forEach(([key, value]) => {
    if (value === null || value === undefined || value === '') return;
    params[key] = value;
  });

  const { data } = await axiosInstance.get('/audit', { params });
  return data;
}
