import { useState } from 'react';
import { Text, View } from 'react-native';

import { Button } from '@components/common/Button';
import { ErrorBanner } from '@components/common/ErrorBanner';
import { Screen } from '@components/layout/Screen';
import { DepartmentFormFields } from '@components/department/DepartmentFormFields';
import { FormCard } from '@components/layout/FormCard';
import { useToast } from '@context/ToastContext';
import { useCreateDepartment } from '@hooks/useCreateDepartment';
import { useEmployeeOptions } from '@hooks/useEmployeeOptions';
import { validateDepartmentForm } from '@validation/department';

import { styles } from '@theme/styles/CreateDepartmentScreen.styles';

export function CreateDepartmentScreen({ navigation }) {
  const toast = useToast();
  const { submit, isSubmitting, error, fieldErrors, clearMessages } =
    useCreateDepartment();

  // Unfiltered on purpose: the backend places no constraint on who may head a
  // department, so neither does this picker.
  const heads = useEmployeeOptions();

  const [values, setValues] = useState({
    name: '',
    code: '',
    head: null,
  });
  const [localErrors, setLocalErrors] = useState({});

  const setField = (key, value) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    setLocalErrors((prev) => ({ ...prev, [key]: undefined }));
    clearMessages();
  };

  const errorFor = (key) => fieldErrors[key] || localErrors[key];

  const handleSubmit = async () => {
    const { errors, hasError } = validateDepartmentForm(values);

    if (hasError) {
      setLocalErrors(errors);
      return;
    }

    const created = await submit(values);

    if (created) {
      toast.success('Department created.');
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

        <Text style={styles.title}>New department</Text>
        <Text style={styles.subtitle}>
          Departments group employees and teams. The code is how this
          department is identified everywhere else in the system.
        </Text>

        <View style={styles.card}>
          <ErrorBanner message={error} />

          <DepartmentFormFields
            values={values}
            setField={setField}
            errorFor={errorFor}
            headOptions={heads.options}
            disabled={isSubmitting}
          />

          <Button
            title="Create department"
            onPress={handleSubmit}
            loading={isSubmitting}
            style={styles.action}
          />
        </View>
      </FormCard>
    </Screen>
  );
}
