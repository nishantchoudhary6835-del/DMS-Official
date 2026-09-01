import { useEffect, useMemo, useState } from 'react';
import { Text, View } from 'react-native';

import { Button } from '@components/common/Button';
import { ErrorBanner } from '@components/common/ErrorBanner';
import { Loader } from '@components/common/Loader';
import { FormCard } from '@components/layout/FormCard';
import { Screen } from '@components/layout/Screen';
import { RolePermissionFormFields } from '@components/rolePermission/RolePermissionFormFields';
import { useToast } from '@context/ToastContext';
import { useHierarchy } from '@hooks/useHierarchy';
import { usePermissionOptions } from '@hooks/usePermissionOptions';
import { useRolePermission } from '@hooks/useRolePermission';
import { useUpdateRolePermission } from '@hooks/useUpdateRolePermission';
import { referenceId } from '@utils/format';
import { validateRolePermissionForm } from '@validation/rolePermission';

import { styles } from '@theme/styles/EditRolePermissionScreen.styles';

function toFormValues(rolePermission) {
  return {
    hierarchyLevel: rolePermission.hierarchyLevel ?? null,
    // Arrives populated on a read and has to be flattened to an id before it
    // can drive a Select — same rule as Team's department/teamLead.
    permission: referenceId(rolePermission.permission),
  };
}

function changedFields(initial, current) {
  if (!initial || !current) return {};

  return Object.keys(current).reduce((changes, key) => {
    if (current[key] !== initial[key]) changes[key] = current[key];
    return changes;
  }, {});
}

export function EditRolePermissionScreen({ navigation, route }) {
  const { rolePermissionId } = route.params ?? {};
  const toast = useToast();

  const {
    rolePermission,
    isLoading,
    error: loadError,
    isForbidden,
    isNotFound,
    refresh,
  } = useRolePermission(rolePermissionId);

  const { submit, isSubmitting, error, fieldErrors, clearMessages } =
    useUpdateRolePermission();

  const hierarchy = useHierarchy();
  const permissions = usePermissionOptions();

  const [initial, setInitial] = useState(null);
  const [values, setValues] = useState(null);
  const [localErrors, setLocalErrors] = useState({});

  useEffect(() => {
    if (!rolePermission) return;

    const next = toFormValues(rolePermission);

    setInitial(next);
    setValues(next);
  }, [rolePermission]);

  const changes = useMemo(
    () => changedFields(initial, values),
    [initial, values]
  );

  const hasChanges = Object.keys(changes).length > 0;

  const setField = (key, value) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    setLocalErrors((prev) => ({ ...prev, [key]: undefined }));
    clearMessages();
  };

  const errorFor = (key) => fieldErrors[key] || localErrors[key];

  const handleSubmit = async () => {
    const { errors, hasError } = validateRolePermissionForm(values, hierarchy.levels);

    if (hasError) {
      setLocalErrors(errors);
      return;
    }

    const updated = await submit(rolePermissionId, changes);

    if (updated) {
      toast.success('Role assignment updated.');
      navigation.goBack();
    }
  };

  if (isLoading) {
    return (
      <Screen>
        <Loader message="Loading role assignment…" fullScreen={false} />
      </Screen>
    );
  }

  if (loadError || !values) {
    return (
      <Screen>
        <FormCard>
          <View style={styles.header}>
            <Button
              title="Back"
              icon="chevron-back"
              onPress={() => navigation.goBack()}
              variant="text"
              fullWidth={false}
            />
          </View>

          <View style={styles.errorBlock}>
            <ErrorBanner message={loadError ?? 'Role assignment not found.'} />
            {!isForbidden && !isNotFound ? (
              <Button
                title="Try again"
                onPress={refresh}
                variant="secondary"
                fullWidth={false}
              />
            ) : null}
          </View>
        </FormCard>
      </Screen>
    );
  }

  return (
    <Screen>
      <FormCard>
        <View style={styles.header}>
          <Button
            title="Back"
            icon="chevron-back"
            onPress={() => navigation.goBack()}
            variant="text"
            fullWidth={false}
            disabled={isSubmitting}
          />
        </View>

        <Text style={styles.title}>Edit role assignment</Text>
        <Text style={styles.subtitle}>
          Only the fields you change are sent.
        </Text>

        <View style={styles.card}>
          <ErrorBanner message={error} />

          <RolePermissionFormFields
            values={values}
            setField={setField}
            errorFor={errorFor}
            hierarchyOptions={hierarchy.options}
            permissionOptions={permissions.options}
            disabled={isSubmitting}
          />

          <Button
            title={hasChanges ? 'Save changes' : 'No changes yet'}
            onPress={handleSubmit}
            loading={isSubmitting}
            disabled={!hasChanges}
            style={styles.action}
          />
        </View>
      </FormCard>
    </Screen>
  );
}
