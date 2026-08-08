import { useState } from 'react';
import { Text, View } from 'react-native';

import { Button } from '@components/common/Button';
import { ErrorBanner } from '@components/common/ErrorBanner';
import { EmployeeFormFields } from '@components/employee/EmployeeFormFields';
import { Screen } from '@components/layout/Screen';
import { useCreateEmployee } from '@hooks/useCreateEmployee';
import { useManagerOptions } from '@hooks/useManagerOptions';
import { validateEmployeeForm } from '@validation/employee';

import { styles } from '@theme/styles/CreateEmployeeScreen.styles';

export function CreateEmployeeScreen({ navigation }) {
  const { submit, isSubmitting, error, fieldErrors, clearMessages } =
    useCreateEmployee();

  const managerOptions = useManagerOptions();

  const [values, setValues] = useState({
    employeeId: '',
    firstName: '',
    lastName: '',
    email: '',
    hierarchyLevel: null,
    reportingManager: null,
  });
  const [localErrors, setLocalErrors] = useState({});

  const setField = (key, value) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    setLocalErrors((prev) => ({ ...prev, [key]: undefined }));
    clearMessages();
  };

  const errorFor = (key) => fieldErrors[key] || localErrors[key];

  const handleSubmit = async () => {
    const { errors, hasError } = validateEmployeeForm(values);

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
    <Screen background="canvas">
      <View style={styles.header}>
        <Button
          title="← Back"
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
          managerOptions={managerOptions}
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
