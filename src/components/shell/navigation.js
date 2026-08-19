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
      {
        key: 'create-document',
        label: 'Create Document',
        icon: 'add-circle-outline',
        route: ROUTES.MAIN.CREATE_DOCUMENT,
      },
      {
        key: 'submitted-documents',
        label: 'Submitted Documents',
        icon: 'send-outline',
        route: ROUTES.MAIN.MY_SUBMISSIONS,
      },
      {
        key: 'pending-approvals',
        label: 'Pending Approvals',
        icon: 'time-outline',
        route: ROUTES.MAIN.PENDING_APPROVALS,
      },
      {
        key: 'published-documents',
        label: 'Published Documents',
        icon: 'checkmark-circle-outline',
        route: ROUTES.MAIN.PUBLISHED_DOCUMENTS,
      },
      {
        key: 'archived-documents',
        label: 'Archived Documents',
        icon: 'archive-outline',
        route: ROUTES.MAIN.PUBLISHED_DOCUMENTS,
        // Same screen as Published Documents (it already sections Published/
        // Archived together) — this just lands scrolled to the Archived
        // section instead of the top. See PublishedDocumentsScreen's
        // handling of route.params.focus.
        params: { focus: 'archived' },
      },
    ],
  },
  {
    key: 'administration',
    title: 'Administration',
    // Whole section: Super Admin or Executive only, read from the signed-in
    // employee's hierarchyLevel — see ADMIN_OR_ABOVE_LEVELS in AuthContext.jsx.
    requiresAccess: 'ADMIN_OR_ABOVE',
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
        // Narrower than the section itself — Super Admin only, hidden even
        // from an Executive who can otherwise see Administration.
        requiresAccess: 'SUPER_ADMIN',
      },
      {
        key: 'role-permissions',
        label: 'Role Assignments',
        icon: 'ribbon-outline',
        route: ROUTES.MAIN.ROLE_PERMISSIONS,
        requiresAccess: 'SUPER_ADMIN',
      },
      {
        key: 'acl',
        label: 'Access Rules',
        icon: 'shield-checkmark-outline',
        route: ROUTES.MAIN.ACLS,
        requiresAccess: 'SUPER_ADMIN',
      },
    ],
  },
];
