import { useCallback, useRef, useState } from 'react';
import { Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import { Badge } from '@components/common/Badge';
import { Button } from '@components/common/Button';
import { ConfirmDialog } from '@components/common/ConfirmDialog';
import { ErrorBanner } from '@components/common/ErrorBanner';
import { Loader } from '@components/common/Loader';
import { Select } from '@components/common/Select';
import { TextField } from '@components/common/TextField';
import { Screen } from '@components/layout/Screen';
import { employeeOf } from '@components/user/UserCard';
import { useDeleteUser } from '@hooks/useDeleteUser';
import { useResetPassword } from '@hooks/useResetPassword';
import { useUser } from '@hooks/useUser';
import { useUserStatus } from '@hooks/useUserStatus';
import { ROUTES } from '@navigation/routes';
import { formatDate } from '@utils/format';
import { validateConfirmPassword, validatePassword } from '@validation/auth';
import { HIERARCHY_LABELS } from '@validation/employee';
import {
  ACCOUNT_STATUS_LABELS,
  ACCOUNT_STATUS_LEVELS,
  ACCOUNT_STATUS_TONES,
} from '@validation/user';

import { styles } from '@theme/styles/UserDetailScreen.styles';

const STATUS_OPTIONS = ACCOUNT_STATUS_LEVELS.map((status) => ({
  value: status,
  label: ACCOUNT_STATUS_LABELS[status],
}));

function Row({ label, value, fallback = 'Not set', divider = false }) {
  return (
    <View style={[styles.row, divider && styles.rowDivider]}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={value ? styles.rowValue : styles.rowValueMuted}>
        {value ?? fallback}
      </Text>
    </View>
  );
}

export function UserDetailScreen({ navigation, route }) {
  const { userId } = route.params ?? {};

  const { user, isLoading, error, isForbidden, isNotFound, refresh } =
    useUser(userId);

  const {
    submit: changeStatus,
    isSubmitting: isChangingStatus,
    error: statusError,
    clearError: clearStatusError,
  } = useUserStatus();

  const {
    submit: resetPassword,
    isSubmitting: isResetting,
    error: resetError,
    clearError: clearResetError,
  } = useResetPassword();

  const {
    remove,
    isDeleting,
    error: deleteError,
    clearError: clearDeleteError,
  } = useDeleteUser();

  const [isPasswordOpen, setIsPasswordOpen] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordErrors, setPasswordErrors] = useState({});
  const [passwordDone, setPasswordDone] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  const hasFocusedOnce = useRef(false);

  useFocusEffect(
    useCallback(() => {
      if (!hasFocusedOnce.current) {
        hasFocusedOnce.current = true;
        return;
      }
      clearStatusError();
      clearResetError();
      clearDeleteError();
      refresh();
    }, [refresh, clearStatusError, clearResetError, clearDeleteError])
  );

  const handleStatusChange = async (nextStatus) => {
    if (!user || nextStatus === user.accountStatus) return;

    const updated = await changeStatus(userId, nextStatus);

    if (updated) refresh();
  };

  const handleResetPassword = async () => {
    const errors = {
      newPassword: validatePassword(newPassword),
      confirmPassword: validateConfirmPassword(confirmPassword, newPassword),
    };

    if (errors.newPassword || errors.confirmPassword) {
      setPasswordErrors(errors);
      return;
    }

    const done = await resetPassword(userId, newPassword);

    if (done) {
      setNewPassword('');
      setConfirmPassword('');
      setPasswordErrors({});
      setIsPasswordOpen(false);
      setPasswordDone(true);
      refresh();
    }
  };

  const handleDelete = async () => {
    const deleted = await remove(userId);

    setIsConfirmingDelete(false);

    if (deleted) navigation.goBack();
  };

  const renderBody = () => {
    if (isLoading) {
      return <Loader message="Loading account…" fullScreen={false} />;
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

    if (!user) {
      return (
        <View style={styles.centred}>
          <Text style={styles.emptyTitle}>Account not found</Text>
          <Text style={styles.emptyBody}>
            This account may have been removed since the list was loaded.
          </Text>
        </View>
      );
    }

    const employee = employeeOf(user);

    const fullName = employee
      ? [employee.firstName, employee.lastName].filter(Boolean).join(' ')
      : '';

    const status = user.accountStatus ?? 'INACTIVE';

    return (
      <View>
        <View style={styles.identity}>
          <View style={styles.nameRow}>
            <Text style={styles.name} numberOfLines={2}>
              {fullName || user.email}
            </Text>
            <Badge
              label={ACCOUNT_STATUS_LABELS[status] ?? status}
              tone={ACCOUNT_STATUS_TONES[status] ?? 'neutral'}
            />
          </View>
          <Text style={styles.email}>{user.email}</Text>
        </View>

        <Text style={styles.sectionLabel}>Sign-in security</Text>
        <View style={styles.section}>
          <Row
            label="Email verified"
            value={user.isEmailVerified ? 'Yes' : 'No'}
          />
          <Row
            label="Last signed in"
            value={user.lastLogin ? formatDate(user.lastLogin) : null}
            fallback="Never"
            divider
          />
          <Row
            label="Failed sign-ins"
            value={String(Number(user.failedLoginAttempts ?? 0))}
            divider
          />
          <Row
            label="Locked until"
            value={user.lockUntil ? formatDate(user.lockUntil) : null}
            fallback="Not locked"
            divider
          />
          <Row
            label="Password changed"
            value={
              user.passwordChangedAt ? formatDate(user.passwordChangedAt) : null
            }
            fallback="Never"
            divider
          />
        </View>

        <Text style={styles.sectionLabel}>Employee record</Text>
        <View style={styles.section}>
          <Row label="Employee ID" value={employee?.employeeId} />
          <Row
            label="Hierarchy"
            value={
              employee
                ? HIERARCHY_LABELS[employee.hierarchyLevel] ??
                  employee.hierarchyLevel
                : null
            }
            divider
          />
          <Row
            label="Employee status"
            value={employee?.status}
            fallback="Unknown"
            divider
          />
        </View>

        {employee?._id ? (
          <Button
            title="Open employee record"
            onPress={() =>
              navigation.navigate(ROUTES.MAIN.EMPLOYEE_DETAIL, {
                employeeId: employee._id,
              })
            }
            variant="secondary"
            style={styles.statusSelect}
          />
        ) : null}

        <View style={styles.actionBlock}>
          <Text style={styles.sectionLabel}>Account status</Text>

          <ErrorBanner message={statusError} />

          <Select
            label="Account status"
            value={status}
            options={STATUS_OPTIONS}
            onChange={handleStatusChange}
            disabled={isChangingStatus}
            helper="Separate from the employee's organisational status."
          />
        </View>

        <View style={styles.actionBlock}>
          <Text style={styles.sectionLabel}>Password</Text>

          <ErrorBanner message={resetError} />
          {passwordDone ? (
            <ErrorBanner
              message="Password reset. Any existing sessions were signed out."
              variant="success"
            />
          ) : null}

          {isPasswordOpen ? (
            <View style={styles.passwordCard}>
              <TextField
                label="New password"
                value={newPassword}
                onChangeText={(text) => {
                  setNewPassword(text);
                  setPasswordErrors((prev) => ({
                    ...prev,
                    newPassword: undefined,
                  }));
                  clearResetError();
                }}
                error={passwordErrors.newPassword}
                placeholder="Enter a new password"
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isResetting}
              />

              <TextField
                label="Confirm password"
                value={confirmPassword}
                onChangeText={(text) => {
                  setConfirmPassword(text);
                  setPasswordErrors((prev) => ({
                    ...prev,
                    confirmPassword: undefined,
                  }));
                }}
                error={passwordErrors.confirmPassword}
                placeholder="Re-enter the password"
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isResetting}
              />

              <Button
                title="Set new password"
                onPress={handleResetPassword}
                loading={isResetting}
              />
              <Button
                title="Cancel"
                onPress={() => {
                  setIsPasswordOpen(false);
                  setNewPassword('');
                  setConfirmPassword('');
                  setPasswordErrors({});
                  clearResetError();
                }}
                variant="text"
                disabled={isResetting}
              />
            </View>
          ) : (
            <>
              <Button
                title="Reset password"
                onPress={() => {
                  setPasswordDone(false);
                  setIsPasswordOpen(true);
                }}
                variant="secondary"
              />
              <Text style={styles.hint}>
                Clears the account lock and resets failed sign-in attempts. The
                person will need the new password to sign in again.
              </Text>
            </>
          )}
        </View>

        <View style={styles.dangerBlock}>
          <Text style={styles.dangerLabel}>Danger zone</Text>

          <ErrorBanner message={deleteError} />

          <Button
            title="Remove account"
            onPress={() => setIsConfirmingDelete(true)}
            variant="danger"
            disabled={isDeleting}
          />

          <Text style={styles.dangerHint}>
            Removes the sign-in account only. The employee record stays.
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
      </View>

      {renderBody()}

      <ConfirmDialog
        visible={isConfirmingDelete}
        title="Remove this account?"
        message="The person will lose access immediately. Their employee record stays, and they can register again with the same work email."
        confirmLabel="Remove account"
        confirmVariant="danger"
        onConfirm={handleDelete}
        onCancel={() => setIsConfirmingDelete(false)}
        isBusy={isDeleting}
      />
    </Screen>
  );
}
