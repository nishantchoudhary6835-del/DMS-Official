import { useState } from 'react';
import { Text, View } from 'react-native';

import { Button } from '@components/common/Button';
import { ErrorBanner } from '@components/common/ErrorBanner';
import { Screen } from '@components/layout/Screen';
import { DocumentFormFields } from '@components/document/DocumentFormFields';
import { useToast } from '@context/ToastContext';
import { useCreateDocument } from '@hooks/useCreateDocument';
import { useDepartmentOptions } from '@hooks/useDepartmentOptions';
import { useTeamOptions } from '@hooks/useTeamOptions';
import { validateDocumentForm } from '@validation/document';

import { styles } from '@theme/styles/CreateDocumentScreen.styles';

export function CreateDocumentScreen({ navigation }) {
  const toast = useToast();
  const { submit, isSubmitting, error, fieldErrors, clearMessages } =
    useCreateDocument();

  const departments = useDepartmentOptions();

  const [values, setValues] = useState({
    title: '',
    description: '',
    documentType: '',
    department: null,
    team: null,
    file: null,
  });
  const [localErrors, setLocalErrors] = useState({});

  // Scoped to the chosen department — no department, no teams to offer.
  const teams = useTeamOptions(values.department);

  const setField = (key, value) => {
    setValues((prev) => {
      // A team belongs to exactly one department, so a team chosen under the
      // old one cannot survive the change — same rule CreateAclScreen and
      // CreateEmployeeScreen enforce for the same reason.
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
    const { errors, hasError } = validateDocumentForm(values);

    if (hasError) {
      setLocalErrors(errors);
      return;
    }

    const created = await submit(values);

    if (created) {
      toast.success('Document uploaded.');
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

      <Text style={styles.title}>New document</Text>
      <Text style={styles.subtitle}>
        Uploads a file and creates it as a Draft, owned by you.
      </Text>

      <View style={styles.card}>
        <ErrorBanner message={error} />

        <DocumentFormFields
          values={values}
          setField={setField}
          errorFor={errorFor}
          departmentOptions={departments.options}
          teamOptions={teams.options}
          disabled={isSubmitting}
        />

        <Button
          title={isSubmitting ? 'Uploading…' : 'Create document'}
          onPress={handleSubmit}
          loading={isSubmitting}
          style={styles.action}
        />
      </View>
    </Screen>
  );
}
