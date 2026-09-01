import { useEffect, useMemo, useState } from 'react';
import { Text, View } from 'react-native';

import { Button } from '@components/common/Button';
import { ErrorBanner } from '@components/common/ErrorBanner';
import { Loader } from '@components/common/Loader';
import { FormCard } from '@components/layout/FormCard';
import { Screen } from '@components/layout/Screen';
import { PermissionFormFields } from '@components/permission/PermissionFormFields';
import { useToast } from '@context/ToastContext';
import { usePermission } from '@hooks/usePermission';
import { usePermissionVocabulary } from '@hooks/usePermissionVocabulary';
import { useUpdatePermission } from '@hooks/useUpdatePermission';
import { validatePermissionForm } from '@validation/permission';

import { styles } from '@theme/styles/EditPermissionScreen.styles';

function toFormValues(permission) {
  return {
    resource: permission.resource ?? '',
    action: permission.action ?? null,
    description: permission.description ?? '',
  };
}

function changedFields(initial, current) {
  if (!initial || !current) return {};

  return Object.keys(current).reduce((changes, key) => {
    if (current[key] !== initial[key]) changes[key] = current[key];
    return changes;
  }, {});
}

export function EditPermissionScreen({ navigation, route }) {
  const { permissionId } = route.params ?? {};
  const toast = useToast();

  const {
    permission,
    isLoading,
    error: loadError,
    isForbidden,
    isNotFound,
    refresh,
  } = usePermission(permissionId);

  const { submit, isSubmitting, error, fieldErrors, clearMessages } =
    useUpdatePermission();

  const vocabulary = usePermissionVocabulary();

  const [initial, setInitial] = useState(null);
  const [values, setValues] = useState(null);
  const [localErrors, setLocalErrors] = useState({});

  useEffect(() => {
    if (!permission) return;

    const next = toFormValues(permission);

    setInitial(next);
    setValues(next);
  }, [permission]);

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
    const { errors, hasError } = validatePermissionForm(
      values,
      vocabulary.resources,
      vocabulary.actions
    );

    if (hasError) {
      setLocalErrors(errors);
      return;
    }

    const updated = await submit(permissionId, changes);

    if (updated) {
      toast.success('Permission updated.');
      navigation.goBack();
    }
  };

  if (isLoading) {
    return (
      <Screen>
        <Loader message="Loading permission…" fullScreen={false} />
      </Screen>
    );
  }

  if (loadError || !values) {
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
            />
          </View>

          <View style={styles.errorBlock}>
            <ErrorBanner message={loadError ?? 'Permission not found.'} />
            {!isForbidden && !isNotFound ? (
              <Button
                title="Try again"
                onPress={refresh}
                variant="secondary"
                fullWidth={false}
              />
            ) : null}
          </View>
        </FormCard>
      </Screen>
    );
  }

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

        <Text style={styles.title}>Edit permission</Text>
        <Text style={styles.subtitle}>
          Only the fields you change are sent.
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
            title={hasChanges ? 'Save changes' : 'No changes yet'}
            onPress={handleSubmit}
            loading={isSubmitting}
            disabled={!hasChanges}
            style={styles.action}
          />
        </View>
      </FormCard>
    </Screen>
  );
}
