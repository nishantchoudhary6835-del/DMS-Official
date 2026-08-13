import { useState } from 'react';
import { Text, View } from 'react-native';

import { Button } from '@components/common/Button';
import { ErrorBanner } from '@components/common/ErrorBanner';
import { Screen } from '@components/layout/Screen';
import { PermissionFormFields } from '@components/permission/PermissionFormFields';
import { useToast } from '@context/ToastContext';
import { useCreatePermission } from '@hooks/useCreatePermission';
import { usePermissionVocabulary } from '@hooks/usePermissionVocabulary';
import { validatePermissionForm } from '@validation/permission';

import { styles } from '@theme/styles/CreatePermissionScreen.styles';

export function CreatePermissionScreen({ navigation }) {
  const toast = useToast();
  const { submit, isSubmitting, error, fieldErrors, clearMessages } =
    useCreatePermission();

  const vocabulary = usePermissionVocabulary();

  const [values, setValues] = useState({
    resource: '',
    action: null,
    description: '',
  });
  const [localErrors, setLocalErrors] = useState({});

  const setField = (key, value) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    setLocalErrors((prev) => ({ ...prev, [key]: undefined }));
    clearMessages();
  };

  const errorFor = (key) => fieldErrors[key] || localErrors[key];

  const handleSubmit = async () => {
    const { errors, hasError } = validatePermissionForm(
      values,
      vocabulary.resources,
      vocabulary.actions
    );

    if (hasError) {
      setLocalErrors(errors);
      return;
    }

    const created = await submit(values);

    if (created) {
      toast.success('Permission created.');
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

      <Text style={styles.title}>New permission</Text>
      <Text style={styles.subtitle}>
        A permission pairs one resource with one action. It becomes real
        access only once assigned to a hierarchy through RolePermission.
      </Text>

      <View style={styles.card}>
        <ErrorBanner message={error} />

        <PermissionFormFields
          values={values}
          setField={setField}
          errorFor={errorFor}
          resourceOptions={vocabulary.resourceOptions}
          actionOptions={vocabulary.actionOptions}
          disabled={isSubmitting}
        />

        <Button
          title="Create permission"
          onPress={handleSubmit}
          loading={isSubmitting}
          style={styles.action}
        />
      </View>
    </Screen>
  );
}
