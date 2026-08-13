import { useState } from 'react';
import { Text, View } from 'react-native';

import { Button } from '@components/common/Button';
import { ErrorBanner } from '@components/common/ErrorBanner';
import { Screen } from '@components/layout/Screen';
import { RolePermissionFormFields } from '@components/rolePermission/RolePermissionFormFields';
import { useCreateRolePermission } from '@hooks/useCreateRolePermission';
import { useHierarchy } from '@hooks/useHierarchy';
import { usePermissionOptions } from '@hooks/usePermissionOptions';
import { validateRolePermissionForm } from '@validation/rolePermission';

import { styles } from '@theme/styles/CreateRolePermissionScreen.styles';

export function CreateRolePermissionScreen({ navigation }) {
  const { submit, isSubmitting, error, fieldErrors, clearMessages } =
    useCreateRolePermission();

  const hierarchy = useHierarchy();
  const permissions = usePermissionOptions();

  const [values, setValues] = useState({
    hierarchyLevel: null,
    permission: null,
  });
  const [localErrors, setLocalErrors] = useState({});

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

    const created = await submit(values);

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

      <Text style={styles.title}>New role assignment</Text>
      <Text style={styles.subtitle}>
        Makes a hierarchy level eligible for one permission. It does not, by
        itself, decide what any specific request is allowed to do.
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
          title="Create assignment"
          onPress={handleSubmit}
          loading={isSubmitting}
          style={styles.action}
        />
      </View>
    </Screen>
  );
}
