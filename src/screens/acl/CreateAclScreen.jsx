import { useState } from 'react';
import { Text, View } from 'react-native';

import { AclFormFields } from '@components/acl/AclFormFields';
import { Button } from '@components/common/Button';
import { ErrorBanner } from '@components/common/ErrorBanner';
import { FormCard } from '@components/layout/FormCard';
import { Screen } from '@components/layout/Screen';
import { useToast } from '@context/ToastContext';
import { useCreateAcl } from '@hooks/useCreateAcl';
import { useDepartmentOptions } from '@hooks/useDepartmentOptions';
import { useEmployeeOptions } from '@hooks/useEmployeeOptions';
import { useHierarchy } from '@hooks/useHierarchy';
import { usePermissionOptions } from '@hooks/usePermissionOptions';
import { useTeamOptions } from '@hooks/useTeamOptions';
import { validateAclForm } from '@validation/acl';

import { styles } from '@theme/styles/CreateAclScreen.styles';

export function CreateAclScreen({ navigation }) {
  const toast = useToast();
  const { submit, isSubmitting, error, fieldErrors, clearMessages } =
    useCreateAcl();

  const hierarchy = useHierarchy();
  const permissions = usePermissionOptions();
  const departments = useDepartmentOptions();
  // Unfiltered on purpose: an employee-specific rule can name anyone active,
  // the same way the Department Head picker places no constraint.
  const employees = useEmployeeOptions();

  const [values, setValues] = useState({
    hierarchyLevel: null,
    permission: null,
    effect: null,
    department: null,
    team: null,
    employee: null,
  });
  const [localErrors, setLocalErrors] = useState({});

  // Scoped to the chosen department — no department, no teams to offer.
  const teams = useTeamOptions(values.department);

  const setField = (key, value) => {
    setValues((prev) => {
      // A team belongs to exactly one department, so one chosen under the old
      // department cannot survive the change.
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

    const created = await submit(values);

    if (created) {
      toast.success('Access rule created.');
      navigation.goBack();
    }
  };

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

        <Text style={styles.title}>New access rule</Text>
        <Text style={styles.subtitle}>
          Decides Allow or Deny for one hierarchy level and permission, at
          whatever scope you set below.
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
            title="Create rule"
            onPress={handleSubmit}
            loading={isSubmitting}
            style={styles.action}
          />
        </View>
      </FormCard>
    </Screen>
  );
}
