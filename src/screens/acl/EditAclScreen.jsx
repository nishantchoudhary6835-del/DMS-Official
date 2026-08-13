import { useEffect, useMemo, useState } from 'react';
import { Text, View } from 'react-native';

import { AclFormFields } from '@components/acl/AclFormFields';
import { Button } from '@components/common/Button';
import { ErrorBanner } from '@components/common/ErrorBanner';
import { Loader } from '@components/common/Loader';
import { Screen } from '@components/layout/Screen';
import { useToast } from '@context/ToastContext';
import { useAcl } from '@hooks/useAcl';
import { useDepartmentOptions } from '@hooks/useDepartmentOptions';
import { useEmployeeOptions } from '@hooks/useEmployeeOptions';
import { useHierarchy } from '@hooks/useHierarchy';
import { usePermissionOptions } from '@hooks/usePermissionOptions';
import { useTeamOptions } from '@hooks/useTeamOptions';
import { useUpdateAcl } from '@hooks/useUpdateAcl';
import { referenceId } from '@utils/format';
import { validateAclForm } from '@validation/acl';

import { styles } from '@theme/styles/EditAclScreen.styles';

function toFormValues(acl) {
  return {
    hierarchyLevel: acl.hierarchyLevel ?? null,
    effect: acl.effect ?? null,
    // Each arrives populated on a read and has to be flattened to an id
    // before it can drive a Select.
    permission: referenceId(acl.permission),
    department: referenceId(acl.department),
    team: referenceId(acl.team),
    employee: referenceId(acl.employee),
  };
}

function changedFields(initial, current) {
  if (!initial || !current) return {};

  return Object.keys(current).reduce((changes, key) => {
    if (current[key] !== initial[key]) changes[key] = current[key];
    return changes;
  }, {});
}

export function EditAclScreen({ navigation, route }) {
  const { aclId } = route.params ?? {};
  const toast = useToast();

  const {
    acl,
    isLoading,
    error: loadError,
    isForbidden,
    isNotFound,
    refresh,
  } = useAcl(aclId);

  const { submit, isSubmitting, error, fieldErrors, clearMessages } =
    useUpdateAcl();

  const hierarchy = useHierarchy();
  const permissions = usePermissionOptions();
  const departments = useDepartmentOptions();
  const employees = useEmployeeOptions();

  const [initial, setInitial] = useState(null);
  const [values, setValues] = useState(null);
  const [localErrors, setLocalErrors] = useState({});

  const teams = useTeamOptions(values?.department ?? null);

  useEffect(() => {
    if (!acl) return;

    const next = toFormValues(acl);

    setInitial(next);
    setValues(next);
  }, [acl]);

  const changes = useMemo(
    () => changedFields(initial, values),
    [initial, values]
  );

  const hasChanges = Object.keys(changes).length > 0;

  const setField = (key, value) => {
    setValues((prev) => {
      if (key === 'department' && prev.department !== value) {
        return { ...prev, department: value, team: null };
      }

      return { ...prev, [key]: value };
    });
    setLocalErrors((prev) => ({ ...prev, [key]: undefined }));
    clearMessages();
  };

  const errorFor = (key) => fieldErrors[key] || localErrors[key];

  const handleSubmit = async () => {
    const { errors, hasError } = validateAclForm(values, hierarchy.levels);

    if (hasError) {
      setLocalErrors(errors);
      return;
    }

    const updated = await submit(aclId, changes);

    if (updated) {
      toast.success('Access rule updated.');
      navigation.goBack();
    }
  };

  if (isLoading) {
    return (
      <Screen>
        <Loader message="Loading access rule…" fullScreen={false} />
      </Screen>
    );
  }

  if (loadError || !values) {
    return (
      <Screen>
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
          <ErrorBanner message={loadError ?? 'Access rule not found.'} />
          {!isForbidden && !isNotFound ? (
            <Button
              title="Try again"
              onPress={refresh}
              variant="secondary"
              fullWidth={false}
            />
          ) : null}
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
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

      <Text style={styles.title}>Edit access rule</Text>
      <Text style={styles.subtitle}>
        Only the fields you change are sent.
      </Text>

      <View style={styles.card}>
        <ErrorBanner message={error} />

        <AclFormFields
          values={values}
          setField={setField}
          errorFor={errorFor}
          hierarchyOptions={hierarchy.options}
          permissionOptions={permissions.options}
          departmentOptions={departments.options}
          teamOptions={teams.options}
          employeeOptions={employees.options}
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
    </Screen>
  );
}
