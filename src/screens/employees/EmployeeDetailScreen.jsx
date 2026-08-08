import { useCallback, useRef, useState } from 'react';
import { Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import { Badge } from '@components/common/Badge';
import { Button } from '@components/common/Button';
import { ConfirmDialog } from '@components/common/ConfirmDialog';
import { ErrorBanner } from '@components/common/ErrorBanner';
import { Loader } from '@components/common/Loader';
import { Screen } from '@components/layout/Screen';
import { useDeleteEmployee } from '@hooks/useDeleteEmployee';
import { useEmployee } from '@hooks/useEmployee';
import { useEmployeeAccount } from '@hooks/useEmployeeAccount';
import { useEmployeeStatus } from '@hooks/useEmployeeStatus';
import { ROUTES } from '@navigation/routes';
import { formatDate } from '@utils/format';
import { EMPLOYEE_STATUS, HIERARCHY_LABELS } from '@validation/employee';

import { styles } from '@theme/styles/EmployeeDetailScreen.styles';

function departmentLabel(department) {
  if (!department || typeof department !== 'object') return null;
  if (!department.name) return null;

  return department.code
    ? `${department.name} (${department.code})`
    : department.name;
}

function teamLabel(team) {
  if (!team || typeof team !== 'object') return null;

  return team.name ?? null;
}

function managerLabel(manager) {
  if (!manager || typeof manager !== 'object') return null;

  const name = [manager.firstName, manager.lastName].filter(Boolean).join(' ');

  if (!name) return manager.employeeId ?? null;

  return manager.employeeId ? `${name} · ${manager.employeeId}` : name;
}

function Row({ label, value, fallback = 'Not assigned', divider = false }) {
  return (
    <View style={[styles.row, divider && styles.rowDivider]}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={value ? styles.rowValue : styles.rowValueMuted}>
        {value ?? fallback}
      </Text>
    </View>
  );
}

export function EmployeeDetailScreen({ navigation, route }) {
  const { employeeId } = route.params ?? {};

  const { employee, isLoading, error, isForbidden, isNotFound, refresh } =
    useEmployee(employeeId);

  const {
    submit: changeStatus,
    isSubmitting: isChangingStatus,
    error: statusError,
    clearError: clearStatusError,
  } = useEmployeeStatus();

  const {
    remove,
    isDeleting,
    error: deleteError,
    clearError: clearDeleteError,
  } = useDeleteEmployee();

  const {
    account,
    isUnavailable: isAccountUnavailable,
    refresh: refreshAccount,
  } = useEmployeeAccount(employeeId);

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
      refreshAccount();
    }, [refresh, refreshAccount, clearStatusError, clearDeleteError])
  );

  const handleToggleStatus = async () => {
    if (!employee) return;

    const nextStatus =
      employee.status === EMPLOYEE_STATUS.ACTIVE
        ? EMPLOYEE_STATUS.INACTIVE
        : EMPLOYEE_STATUS.ACTIVE;

    const updated = await changeStatus(employeeId, nextStatus);

    if (updated) refresh();
  };

  const handleDelete = async () => {
    const deleted = await remove(employeeId);

    setIsConfirmingDelete(false);

    if (deleted) navigation.goBack();
  };

  const renderBody = () => {
    if (isLoading) {
      return <Loader message="Loading employee…" fullScreen={false} />;
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

    if (!employee) {
      return (
        <View style={styles.centred}>
          <Text style={styles.emptyTitle}>Employee not found</Text>
          <Text style={styles.emptyBody}>
            This record may have been removed since the list was loaded.
          </Text>
        </View>
      );
    }

    const fullName = [employee.firstName, employee.lastName]
      .filter(Boolean)
      .join(' ');

    const isActive = employee.status === 'ACTIVE';

    return (
      <View>
        <View style={styles.identity}>
          <View style={styles.nameRow}>
            <Text style={styles.name} numberOfLines={2}>
              {fullName || 'Unnamed employee'}
            </Text>
            <Badge
              label={isActive ? 'Active' : 'Inactive'}
              tone={isActive ? 'success' : 'neutral'}
            />
          </View>
          <Text style={styles.email}>{employee.email}</Text>
        </View>

        <Text style={styles.sectionLabel}>Details</Text>
        <View style={styles.section}>
          <Row label="Employee ID" value={employee.employeeId} />
          <Row
            label="Hierarchy"
            value={
              HIERARCHY_LABELS[employee.hierarchyLevel] ??
              employee.hierarchyLevel
            }
            divider
          />
          <Row label="Status" value={isActive ? 'Active' : 'Inactive'} divider />
        </View>

        <Text style={styles.sectionLabel}>Placement</Text>
        <View style={styles.section}>
          <Row label="Department" value={departmentLabel(employee.department)} />
          <Row label="Team" value={teamLabel(employee.team)} divider />
          <Row
            label="Reporting manager"
            value={managerLabel(employee.reportingManager)}
            divider
          />
        </View>

        <Text style={styles.sectionLabel}>Account</Text>
        <View style={styles.section}>
          <View style={styles.registrationRow}>
            <View
              style={[
                styles.dot,
                employee.isRegistered ? styles.dotOn : styles.dotOff,
              ]}
            />
            <Text style={styles.registration}>
              {employee.isRegistered
                ? 'Account registered'
                : 'Awaiting registration'}
            </Text>
          </View>

          {account ? (
            <>
              <Row
                label="Email verified"
                value={account.isEmailVerified ? 'Yes' : 'No'}
                divider
              />
              <Row
                label="Last signed in"
                value={
                  account.lastLogin ? formatDate(account.lastLogin) : null
                }
                fallback="Never"
                divider
              />
              {Number(account.failedLoginAttempts ?? 0) > 0 ? (
                <Row
                  label="Failed sign-ins"
                  value={String(account.failedLoginAttempts)}
                  divider
                />
              ) : null}
              {account.lockUntil ? (
                <Row
                  label="Locked until"
                  value={formatDate(account.lockUntil)}
                  divider
                />
              ) : null}
            </>
          ) : null}

          {employee.isRegistered && !account && isAccountUnavailable ? (
            <Row
              label="Account details"
              value={null}
              fallback="Unavailable"
              divider
            />
          ) : null}
        </View>

        {account?._id ? (
          <Button
            title="Manage account"
            onPress={() =>
              navigation.navigate(ROUTES.MAIN.ACCOUNT_DETAIL, {
                userId: account._id,
              })
            }
            variant="secondary"
            style={styles.accountAction}
          />
        ) : null}

        <Text style={styles.sectionLabel}>Record</Text>
        <View style={styles.section}>
          <Row
            label="Created"
            value={formatDate(employee.createdAt)}
            fallback="Unknown"
          />
          <Row
            label="Last updated"
            value={formatDate(employee.updatedAt)}
            fallback="Unknown"
            divider
          />
        </View>

        <View style={styles.statusBlock}>
          <ErrorBanner message={statusError} />

          <Button
            title={isActive ? 'Deactivate employee' : 'Activate employee'}
            onPress={handleToggleStatus}
            loading={isChangingStatus}
            variant={isActive ? 'secondary' : 'primary'}
          />

          <Text style={styles.statusHint}>
            {isActive
              ? 'Deactivating keeps the record and can be undone at any time.'
              : 'Reactivating returns this employee to the active roster.'}
          </Text>
        </View>

        <View style={styles.dangerBlock}>
          <Text style={styles.dangerLabel}>Danger zone</Text>

          <ErrorBanner message={deleteError} />

          <Button
            title="Delete employee"
            onPress={() => setIsConfirmingDelete(true)}
            variant="danger"
            disabled={isDeleting}
          />

          <Text style={styles.statusHint}>
            Permanently removes the record. Deactivate instead if you only need
            to revoke access.
          </Text>
        </View>
      </View>
    );
  };

  return (
    <Screen background="canvas" padded={false} style={styles.page}>
      <View style={styles.header}>
        <Button
          title="← Back"
          onPress={() => navigation.goBack()}
          variant="text"
          fullWidth={false}
        />
        {employee ? (
          <Button
            title="Edit"
            onPress={() =>
              navigation.navigate(ROUTES.MAIN.EDIT_EMPLOYEE, { employeeId })
            }
            variant="text"
            fullWidth={false}
          />
        ) : null}
      </View>

      {renderBody()}

      <ConfirmDialog
        visible={isConfirmingDelete}
        title="Delete this employee?"
        message="The record will be permanently removed. This cannot be undone."
        confirmLabel="Delete"
        confirmVariant="danger"
        onConfirm={handleDelete}
        onCancel={() => setIsConfirmingDelete(false)}
        isBusy={isDeleting}
      />
    </Screen>
  );
}
