import { useMemo, useState } from 'react';
import { Text, View } from 'react-native';

import { Loader } from '@components/common/Loader';
import { ApprovalFlowPanel } from '@components/dashboard/ApprovalFlowPanel';
import { DocumentStatusPanel } from '@components/dashboard/DocumentStatusPanel';
import { QuickActionsPanel } from '@components/dashboard/QuickActionsPanel';
import { StatCard } from '@components/dashboard/StatCard';
import { WorkflowListPanel } from '@components/dashboard/WorkflowListPanel';
import { AccountMenu } from '@components/shell/AccountMenu';
import { AppShell } from '@components/shell/AppShell';
import { useAuth } from '@context/AuthContext';
import { useToast } from '@context/ToastContext';
import { useBreakpoint } from '@hooks/useBreakpoint';
import { useDashboard } from '@hooks/useDashboard';
import { useDepartments } from '@hooks/useDepartments';
import { useDocuments } from '@hooks/useDocuments';
import { useMySubmissions } from '@hooks/useMySubmissions';
import { usePendingWorkflows } from '@hooks/usePendingWorkflows';
import { useTeams } from '@hooks/useTeams';
import { ROUTES } from '@navigation/routes';
import { documentStatusLabel, documentStatusTone } from '@validation/document';
import {
  documentRefLabel,
  employeeRefLabel,
  workflowLevelLabel,
  workflowStatusLabel,
  workflowStatusTone,
} from '@validation/workflow';

import { styles } from '@theme/styles/HomeScreen.styles';

/**
 * Every stat/panel below is sourced from an endpoint this app has already
 * confirmed live (workflow pending/my-submissions, employee, department,
 * team). Nothing here is a placeholder number — a slot with no backing
 * endpoint (an org-wide approval-stage breakdown, a strategic-ideas
 * pipeline, an audit-log feed) was removed rather than filled with a
 * fabricated one. See docs/backend-specs/README.md's "Client-side state".
 *
 * `requires` marks the ones only some roles can actually use — GET /employee
 * is SUPER_ADMIN-only and GET /department is SUPER_ADMIN/EXECUTIVE-only, so
 * an Employee/Intern account 403s on both. There's no client-visible role
 * field to gate on directly (see AuthContext's header comment), so this is
 * gated on the real per-request `isForbidden` each list hook already surfaces
 * — the same signal that already exists, not a new guess.
 */
const QUICK_ACTIONS = [
  {
    key: 'create-document',
    label: 'Create Document',
    icon: 'add-circle-outline',
    tone: 'info',
    route: ROUTES.MAIN.CREATE_DOCUMENT,
    requires: null,
  },
  {
    key: 'my-approvals',
    label: 'My Pending Approvals',
    icon: 'checkmark-done-outline',
    tone: 'success',
    route: ROUTES.MAIN.PENDING_APPROVALS,
    requires: null,
  },
  {
    key: 'my-submissions',
    label: 'My Submissions',
    icon: 'send-outline',
    tone: 'accent',
    route: ROUTES.MAIN.MY_SUBMISSIONS,
    requires: null,
  },
  {
    key: 'employees',
    label: 'Employees',
    icon: 'people-outline',
    tone: 'primary',
    route: ROUTES.MAIN.EMPLOYEES,
    requires: 'employees',
  },
  {
    key: 'departments',
    label: 'Departments',
    icon: 'business-outline',
    tone: 'neutral',
    route: ROUTES.MAIN.DEPARTMENTS,
    requires: 'departments',
  },
];

/**
 * Percentage bases rather than flex weights, because only a real width can
 * wrap: a `flexBasis: 0` column always fits and so never breaks to a new line.
 */
function basisFor(index, count, columns, weights) {
  if (columns === 1) return '100%';

  if (columns === 2) {
    // A lone trailing item takes the whole line rather than leaving a hole.
    const isTrailingOdd = index === count - 1 && count % 2 === 1;
    return isTrailingOdd ? '100%' : '50%';
  }

  const total = weights.reduce((sum, weight) => sum + weight, 0);
  return `${(weights[index] / total) * 100}%`;
}

