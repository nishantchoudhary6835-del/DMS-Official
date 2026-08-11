import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { ConfirmDialog } from '@components/common/ConfirmDialog';
import { ActivityPanel } from '@components/dashboard/ActivityPanel';
import { ApprovalFlowPanel } from '@components/dashboard/ApprovalFlowPanel';
import { DocumentStatusPanel } from '@components/dashboard/DocumentStatusPanel';
import { IdeasPipelinePanel } from '@components/dashboard/IdeasPipelinePanel';
import { QuickActionsPanel } from '@components/dashboard/QuickActionsPanel';
import { RecentDocumentsPanel } from '@components/dashboard/RecentDocumentsPanel';
import { StatCard } from '@components/dashboard/StatCard';
import { AppShell } from '@components/shell/AppShell';
import { useAuth } from '@context/AuthContext';
import { useBreakpoint } from '@hooks/useBreakpoint';
import { theme } from '@theme';

import {
  APPROVAL_FLOW,
  DOCUMENT_STATUS,
  IDEAS_PIPELINE,
  QUICK_ACTIONS,
  RECENT_ACTIVITY,
  RECENT_DOCUMENTS,
  STAT_CARDS,
} from './placeholders';

import { styles } from '@theme/styles/HomeScreen.styles';

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

function displayNameFor(user) {
  if (user?.name) return user.name;

  const local = String(user?.email ?? '').split('@')[0];
  if (!local) return 'there';

  return local
    .replace(/[._-]+/g, ' ')
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

export function HomeScreen({ navigation }) {
  const { user, signOut } = useAuth();
  const { columns, statColumns } = useBreakpoint();

  const [isConfirmingSignOut, setIsConfirmingSignOut] = useState(false);

  const name = displayNameFor(user);

  return (
    <AppShell
      activeKey="dashboard"
      onNavigate={(item) => item.route && navigation.navigate(item.route)}
      email={user?.email}
      name={name}
      role="Team Lead"
      onProfilePress={() => setIsConfirmingSignOut(true)}
    >
      <View style={styles.greeting}>
        <View style={styles.greetingCopy}>
          <Text style={styles.greetingTitle}>Welcome back, {name} 👋</Text>
          <Text style={styles.greetingSubtitle}>
            Here&rsquo;s what&rsquo;s happening in your workspace today.
          </Text>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Change period"
          style={({ hovered }) => [styles.period, hovered && styles.periodHovered]}
        >
          <Ionicons
            name="calendar-outline"
            size={14}
            color={theme.colors.textSecondary}
          />
          <Text style={styles.periodLabel}>This Month</Text>
          <Ionicons
            name="chevron-down"
            size={14}
            color={theme.colors.textMuted}
          />
        </Pressable>
      </View>

      <Grid
        columns={statColumns}
        weights={[1, 1, 1, 1]}
        items={STAT_CARDS.map((card) => (
          <StatCard
            key={card.key}
            icon={card.icon}
            tone={card.tone}
            value={card.value}
            label={card.label}
            linkLabel={card.linkLabel}
          />
        ))}
      />

      <Grid
        columns={columns}
        weights={[1.1, 1.1, 0.8]}
        items={[
          <DocumentStatusPanel key="status" data={DOCUMENT_STATUS} />,
          <ApprovalFlowPanel key="flow" series={APPROVAL_FLOW} />,
          <QuickActionsPanel key="actions" actions={QUICK_ACTIONS} />,
        ]}
      />

      <Grid
        columns={columns}
        weights={[1.25, 0.9, 0.85]}
        items={[
          <RecentDocumentsPanel key="documents" documents={RECENT_DOCUMENTS} />,
          <IdeasPipelinePanel key="ideas" ideas={IDEAS_PIPELINE} />,
          <ActivityPanel key="activity" entries={RECENT_ACTIVITY} />,
        ]}
      />

      <ConfirmDialog
        visible={isConfirmingSignOut}
        title="Sign out?"
        message="You will need to sign in again to get back in."
        confirmLabel="Sign out"
        confirmVariant="danger"
        onConfirm={signOut}
        onCancel={() => setIsConfirmingSignOut(false)}
      />
    </AppShell>
  );
}
