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
import { useAcl } from '@hooks/useAcl';
import { useAclStatus } from '@hooks/useAclStatus';
import { useDeleteAcl } from '@hooks/useDeleteAcl';
import { ROUTES } from '@navigation/routes';
import { formatDate } from '@utils/format';
import {
  aclScopeLabel,
  ACL_EFFECT,
  ACL_STATUS,
  departmentRefLabel,
  employeeRefLabel,
  permissionRefLabel,
  teamRefLabel,
} from '@validation/acl';
import { labelFor } from '@validation/employee';
import { permissionEffectPhrase } from '@validation/permission';

import { styles } from '@theme/styles/AclDetailScreen.styles';

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

export function AclDetailScreen({ navigation, route }) {
  const { aclId } = route.params ?? {};
  const toast = useToast();

  const { acl, isLoading, error, isForbidden, isNotFound, refresh } =
    useAcl(aclId);

  const {
    submit: changeStatus,
    isSubmitting: isChangingStatus,
    error: statusError,
    clearError: clearStatusError,
  } = useAclStatus();

  const {
    remove,
    isDeleting,
    error: deleteError,
    clearError: clearDeleteError,
  } = useDeleteAcl();

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
    if (!acl) return;

    const nextStatus =
      acl.status === ACL_STATUS.ACTIVE ? ACL_STATUS.INACTIVE : ACL_STATUS.ACTIVE;

    const updated = await changeStatus(aclId, nextStatus);

    if (updated) {
      toast.success(
        nextStatus === ACL_STATUS.ACTIVE
          ? 'Access rule activated.'
          : 'Access rule deactivated.'
      );
      refresh();
    }
  };

  const handleDelete = async () => {
    const deleted = await remove(aclId);

    setIsConfirmingDelete(false);

    if (deleted) {
      toast.success('Access rule deleted.');
      navigation.goBack();
    }
  };

  const renderBody = () => {
    if (isLoading) {
      return <Loader message="Loading access rule…" fullScreen={false} />;
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

    if (!acl) {
      return (
        <View style={styles.centred}>
          <Text style={styles.emptyTitle}>Access rule not found</Text>
          <Text style={styles.emptyBody}>
            This record may have been removed since the list was loaded.
          </Text>
        </View>
      );
    }

    const isActive = acl.status === ACL_STATUS.ACTIVE;
    const isAllow = acl.effect === ACL_EFFECT.ALLOW;
    const permissionName = permissionRefLabel(acl.permission);
    const effectPhrase = permissionEffectPhrase(acl.permission);

    return (
      <View>
        <View style={styles.identity}>
          <View style={styles.nameRow}>
            <Text style={styles.name} numberOfLines={2}>
              {permissionName || 'Unknown permission'}
            </Text>
            <Badge label={acl.effect || '—'} tone={isAllow ? 'success' : 'danger'} />
          </View>
          <Text style={styles.code}>
            {labelFor(acl.hierarchyLevel)} · {aclScopeLabel(acl)}
          </Text>
        </View>

        <Text style={styles.sectionLabel}>Rule</Text>
        <View style={styles.section}>
          <Row label="Hierarchy level" value={labelFor(acl.hierarchyLevel)} />
          <Row label="Permission" value={permissionName} divider />
          <Row
            label="Effect"
            value={isAllow ? 'Allow' : acl.effect ? 'Deny' : null}
            divider
          />
        </View>

        <Text style={styles.sectionLabel}>Scope</Text>
        <View style={styles.section}>
          <Row label="Applies to" value={aclScopeLabel(acl)} />
          <Row
            label="Department"
            value={departmentRefLabel(acl.department)}
            fallback="Any"
            divider
          />
          <Row label="Team" value={teamRefLabel(acl.team)} fallback="Any" divider />
          <Row
            label="Employee"
            value={employeeRefLabel(acl.employee)}
            fallback="Any"
            divider
          />
        </View>

        <Text style={styles.note}>
          {effectPhrase
            ? isAllow
              ? `When this is the most specific matching rule, ${labelFor(acl.hierarchyLevel) || 'this level'} can ${effectPhrase}.`
              : `When this is the most specific matching rule, ${labelFor(acl.hierarchyLevel) || 'this level'} is blocked from being able to ${effectPhrase} — even if a broader rule would have allowed it.`
            : isAllow
            ? 'When this is the most specific matching rule, the request is allowed to continue.'
            : 'When this is the most specific matching rule, the request is blocked — even if a broader rule would have allowed it.'}
        </Text>

        <Text style={styles.sectionLabel}>Record</Text>
        <View style={styles.section}>
          <Row label="Status" value={isActive ? 'Active' : 'Inactive'} />
          <Row
            label="Created"
            value={formatDate(acl.createdAt)}
            fallback="Unknown"
            divider
          />
          <Row
            label="Last updated"
            value={formatDate(acl.updatedAt)}
            fallback="Unknown"
            divider
          />
        </View>

        <View style={styles.statusBlock}>
          <ErrorBanner message={statusError} />

          <Button
            title={isActive ? 'Deactivate rule' : 'Activate rule'}
            onPress={handleToggleStatus}
            loading={isChangingStatus}
            variant={isActive ? 'secondary' : 'primary'}
          />

          <Text style={styles.statusHint}>
            {isActive
              ? 'An inactive rule is skipped entirely — matching falls through to the next most specific active rule, or defaults to Deny.'
              : 'Reactivating makes this rule eligible to match again.'}
          </Text>
        </View>

        <View style={styles.dangerBlock}>
          <Text style={styles.dangerLabel}>Danger zone</Text>

          <ErrorBanner message={deleteError} />

          <Button
            title="Delete rule"
            onPress={() => setIsConfirmingDelete(true)}
            variant="danger"
            disabled={isDeleting}
          />

          <Text style={styles.statusHint}>
            Permanently removes the rule. Deactivate instead if you only need
            to stop it from matching.
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
        {acl ? (
          <Button
            title="Edit"
            onPress={() => navigation.navigate(ROUTES.MAIN.EDIT_ACL, { aclId })}
            variant="text"
            fullWidth={false}
          />
        ) : null}
      </View>

      {renderBody()}

      <ConfirmDialog
        visible={isConfirmingDelete}
        title="Delete this access rule?"
        message="The rule will be permanently removed. If no other rule matches, access falls back to the default: Deny."
        confirmLabel="Delete"
        confirmVariant="danger"
        onConfirm={handleDelete}
        onCancel={() => setIsConfirmingDelete(false)}
        isBusy={isDeleting}
      />
    </Screen>
  );
}
