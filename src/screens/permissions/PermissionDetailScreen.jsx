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
import { useDeletePermission } from '@hooks/useDeletePermission';
import { usePermission } from '@hooks/usePermission';
import { usePermissionStatus } from '@hooks/usePermissionStatus';
import { ROUTES } from '@navigation/routes';
import { formatDate } from '@utils/format';
import {
  actionExplainer,
  actionLabel,
  permissionCode,
  permissionSentence,
  resourceLabel,
  PERMISSION_STATUS,
} from '@validation/permission';

import { styles } from '@theme/styles/PermissionDetailScreen.styles';

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

export function PermissionDetailScreen({ navigation, route }) {
  const { permissionId } = route.params ?? {};
  const toast = useToast();

  const { permission, isLoading, error, isForbidden, isNotFound, refresh } =
    usePermission(permissionId);

  const {
    submit: changeStatus,
    isSubmitting: isChangingStatus,
    error: statusError,
    clearError: clearStatusError,
  } = usePermissionStatus();

  const {
    remove,
    isDeleting,
    error: deleteError,
    clearError: clearDeleteError,
  } = useDeletePermission();

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
    if (!permission) return;

    const nextStatus =
      permission.status === PERMISSION_STATUS.ACTIVE
        ? PERMISSION_STATUS.INACTIVE
        : PERMISSION_STATUS.ACTIVE;

    const updated = await changeStatus(permissionId, nextStatus);

    if (updated) {
      toast.success(
        nextStatus === PERMISSION_STATUS.ACTIVE
          ? 'Permission activated.'
          : 'Permission deactivated.'
      );
      refresh();
    }
  };

  const handleDelete = async () => {
    const deleted = await remove(permissionId);

    setIsConfirmingDelete(false);

    // Only leave on success. A refusal keeps the record on screen with its
    // reason attached rather than dropping it optimistically.
    if (deleted) {
      toast.success('Permission deleted.');
      navigation.goBack();
    }
  };

  const renderBody = () => {
    if (isLoading) {
      return <Loader message="Loading permission…" fullScreen={false} />;
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

    if (!permission) {
      return (
        <View style={styles.centred}>
          <Text style={styles.emptyTitle}>Permission not found</Text>
          <Text style={styles.emptyBody}>
            This record may have been removed since the list was loaded.
          </Text>
        </View>
      );
    }

    const isActive = permission.status === PERMISSION_STATUS.ACTIVE;

    return (
      <View>
        <View style={styles.identity}>
          <View style={styles.nameRow}>
            <Text style={styles.name} numberOfLines={2}>
              {permissionSentence(permission) || 'Unnamed permission'}
            </Text>
            <Badge
              label={isActive ? 'Active' : 'Inactive'}
              tone={isActive ? 'success' : 'neutral'}
            />
          </View>
          <Text style={styles.code}>{permissionCode(permission)}</Text>
        </View>

        <Text style={styles.sectionLabel}>Definition</Text>
        <View style={styles.section}>
          <Row label="Resource" value={resourceLabel(permission.resource)} />
          <Row label="Action" value={actionLabel(permission.action)} divider />
          <Row label="What it does" value={actionExplainer(permission)} divider />
          <Row
            label="Note"
            value={permission.description}
            fallback="No additional note"
            divider
          />
        </View>

        <Text style={styles.note}>
          This defines that the action exists on the resource. It grants
          nothing by itself — assign it to a hierarchy through RolePermission,
          then it passes through the ACL, before it allows anyone anything.
        </Text>

        <Text style={styles.sectionLabel}>Record</Text>
        <View style={styles.section}>
          <Row label="Status" value={isActive ? 'Active' : 'Inactive'} />
          <Row
            label="Created"
            value={formatDate(permission.createdAt)}
            fallback="Unknown"
            divider
          />
          <Row
            label="Last updated"
            value={formatDate(permission.updatedAt)}
            fallback="Unknown"
            divider
          />
        </View>

        <View style={styles.statusBlock}>
          <ErrorBanner message={statusError} />

          <Button
            title={isActive ? 'Deactivate permission' : 'Activate permission'}
            onPress={handleToggleStatus}
            loading={isChangingStatus}
            variant={isActive ? 'secondary' : 'primary'}
          />

          <Text style={styles.statusHint}>
            {isActive
              ? 'Deactivating removes this permission from access checks without deleting the record.'
              : 'Reactivating makes this permission eligible for access checks again.'}
          </Text>
        </View>

        <View style={styles.dangerBlock}>
          <Text style={styles.dangerLabel}>Danger zone</Text>

          <ErrorBanner message={deleteError} />

          <Button
            title="Delete permission"
            onPress={() => setIsConfirmingDelete(true)}
            variant="danger"
            disabled={isDeleting}
          />

          <Text style={styles.statusHint}>
            Permanently removes the permission. Deactivate instead if you only
            need to stop it from being granted.
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
        {permission ? (
          <Button
            title="Edit"
            onPress={() =>
              navigation.navigate(ROUTES.MAIN.EDIT_PERMISSION, { permissionId })
            }
            variant="text"
            fullWidth={false}
          />
        ) : null}
      </View>

      {renderBody()}

      <ConfirmDialog
        visible={isConfirmingDelete}
        title="Delete this permission?"
        message="The permission will be permanently removed. Anything that assigns it through RolePermission will lose that grant."
        confirmLabel="Delete"
        confirmVariant="danger"
        onConfirm={handleDelete}
        onCancel={() => setIsConfirmingDelete(false)}
        isBusy={isDeleting}
      />
    </Screen>
  );
}
