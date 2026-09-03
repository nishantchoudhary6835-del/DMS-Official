import { useCallback, useRef, useState } from 'react';
import { Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import { Badge } from '@components/common/Badge';
import { Button } from '@components/common/Button';
import { ConfirmDialog } from '@components/common/ConfirmDialog';
import { ErrorBanner } from '@components/common/ErrorBanner';
import { Loader } from '@components/common/Loader';
import { Screen } from '@components/layout/Screen';
import { useToast } from '@context/ToastContext';
import { useDeleteTeam } from '@hooks/useDeleteTeam';
import { useTeam } from '@hooks/useTeam';
import { useTeamStatus } from '@hooks/useTeamStatus';
import { ROUTES } from '@navigation/routes';
import { formatDateTime } from '@utils/format';
import { labelFor } from '@validation/employee';
import { TEAM_STATUS } from '@validation/team';

import { styles } from '@theme/styles/TeamDetailScreen.styles';

function departmentLabel(department) {
  if (!department || typeof department !== 'object') return null;
  if (!department.name) return null;

  return department.code
    ? `${department.name} (${department.code})`
    : department.name;
}

function leadName(teamLead) {
  if (!teamLead || typeof teamLead !== 'object') return null;

  const name = [teamLead.firstName, teamLead.lastName].filter(Boolean).join(' ');

  return name || teamLead.employeeId || null;
}

function leadMeta(teamLead) {
  if (!teamLead || typeof teamLead !== 'object') return null;

  return [teamLead.employeeId, labelFor(teamLead.hierarchyLevel)]
    .filter(Boolean)
    .join(' · ');
}

function Row({ label, value, fallback = 'Not assigned', divider = false }) {
  return (
    <View style={[styles.row, divider && styles.rowDivider]}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={value ? styles.rowValue : styles.rowValueMuted}>
        {value || fallback}
      </Text>
    </View>
  );
}

export function TeamDetailScreen({ navigation, route }) {
  const { teamId } = route.params ?? {};
  const toast = useToast();

  const { team, isLoading, error, isForbidden, isNotFound, refresh } =
    useTeam(teamId);

  const {
    submit: changeStatus,
    isSubmitting: isChangingStatus,
    error: statusError,
    clearError: clearStatusError,
  } = useTeamStatus();

  const {
    remove,
    isDeleting,
    error: deleteError,
    isBlocked,
    clearError: clearDeleteError,
  } = useDeleteTeam();

  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  const hasFocusedOnce = useRef(false);

  useFocusEffect(
    useCallback(() => {
      if (!hasFocusedOnce.current) {
        hasFocusedOnce.current = true;
        return;
      }
      clearStatusError();
      clearDeleteError();
      refresh();
    }, [refresh, clearStatusError, clearDeleteError])
  );

  const handleToggleStatus = async () => {
    if (!team) return;

    const nextStatus =
      team.status === TEAM_STATUS.ACTIVE
        ? TEAM_STATUS.INACTIVE
        : TEAM_STATUS.ACTIVE;

    const updated = await changeStatus(teamId, nextStatus);

    if (updated) {
      toast.success(
        nextStatus === TEAM_STATUS.ACTIVE ? 'Team activated.' : 'Team deactivated.'
      );
      refresh();
    }
  };

  const handleDelete = async () => {
    const deleted = await remove(teamId);

    setIsConfirmingDelete(false);

    // Only leave on success. A refusal — employees still assigned, or a Team
    // Lead lacking delete rights — keeps the team on screen with its reason.
    if (deleted) {
      toast.success('Team deleted.');
      navigation.goBack();
    }
  };

  const renderBody = () => {
    if (isLoading) {
      return <Loader message="Loading team…" fullScreen={false} />;
    }

    if (error) {
      return (
        <View style={styles.errorBlock}>
          <ErrorBanner message={error} />
          {!isForbidden && !isNotFound ? (
            <Button
              title="Try again"
              onPress={refresh}
              variant="secondary"
              fullWidth={false}
            />
          ) : null}
        </View>
      );
    }

    if (!team) {
      return (
        <View style={styles.centred}>
          <Text style={styles.emptyTitle}>Team not found</Text>
          <Text style={styles.emptyBody}>
            This record may have been removed since the list was loaded.
          </Text>
        </View>
      );
    }

    const isActive = team.status === TEAM_STATUS.ACTIVE;

    return (
      <View>
        <View style={styles.identity}>
          <View style={styles.nameRow}>
            <Text style={styles.name} numberOfLines={2}>
              {team.name || 'Unnamed team'}
            </Text>
            <Badge
              label={isActive ? 'Active' : 'Inactive'}
              tone={isActive ? 'success' : 'neutral'}
            />
          </View>
        </View>

        <Text style={styles.sectionLabel}>Placement</Text>
        <View style={styles.section}>
          <Row
            label="Department"
            value={departmentLabel(team.department)}
            fallback="No department"
          />
          <Row
            label="Team lead"
            value={leadName(team.teamLead)}
            fallback="No lead assigned"
            divider
          />
          <Row label="Employee" value={leadMeta(team.teamLead)} divider />
        </View>

        <Text style={styles.sectionLabel}>Record</Text>
        <View style={styles.section}>
          <Row label="Status" value={isActive ? 'Active' : 'Inactive'} />
          <Row
            label="Created"
            value={formatDateTime(team.createdAt)}
            fallback="Unknown"
            divider
          />
          <Row
            label="Last updated"
            value={formatDateTime(team.updatedAt)}
            fallback="Unknown"
            divider
          />
        </View>

        <View style={styles.statusBlock}>
          <ErrorBanner message={statusError} />

          <Button
            title={isActive ? 'Deactivate team' : 'Activate team'}
            onPress={handleToggleStatus}
            loading={isChangingStatus}
            variant={isActive ? 'secondary' : 'primary'}
          />

          <Text style={styles.statusHint}>
            {isActive
              ? 'Deactivating hides this team from assignment without affecting employees already in it.'
              : 'Reactivating makes this team assignable again.'}
          </Text>
        </View>

        <View style={styles.dangerBlock}>
          <Text style={styles.dangerLabel}>Danger zone</Text>

          <ErrorBanner message={deleteError} />

          <Button
            title="Delete team"
            onPress={() => setIsConfirmingDelete(true)}
            variant="danger"
            disabled={isDeleting}
          />

          <Text style={styles.statusHint}>
            {isBlocked
              ? 'Reassign or remove the employees in this team first, or deactivate it instead.'
              : 'Permanently removes the team. Only a Super Admin can delete; deactivate instead to stop new assignments.'}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <Screen padded={false} style={styles.page}>
      <View style={styles.header}>
        <Button
          title="Back"
          icon="chevron-back"
          onPress={() => navigation.goBack()}
          variant="text"
          fullWidth={false}
        />
        {team ? (
          <Button
            title="Edit"
            onPress={() =>
              navigation.navigate(ROUTES.MAIN.EDIT_TEAM, { teamId })
            }
            variant="text"
            fullWidth={false}
          />
        ) : null}
      </View>

      {renderBody()}

      <ConfirmDialog
        visible={isConfirmingDelete}
        title="Delete this team?"
        message="The team will be permanently removed. This is refused if any employees are still assigned to it, and only a Super Admin may delete."
        confirmLabel="Delete"
        confirmVariant="danger"
        onConfirm={handleDelete}
        onCancel={() => setIsConfirmingDelete(false)}
        isBusy={isDeleting}
      />
    </Screen>
  );
}
