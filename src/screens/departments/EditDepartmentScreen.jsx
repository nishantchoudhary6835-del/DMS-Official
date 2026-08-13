import { useEffect, useMemo, useState } from 'react';
import { Text, View } from 'react-native';

import { Button } from '@components/common/Button';
import { ErrorBanner } from '@components/common/ErrorBanner';
import { Loader } from '@components/common/Loader';
import { Screen } from '@components/layout/Screen';
import { DepartmentFormFields } from '@components/department/DepartmentFormFields';
import { useToast } from '@context/ToastContext';
import { useDepartment } from '@hooks/useDepartment';
import { useEmployeeOptions } from '@hooks/useEmployeeOptions';
import { useUpdateDepartment } from '@hooks/useUpdateDepartment';
import { referenceId } from '@utils/format';
import { validateDepartmentForm } from '@validation/department';

import { styles } from '@theme/styles/EditDepartmentScreen.styles';

function toFormValues(department) {
  return {
    name: department.name ?? '',
    code: department.code ?? '',
    // Arrives populated here and bare from the list, so it has to be flattened
    // to an id before it can drive a Select.
    head: referenceId(department.head),
  };
}

function changedFields(initial, current) {
  if (!initial || !current) return {};

  return Object.keys(current).reduce((changes, key) => {
    if (current[key] !== initial[key]) changes[key] = current[key];
    return changes;
  }, {});
}

export function EditDepartmentScreen({ navigation, route }) {
  const { departmentId } = route.params ?? {};
  const toast = useToast();

  const {
    department,
    isLoading,
    error: loadError,
    isForbidden,
    isNotFound,
    refresh,
  } = useDepartment(departmentId);

  const { submit, isSubmitting, error, fieldErrors, clearMessages } =
    useUpdateDepartment();

  const heads = useEmployeeOptions();

  const [initial, setInitial] = useState(null);
  const [values, setValues] = useState(null);
  const [localErrors, setLocalErrors] = useState({});

  useEffect(() => {
    if (!department) return;

    const next = toFormValues(department);

    setInitial(next);
    setValues(next);
  }, [department]);

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
    const { errors, hasError } = validateDepartmentForm(values);

    if (hasError) {
      setLocalErrors(errors);
      return;
    }

    const updated = await submit(departmentId, changes);

    if (updated) {
      toast.success('Department updated.');
      navigation.goBack();
    }
  };

  if (isLoading) {
    return (
      <Screen>
        <Loader message="Loading department…" fullScreen={false} />
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
          <ErrorBanner message={loadError ?? 'Department not found.'} />
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

      <Text style={styles.title}>Edit department</Text>
      <Text style={styles.subtitle}>
        Only the fields you change are sent. Clearing the head removes the
        reference without altering that employee’s own record.
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
