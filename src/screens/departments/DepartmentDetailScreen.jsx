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
import { useDeleteDepartment } from '@hooks/useDeleteDepartment';
import { useDepartment } from '@hooks/useDepartment';
import { useDepartmentStatus } from '@hooks/useDepartmentStatus';
import { ROUTES } from '@navigation/routes';
import { formatDate } from '@utils/format';
import { DEPARTMENT_STATUS } from '@validation/department';
import { labelFor } from '@validation/employee';

import { styles } from '@theme/styles/DepartmentDetailScreen.styles';

function headName(head) {
  if (!head || typeof head !== 'object') return null;

  const name = [head.firstName, head.lastName].filter(Boolean).join(' ');

  return name || head.employeeId || null;
}

function headMeta(head) {
  if (!head || typeof head !== 'object') return null;

  return [head.employeeId, labelFor(head.hierarchyLevel)]
    .filter(Boolean)
    .join(' · ');
}

function Row({ label, value, fallback = 'Not assigned', divider = false }) {
  return (
    <View style={[styles.row, divider && styles.rowDivider]}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={value ? styles.rowValue : styles.rowValueMuted}>
        {/* `||`, not `??` — an empty string is as absent as null here, and
            labelFor returns '' rather than undefined for a missing value. */}
        {value || fallback}
      </Text>
    </View>
  );
}

export function DepartmentDetailScreen({ navigation, route }) {
  const { departmentId } = route.params ?? {};
  const toast = useToast();

  const { department, isLoading, error, isForbidden, isNotFound, refresh } =
    useDepartment(departmentId);

  const {
    submit: changeStatus,
    isSubmitting: isChangingStatus,
    error: statusError,
    clearError: clearStatusError,
  } = useDepartmentStatus();

  const {
    remove,
    isDeleting,
    error: deleteError,
    isBlocked,
    clearError: clearDeleteError,
  } = useDeleteDepartment();

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
    if (!department) return;

    const nextStatus =
      department.status === DEPARTMENT_STATUS.ACTIVE
        ? DEPARTMENT_STATUS.INACTIVE
        : DEPARTMENT_STATUS.ACTIVE;

    const updated = await changeStatus(departmentId, nextStatus);

    if (updated) {
      toast.success(
        nextStatus === DEPARTMENT_STATUS.ACTIVE
          ? 'Department activated.'
          : 'Department deactivated.'
      );
      refresh();
    }
  };

  const handleDelete = async () => {
    const deleted = await remove(departmentId);

    setIsConfirmingDelete(false);

    // Only leave on success. A refusal — employees still assigned — has to
    // keep the department on screen with its explanation attached.
    if (deleted) {
      toast.success('Department deleted.');
      navigation.goBack();
    }
  };

  const renderBody = () => {
    if (isLoading) {
      return <Loader message="Loading department…" fullScreen={false} />;
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

    if (!department) {
      return (
        <View style={styles.centred}>
          <Text style={styles.emptyTitle}>Department not found</Text>
          <Text style={styles.emptyBody}>
            This record may have been removed since the list was loaded.
          </Text>
        </View>
      );
    }

    const isActive = department.status === DEPARTMENT_STATUS.ACTIVE;
    const head = headName(department.head);

    return (
      <View>
        <View style={styles.identity}>
          <View style={styles.nameRow}>
            <Text style={styles.name} numberOfLines={2}>
              {department.name || 'Unnamed department'}
            </Text>
            <Badge
              label={isActive ? 'Active' : 'Inactive'}
              tone={isActive ? 'success' : 'neutral'}
            />
          </View>
          <Text style={styles.code}>{department.code}</Text>
        </View>

        <Text style={styles.sectionLabel}>Department head</Text>
        <View style={styles.section}>
          <Row label="Name" value={head} fallback="No head assigned" />
          <Row label="Employee" value={headMeta(department.head)} divider />
        </View>

        <Text style={styles.note}>
          Naming a head does not move that person into this department — the two
          references are stored separately, so a head may belong elsewhere. Set
          their department on their own employee record.
        </Text>

        <Text style={styles.sectionLabel}>Record</Text>
        <View style={styles.section}>
          <Row label="Status" value={isActive ? 'Active' : 'Inactive'} />
          <Row
            label="Created"
            value={formatDate(department.createdAt)}
            fallback="Unknown"
            divider
          />
          <Row
            label="Last updated"
            value={formatDate(department.updatedAt)}
            fallback="Unknown"
            divider
          />
        </View>

        <View style={styles.statusBlock}>
          <ErrorBanner message={statusError} />

          <Button
            title={isActive ? 'Deactivate department' : 'Activate department'}
            onPress={handleToggleStatus}
            loading={isChangingStatus}
            variant={isActive ? 'secondary' : 'primary'}
          />

          <Text style={styles.statusHint}>
            {isActive
              ? 'Deactivating hides this department from assignment without affecting employees already in it.'
              : 'Reactivating makes this department assignable again.'}
          </Text>
        </View>

        <View style={styles.dangerBlock}>
          <Text style={styles.dangerLabel}>Danger zone</Text>

          <ErrorBanner message={deleteError} />

          <Button
            title="Delete department"
            onPress={() => setIsConfirmingDelete(true)}
            variant="danger"
            disabled={isDeleting}
          />

          <Text style={styles.statusHint}>
            {isBlocked
              ? 'Reassign or remove the employees in this department first, or deactivate it instead.'
              : 'Permanently removes the department. Deactivate instead if you only need to stop new assignments.'}
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
        {department ? (
          <Button
            title="Edit"
            onPress={() =>
              navigation.navigate(ROUTES.MAIN.EDIT_DEPARTMENT, { departmentId })
            }
            variant="text"
            fullWidth={false}
          />
        ) : null}
      </View>

      {renderBody()}

      <ConfirmDialog
        visible={isConfirmingDelete}
        title="Delete this department?"
        message="The department will be permanently removed. This is refused if any employees are still assigned to it."
        confirmLabel="Delete"
        confirmVariant="danger"
        onConfirm={handleDelete}
        onCancel={() => setIsConfirmingDelete(false)}
        isBusy={isDeleting}
      />
    </Screen>
  );
}
