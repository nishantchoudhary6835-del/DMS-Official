import { useState } from 'react';
import { Text, View } from 'react-native';

import { Button } from '@components/common/Button';
import { ErrorBanner } from '@components/common/ErrorBanner';
import { EmployeeFormFields } from '@components/employee/EmployeeFormFields';
import { FormCard } from '@components/layout/FormCard';
import { Screen } from '@components/layout/Screen';
import { useToast } from '@context/ToastContext';
import { useCreateEmployee } from '@hooks/useCreateEmployee';
import { useDepartmentOptions } from '@hooks/useDepartmentOptions';
import { useEmployeeOptions } from '@hooks/useEmployeeOptions';
import { useHierarchy } from '@hooks/useHierarchy';
import { useTeamOptions } from '@hooks/useTeamOptions';
import { validateEmployeeForm } from '@validation/employee';

import { styles } from '@theme/styles/CreateEmployeeScreen.styles';

export function CreateEmployeeScreen({ navigation }) {
  const toast = useToast();
  const { submit, isSubmitting, error, fieldErrors, clearMessages } =
    useCreateEmployee();

  const hierarchy = useHierarchy();

  // Active only. A new employee has no reason to be placed in a department
  // that has been retired.
  const departments = useDepartmentOptions();

  const [values, setValues] = useState({
    employeeId: '',
    firstName: '',
    lastName: '',
    email: '',
    hierarchyLevel: null,
    department: null,
    team: null,
    reportingManager: null,
  });
  const [localErrors, setLocalErrors] = useState({});

  // Scoped to the chosen department — no department, no teams to offer.
  const teams = useTeamOptions(values.department);

  // Declared after `values` so the candidate list narrows as soon as a
  // hierarchy level is picked.
  const managers = useEmployeeOptions(null, {
    hierarchyLevel: values.hierarchyLevel,
    ranks: hierarchy.ranks,
  });

  const setField = (key, value) => {
    setValues((prev) => {
      // Changing the level can invalidate the manager already chosen, so clear
      // it rather than submitting a pairing the form no longer offers.
      if (key === 'hierarchyLevel' && prev.hierarchyLevel !== value) {
        return { ...prev, hierarchyLevel: value, reportingManager: null };
      }

      // A team belongs to exactly one department, so a team chosen under the
      // old one cannot survive the change.
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
    const { errors, hasError } = validateEmployeeForm(values, hierarchy.levels);

    if (hasError) {
      setLocalErrors(errors);
      return;
    }

    const created = await submit(values);

    if (created) {
      toast.success('Employee created.');
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

        <Text style={styles.title}>New employee</Text>
        <Text style={styles.subtitle}>
          Creating a record lets this person set up their own account using
          their work email.
        </Text>

        <View style={styles.card}>
          <ErrorBanner message={error} />

          <EmployeeFormFields
            values={values}
            setField={setField}
            errorFor={errorFor}
            hierarchyOptions={hierarchy.options}
            hierarchyHelper={
              hierarchy.isFallback && !hierarchy.isLoading
                ? "Showing the standard list — the server's list is unavailable."
                : undefined
            }
            departmentOptions={departments.options}
            allDepartments={departments.departments}
            teamOptions={teams.options}
            allTeams={teams.teams}
            managerOptions={managers.options}
            managerHiddenCount={managers.hiddenCount}
            disabled={isSubmitting}
          />

          <Button
            title="Create employee"
            onPress={handleSubmit}
            loading={isSubmitting}
            style={styles.action}
          />
        </View>
      </FormCard>
    </Screen>
  );
}
