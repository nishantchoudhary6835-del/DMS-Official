import { ROUTES } from '@navigation/routes';

/**
 * The navigation tree.
 *
 * Only the handful of entries carrying a `route` lead anywhere — those are
 * the screens that actually exist. The rest are structural placeholders and
 * render inert, so the shell can be reviewed at full size without implying
 * destinations that have not been built.
 */
export const NAV_SECTIONS = [
  {
    key: 'root',
    items: [
      {
        key: 'dashboard',
        label: 'Dashboard',
        icon: 'home',
        route: ROUTES.MAIN.HOME,
      },
    ],
  },
  {
    key: 'documents',
    title: 'Document Management',
    items: [
      { key: 'my-documents', label: 'My Documents', icon: 'document-text-outline' },
      { key: 'all-documents', label: 'All Documents', icon: 'documents-outline' },
      { key: 'create-document', label: 'Create Document', icon: 'add-circle-outline' },
      { key: 'submitted-documents', label: 'Submitted Documents', icon: 'send-outline' },
      { key: 'pending-approvals', label: 'Pending Approvals', icon: 'time-outline' },
      { key: 'published-documents', label: 'Published Documents', icon: 'checkmark-done-outline' },
      { key: 'archived-documents', label: 'Archived Documents', icon: 'archive-outline' },
    ],
  },
  {
    key: 'ideas',
    title: 'Strategic Ideas',
    items: [
      { key: 'my-ideas', label: 'My Ideas', icon: 'bulb-outline' },
      { key: 'submitted-ideas', label: 'Submitted Ideas', icon: 'paper-plane-outline' },
      { key: 'pending-reviews', label: 'Pending Reviews', icon: 'hourglass-outline' },
      { key: 'approved-ideas', label: 'Approved Ideas', icon: 'checkmark-circle-outline' },
    ],
  },
  {
    key: 'administration',
    title: 'Administration',
    items: [
      {
        key: 'users',
        label: 'Users',
        icon: 'people-outline',
        route: ROUTES.MAIN.ACCOUNTS,
      },
      {
        key: 'employees',
        label: 'Employees',
        icon: 'id-card-outline',
        route: ROUTES.MAIN.EMPLOYEES,
      },
      {
        key: 'departments',
        label: 'Departments',
        icon: 'business-outline',
        route: ROUTES.MAIN.DEPARTMENTS,
      },
      {
        key: 'teams',
        label: 'Teams',
        icon: 'git-network-outline',
        route: ROUTES.MAIN.TEAMS,
      },
      {
        key: 'permissions',
        label: 'Permissions',
        icon: 'lock-closed-outline',
        route: ROUTES.MAIN.PERMISSIONS,
      },
      {
        key: 'role-permissions',
        label: 'Role Assignments',
        icon: 'ribbon-outline',
        route: ROUTES.MAIN.ROLE_PERMISSIONS,
      },
      {
        key: 'acl',
        label: 'Access Rules',
        icon: 'shield-checkmark-outline',
        route: ROUTES.MAIN.ACLS,
      },
    ],
  },
  {
    key: 'reports',
    title: 'Reports & Analytics',
    items: [
      { key: 'analytics', label: 'Analytics Dashboard', icon: 'bar-chart-outline' },
      { key: 'audit-logs', label: 'Audit Logs', icon: 'list-outline' },
      { key: 'escalations', label: 'Escalations', icon: 'trending-up-outline' },
    ],
  },
  {
    key: 'system',
    title: 'System',
    items: [{ key: 'settings', label: 'Settings', icon: 'settings-outline' }],
  },
];
