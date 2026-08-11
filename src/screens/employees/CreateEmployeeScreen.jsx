import { useState } from 'react';
import { Text, View } from 'react-native';

import { Button } from '@components/common/Button';
import { ErrorBanner } from '@components/common/ErrorBanner';
import { EmployeeFormFields } from '@components/employee/EmployeeFormFields';
import { Screen } from '@components/layout/Screen';
import { useCreateEmployee } from '@hooks/useCreateEmployee';
import { useHierarchy } from '@hooks/useHierarchy';
import { useManagerOptions } from '@hooks/useManagerOptions';
import { validateEmployeeForm } from '@validation/employee';

import { styles } from '@theme/styles/CreateEmployeeScreen.styles';

export function CreateEmployeeScreen({ navigation }) {
  const { submit, isSubmitting, error, fieldErrors, clearMessages } =
    useCreateEmployee();

  const hierarchy = useHierarchy();

  const [values, setValues] = useState({
    employeeId: '',
    firstName: '',
    lastName: '',
    email: '',
    hierarchyLevel: null,
    reportingManager: null,
  });
  const [localErrors, setLocalErrors] = useState({});

  // Declared after `values` so the candidate list narrows as soon as a
  // hierarchy level is picked.
  const managers = useManagerOptions(null, {
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

    const created = await submit({
      ...values,
      department: null,
      team: null,
    });

    if (created) {
      navigation.goBack();
    }
  };

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

      <Text style={styles.title}>New employee</Text>
      <Text style={styles.subtitle}>
        Creating a record lets this person set up their own account using their
        work email.
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
    </Screen>
  );
}