function Grid({ items, columns, weights }) {
  return (
    <View style={styles.grid}>
      {items.map((node, index) => (
        <View
          key={node.key ?? index}
          style={[
            styles.cell,
            { flexBasis: basisFor(index, items.length, columns, weights) },
          ]}
        >
          {node}
        </View>
      ))}
    </View>
  );
}

/**
 * Prefers the real name from the populated Employee reference — every login
 * response includes `user.employeeId.firstName`/`.lastName` — over guessing
 * one from the email's local part, which was the only thing this could fall
 * back on before (there's no top-level `name` field on the User model).
 */
function displayNameFor(user) {
  const employee =
    user?.employeeId && typeof user.employeeId === 'object'
      ? user.employeeId
      : null;

  const fullName = [employee?.firstName, employee?.lastName]
    .filter(Boolean)
    .join(' ');
  if (fullName) return fullName;

  if (user?.name) return user.name;

  const local = String(user?.email ?? '').split('@')[0];
  if (!local) return 'there';

  return local
    .replace(/[._-]+/g, ' ')
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

/** Mirrors WorkflowCard's own field logic: the pending-approvals list is
 * scoped to workflows where you're the reviewer, so the useful line is who
 * submitted it; my-submissions is scoped to workflows you own, so the
 * useful line is who's holding it now. */
function metaFor(workflow, perspective) {
  const level = workflowLevelLabel(workflow.currentLevel);

  if (perspective === 'pending') {
    const owner = employeeRefLabel(workflow.owner ?? workflow.document?.owner);
    return owner ? `Submitted by ${owner}` : level ? `Waiting on ${level}` : null;
  }

  const reviewer = employeeRefLabel(workflow.currentReviewer);
  return reviewer ? `With ${reviewer}` : level ? `Waiting on ${level}` : null;
}

function toListItems(workflows, perspective) {
  return workflows.slice(0, 5).map((workflow) => ({
    key: workflow._id,
    title: documentRefLabel(workflow.document) ?? 'Untitled document',
    meta: metaFor(workflow, perspective),
    stage: workflowStatusLabel(workflow.status),
    tone: workflowStatusTone(workflow.status),
  }));
}

function toDocumentListItems(documents) {
  return documents.slice(0, 5).map((document) => ({
    key: document._id,
    title: document.title || 'Untitled document',
    meta: (() => {
      const owner = employeeRefLabel(document.owner);
      return owner ? `Owned by ${owner}` : null;
    })(),
    stage: documentStatusLabel(document.status),
    tone: documentStatusTone(document.status),
  }));
}

export function HomeScreen({ navigation }) {
  const { user, signOut, isTeamLeadOrAbove } = useAuth();
  const toast = useToast();
  const { columns, statColumns } = useBreakpoint();

  const dashboard = useDashboard();
  const pending = usePendingWorkflows();
  const submissions = useMySubmissions();
  const departments = useDepartments();
  const teams = useTeams();
  const documents = useDocuments();

  // Same three-way split PublishedDocumentsScreen uses, so a card and the
  // screen its footer opens can never disagree about what they contain.
  const publishedDocuments = useMemo(
    () =>
      documents.documents.filter(
        (document) =>
          document.status !== 'ARCHIVED' && document.status !== 'DRAFT'
      ),
    [documents.documents]
  );
  const archivedDocuments = useMemo(
    () => documents.documents.filter((document) => document.status === 'ARCHIVED'),
    [documents.documents]
  );

  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const name = displayNameFor(user);

  const handleSignOut = async () => {
    if (isSigningOut) return;

    setIsAccountMenuOpen(false);
    setIsSigningOut(true);
    await signOut();
    toast.success('Signed out.');
  };

  const goTo = (route) => () => navigation.navigate(route);

  // Fails closed while a probe is still in flight, same reasoning as the
  // Sidebar's role gating: a card that appears and then vanishes once the
  // 403 lands reads worse than one that simply appears a beat later.
  // Reviewing is supervisory — a workflow is never routed below Team Lead, so
  // for anyone under it this panel is guaranteed empty. Fails closed while
  // the role is unresolved (null), same as every other gate here.
  const canReview = isTeamLeadOrAbove === true;

  const canSeeEmployees = !dashboard.isLoading && !dashboard.isForbidden;
  const canSeeDepartments = !departments.isLoading && !departments.isForbidden;
  const canSeeTeams = !teams.isLoading && !teams.isForbidden;

  // While any of these three are still in flight, statCards/middlePanels
  // below would render whatever's resolved so far — on an account switch
  // that's a real (if very brief) window where the layout reflects "nothing
  // confirmed yet" rather than either account's actual access. A generic
  // loader in that window reads as "checking", not as a wrong-sized layout.
  const isCheckingAccess =
    dashboard.isLoading || departments.isLoading || teams.isLoading;

  const statCards = [
    canReview && {
      key: 'pending-approvals',
      icon: 'checkmark-done-outline',
      tone: 'success',
      value: pending.isLoading ? '—' : String(pending.workflows.length),
      label: 'Pending Approvals',
      linkLabel: 'Review now',
      onPress: goTo(ROUTES.MAIN.PENDING_APPROVALS),
    },
    {
      key: 'my-submissions',
      icon: 'send-outline',
      tone: 'info',
      value: submissions.isLoading ? '—' : String(submissions.workflows.length),
      label: 'My Submissions',
      linkLabel: 'View submissions',
      onPress: goTo(ROUTES.MAIN.MY_SUBMISSIONS),
    },
    canSeeEmployees && {
      key: 'active-employees',
      icon: 'people-outline',
      tone: 'primary',
      value: String(dashboard.stats.active),
      label: 'Active Employees',
      linkLabel: 'View employees',
      onPress: goTo(ROUTES.MAIN.EMPLOYEES),
    },
    canSeeDepartments && {
      key: 'departments',
      icon: 'business-outline',
      tone: 'accent',
      value: String(departments.totalCount),
      label: 'Departments',
      linkLabel: 'View departments',
      onPress: goTo(ROUTES.MAIN.DEPARTMENTS),
    },
  ].filter(Boolean);

  const visibleQuickActions = QUICK_ACTIONS.filter((action) => {
    if (action.requires === 'employees') return canSeeEmployees;
    if (action.requires === 'departments') return canSeeDepartments;
    return true;
  });

  const employeeOverview = useMemo(() => {
    const { total, active, inactive, awaitingRegistration } = dashboard.stats;
    const pct = (count) => (total ? `${Math.round((count / total) * 100)}%` : '0%');

    return {
      total: String(total),
      segments: [
        { key: 'active', label: 'Active', count: active, share: pct(active), tone: 'success' },
        { key: 'inactive', label: 'Inactive', count: inactive, share: pct(inactive), tone: 'neutral' },
        {
          key: 'awaiting',
          label: 'Awaiting Registration',
          count: awaitingRegistration,
          share: pct(awaitingRegistration),
          tone: 'accent',
        },
      ],
    };
  }, [dashboard.stats]);

  const organizationSnapshot = [
    canSeeDepartments && {
      key: 'departments',
      label: 'Departments',
      value: departments.totalCount,
      tone: 'primary',
    },
    canSeeTeams && {
      key: 'teams',
      label: 'Teams',
      value: teams.teams.length,
      tone: 'info',
    },
    canSeeEmployees && {
      key: 'employees',
      label: 'Employees',
      value: dashboard.stats.active,
      tone: 'success',
    },
  ].filter(Boolean);

  // Built together so the weight array always matches the panels actually
  // rendered — Employee Overview and Organization Snapshot each depend on
  // data this account may not be authorized to see at all.
  const middlePanels = [
    canSeeEmployees && {
      weight: 1.1,
      node: (
        <DocumentStatusPanel key="employees" title="Employee Overview" data={employeeOverview} />
      ),
    },
    organizationSnapshot.length && {
      weight: 1.1,
      node: (
        <ApprovalFlowPanel key="org" title="Organization Snapshot" series={organizationSnapshot} />
      ),
    },
    {
      weight: 0.8,
      node: (
        <QuickActionsPanel
          key="actions"
          actions={visibleQuickActions}
          onActionPress={(action) => action.route && navigation.navigate(action.route)}
        />
      ),
    },
  ].filter(Boolean);

  return (
    <AppShell
      activeKey="dashboard"
      onNavigate={(item) => item.route && navigation.navigate(item.route, item.params)}
      email={user?.email}
      name={name}
      onProfilePress={() => setIsAccountMenuOpen(true)}
    >
      <View style={styles.greeting}>
        <View style={styles.greetingCopy}>
          <Text style={styles.greetingTitle}>Welcome back, {name} 👋</Text>
          <Text style={styles.greetingSubtitle}>
            Here&rsquo;s what&rsquo;s happening in your workspace today.
          </Text>
        </View>
      </View>

      {isCheckingAccess ? (
        <Loader message="Loading your dashboard…" fullScreen={false} />
      ) : (
        <>
          <Grid
            columns={statColumns}
            weights={statCards.map(() => 1)}
            items={statCards.map((card) => (
              <StatCard
                key={card.key}
                icon={card.icon}
                tone={card.tone}
                value={card.value}
                label={card.label}
                linkLabel={card.linkLabel}
                onPress={card.onPress}
              />
            ))}
          />

          <Grid
            columns={columns}
            weights={middlePanels.map((panel) => panel.weight)}
            items={middlePanels.map((panel) => panel.node)}
          />
        </>
      )}

      {/* My Submissions is everyone's; the approvals panel joins it only for
          Team Lead and above, and the row collapses to a single full-width
          panel rather than leaving a gap where it would have been. */}
      <Grid
        columns={columns}
        weights={canReview ? [1, 1] : [1]}
        items={[
          canReview ? (
            <WorkflowListPanel
              key="pending"
              title="My Pending Approvals"
              footerLabel="View all pending"
              onFooterPress={goTo(ROUTES.MAIN.PENDING_APPROVALS)}
              items={toListItems(pending.workflows, 'pending')}
              emptyLabel={
                pending.isForbidden
                  ? 'Not visible to your role.'
                  : pending.isLoading
                  ? 'Loading…'
                  : 'Nothing waiting on your review.'
              }
            />
          ) : null,
          <WorkflowListPanel
            key="submissions"
            title="My Submissions"
            footerLabel="View all submissions"
            onFooterPress={goTo(ROUTES.MAIN.MY_SUBMISSIONS)}
            items={toListItems(submissions.workflows, 'submissions')}
            emptyLabel={
              submissions.isForbidden
                ? 'Not visible to your role.'
                : submissions.isLoading
                ? 'Loading…'
                : "You haven't submitted anything yet."
            }
          />,
        ].filter(Boolean)}
      />

      <Grid
        columns={columns}
        weights={[1, 1]}
        items={[
          <WorkflowListPanel
            key="published-documents"
            title="Published Documents"
            footerLabel="View all published"
            onFooterPress={goTo(ROUTES.MAIN.PUBLISHED_DOCUMENTS)}
            items={toDocumentListItems(publishedDocuments)}
            emptyLabel={
              documents.isForbidden
                ? 'Not visible to your role.'
                : documents.isLoading
                ? 'Loading…'
                : 'Nothing published yet.'
            }
          />,
          <WorkflowListPanel
            key="archived-documents"
            title="Archived Documents"
            footerLabel="View all archived"
            onFooterPress={() =>
              navigation.navigate(ROUTES.MAIN.PUBLISHED_DOCUMENTS, {
                focus: 'archived',
              })
            }
            items={toDocumentListItems(archivedDocuments)}
            emptyLabel={
              documents.isForbidden
                ? 'Not visible to your role.'
                : documents.isLoading
                ? 'Loading…'
                : 'Nothing archived yet.'
            }
          />,
        ]}
      />

      <AccountMenu
        visible={isAccountMenuOpen}
        name={name}
        email={user?.email}
        onChangePassword={() => {
          setIsAccountMenuOpen(false);
          navigation.navigate(ROUTES.MAIN.CHANGE_PASSWORD);
        }}
        onSignOut={handleSignOut}
        onDismiss={() => setIsAccountMenuOpen(false)}
      />
    </AppShell>
  );
}
