import { useEffect, useMemo, useState } from 'react';
import { Text, View } from 'react-native';

import { Button } from '@components/common/Button';
import { ErrorBanner } from '@components/common/ErrorBanner';
import { Loader } from '@components/common/Loader';
import { EmployeeFormFields } from '@components/employee/EmployeeFormFields';
import { Screen } from '@components/layout/Screen';
import { useEmployee } from '@hooks/useEmployee';
import { useManagerOptions } from '@hooks/useManagerOptions';
import { useUpdateEmployee } from '@hooks/useUpdateEmployee';
import { validateEmployeeForm } from '@validation/employee';

import { styles } from '@theme/styles/EditEmployeeScreen.styles';

function referenceId(reference) {
  if (!reference) return null;
  if (typeof reference === 'string') return reference;

  return reference._id ?? null;
}

function toFormValues(employee) {
  return {
    employeeId: employee.employeeId ?? '',
    firstName: employee.firstName ?? '',
    lastName: employee.lastName ?? '',
    email: employee.email ?? '',
    hierarchyLevel: employee.hierarchyLevel ?? null,
    reportingManager: referenceId(employee.reportingManager),
  };
}

function changedFields(initial, current) {
  if (!initial || !current) return {};

  return Object.keys(current).reduce((changes, key) => {
    if (current[key] !== initial[key]) changes[key] = current[key];
    return changes;
  }, {});
}

export function EditEmployeeScreen({ navigation, route }) {
  const { employeeId } = route.params ?? {};

  const {
    employee,
    isLoading,
    error: loadError,
    isForbidden,
    isNotFound,
    refresh,
  } = useEmployee(employeeId);

  const { submit, isSubmitting, error, fieldErrors, clearMessages } =
    useUpdateEmployee();

  const managerOptions = useManagerOptions(employeeId);

  const [initial, setInitial] = useState(null);
  const [values, setValues] = useState(null);
  const [localErrors, setLocalErrors] = useState({});

  useEffect(() => {
    if (!employee) return;

    const next = toFormValues(employee);

    setInitial(next);
    setValues(next);
  }, [employee]);

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
    const { errors, hasError } = validateEmployeeForm(values);

    if (hasError) {
      setLocalErrors(errors);
      return;
    }

    const updated = await submit(employeeId, changes);

    if (updated) {
      navigation.goBack();
    }
  };

  if (isLoading) {
    return (
      <Screen background="canvas">
        <Loader message="Loading employee…" fullScreen={false} />
      </Screen>
    );
  }

  if (loadError || !values) {
    return (
      <Screen background="canvas">
        <View style={styles.header}>
          <Button
            title="← Back"
            onPress={() => navigation.goBack()}
            variant="text"
            fullWidth={false}
          />
        </View>

        <View style={styles.errorBlock}>
          <ErrorBanner message={loadError ?? 'Employee not found.'} />
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

      <Text style={styles.title}>Edit employee</Text>
      <Text style={styles.subtitle}>
        Only the fields you change are sent. Registration state is managed by the
        backend and cannot be edited here.
      </Text>

      <View style={styles.card}>
        <ErrorBanner message={error} />

        <EmployeeFormFields
          values={values}
          setField={setField}
          errorFor={errorFor}
          managerOptions={managerOptions}
          managerHelper="This employee cannot be their own manager."
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
