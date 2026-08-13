import { useCallback, useRef, useState } from 'react';
import { Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import { Badge } from '@components/common/Badge';
import { Button } from '@components/common/Button';
import { ConfirmDialog } from '@components/common/ConfirmDialog';
import { ErrorBanner } from '@components/common/ErrorBanner';
import { Loader } from '@components/common/Loader';
import { Screen } from '@components/layout/Screen';
import { useDeleteRolePermission } from '@hooks/useDeleteRolePermission';
import { useRolePermission } from '@hooks/useRolePermission';
import { useRolePermissionStatus } from '@hooks/useRolePermissionStatus';
import { ROUTES } from '@navigation/routes';
import { formatDate } from '@utils/format';
import { labelFor } from '@validation/employee';
import { permissionEffectPhrase } from '@validation/permission';
import { permissionRefLabel, ROLE_PERMISSION_STATUS } from '@validation/rolePermission';

import { styles } from '@theme/styles/RolePermissionDetailScreen.styles';

function Row({ label, value, fallback = 'Not set', divider = false }) {
  return (
    <View style={[styles.row, divider && styles.rowDivider]}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={value ? styles.rowValue : styles.rowValueMuted}>
        {value || fallback}
      </Text>
    </View>
  );
}

export function RolePermissionDetailScreen({ navigation, route }) {
  const { rolePermissionId } = route.params ?? {};

  const { rolePermission, isLoading, error, isForbidden, isNotFound, refresh } =
    useRolePermission(rolePermissionId);

  const {
    submit: changeStatus,
    isSubmitting: isChangingStatus,
    error: statusError,
    clearError: clearStatusError,
  } = useRolePermissionStatus();

  const {
    remove,
    isDeleting,
    error: deleteError,
    clearError: clearDeleteError,
  } = useDeleteRolePermission();

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
    if (!rolePermission) return;

    const nextStatus =
      rolePermission.status === ROLE_PERMISSION_STATUS.ACTIVE
        ? ROLE_PERMISSION_STATUS.INACTIVE
        : ROLE_PERMISSION_STATUS.ACTIVE;

    const updated = await changeStatus(rolePermissionId, nextStatus);

    if (updated) refresh();
  };

  const handleDelete = async () => {
    const deleted = await remove(rolePermissionId);

    setIsConfirmingDelete(false);

    if (deleted) navigation.goBack();
  };

  const renderBody = () => {
    if (isLoading) {
      return <Loader message="Loading role assignment…" fullScreen={false} />;
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

    if (!rolePermission) {
      return (
        <View style={styles.centred}>
          <Text style={styles.emptyTitle}>Role assignment not found</Text>
          <Text style={styles.emptyBody}>
            This record may have been removed since the list was loaded.
          </Text>
        </View>
      );
    }

    const isActive = rolePermission.status === ROLE_PERMISSION_STATUS.ACTIVE;
    const permissionName = permissionRefLabel(rolePermission.permission);
    const effectPhrase = permissionEffectPhrase(rolePermission.permission);
    const levelLabel = labelFor(rolePermission.hierarchyLevel) || 'this hierarchy';

    return (
      <View>
        <View style={styles.identity}>
          <View style={styles.nameRow}>
            <Text style={styles.name} numberOfLines={2}>
              {labelFor(rolePermission.hierarchyLevel) || 'Unknown level'}
            </Text>
            <Badge
              label={isActive ? 'Active' : 'Inactive'}
              tone={isActive ? 'success' : 'neutral'}
            />
          </View>
          <Text style={styles.code}>{permissionName || '—'}</Text>
        </View>

        <Text style={styles.sectionLabel}>Assignment</Text>
        <View style={styles.section}>
          <Row label="Hierarchy level" value={labelFor(rolePermission.hierarchyLevel)} />
          <Row label="Permission" value={permissionName} divider />
        </View>

        <Text style={styles.note}>
          {effectPhrase
            ? `This makes ${levelLabel} eligible to ${effectPhrase}.`
            : `This makes ${levelLabel} eligible for ${permissionName || 'this permission'}.`}{' '}
          It is not the final decision — an ACL rule still has to resolve to
          ALLOW for any specific request to succeed.
        </Text>

        <Text style={styles.sectionLabel}>Record</Text>
        <View style={styles.section}>
          <Row label="Status" value={isActive ? 'Active' : 'Inactive'} />
          <Row
            label="Created"
            value={formatDate(rolePermission.createdAt)}
            fallback="Unknown"
            divider
          />
          <Row
            label="Last updated"
            value={formatDate(rolePermission.updatedAt)}
            fallback="Unknown"
            divider
          />
        </View>

        <View style={styles.statusBlock}>
          <ErrorBanner message={statusError} />

          <Button
            title={isActive ? 'Deactivate assignment' : 'Activate assignment'}
            onPress={handleToggleStatus}
            loading={isChangingStatus}
            variant={isActive ? 'secondary' : 'primary'}
          />

          <Text style={styles.statusHint}>
            {isActive
              ? 'Deactivating removes this hierarchy from consideration for this permission without deleting the record.'
              : 'Reactivating makes this hierarchy eligible again.'}
          </Text>
        </View>

        <View style={styles.dangerBlock}>
          <Text style={styles.dangerLabel}>Danger zone</Text>

          <ErrorBanner message={deleteError} />

          <Button
            title="Delete assignment"
            onPress={() => setIsConfirmingDelete(true)}
            variant="danger"
            disabled={isDeleting}
          />

          <Text style={styles.statusHint}>
            Permanently removes the assignment. Deactivate instead if you only
            need to stop it from being considered.
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
        {rolePermission ? (
          <Button
            title="Edit"
            onPress={() =>
              navigation.navigate(ROUTES.MAIN.EDIT_ROLE_PERMISSION, {
                rolePermissionId,
              })
            }
            variant="text"
            fullWidth={false}
          />
        ) : null}
      </View>

      {renderBody()}

      <ConfirmDialog
        visible={isConfirmingDelete}
        title="Delete this role assignment?"
        message="The assignment will be permanently removed. The hierarchy will no longer be eligible for this permission."
        confirmLabel="Delete"
        confirmVariant="danger"
        onConfirm={handleDelete}
        onCancel={() => setIsConfirmingDelete(false)}
        isBusy={isDeleting}
      />
    </Screen>
  );
}
