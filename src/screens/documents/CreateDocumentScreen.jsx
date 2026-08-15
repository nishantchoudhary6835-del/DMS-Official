import { useState } from 'react';
import { Text, View } from 'react-native';

import { Button } from '@components/common/Button';
import { ErrorBanner } from '@components/common/ErrorBanner';
import { Screen } from '@components/layout/Screen';
import { DocumentFormFields } from '@components/document/DocumentFormFields';
import { useToast } from '@context/ToastContext';
import { useCreateDocument } from '@hooks/useCreateDocument';
import { useDepartmentOptions } from '@hooks/useDepartmentOptions';
import { useSubmitDocument } from '@hooks/useSubmitDocument';
import { useTeamOptions } from '@hooks/useTeamOptions';
import { validateDocumentForm } from '@validation/document';

import { styles } from '@theme/styles/CreateDocumentScreen.styles';

export function CreateDocumentScreen({ navigation }) {
  const toast = useToast();
  const { submit, isSubmitting, error, fieldErrors, clearMessages } =
    useCreateDocument();

  const {
    submit: submitForReview,
    isSubmitting: isSubmittingForReview,
    error: submitForReviewError,
  } = useSubmitDocument();

  // Set once the document is created — GET /document doesn't exist yet, so
  // this response is the only moment a Draft's id is ever available. While
  // it's set, the screen shows a "submit for review" follow-up instead of
  // the form rather than losing that id by navigating straight back.
  const [createdDocument, setCreatedDocument] = useState(null);

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
      setCreatedDocument(created);
    }
  };

  const handleSubmitForReview = async () => {
    const result = await submitForReview(createdDocument._id);

    if (result) {
      toast.success('Document submitted for review.');
      navigation.goBack();
    }
  };

  if (createdDocument) {
    return (
      <Screen>
        <View style={styles.header}>
          <Button
            title="Done"
            onPress={() => navigation.goBack()}
            variant="text"
            fullWidth={false}
            disabled={isSubmittingForReview}
          />
        </View>

        <Text style={styles.title}>Document created</Text>
        <Text style={styles.subtitle}>
          "{createdDocument.title}" was saved as a Draft. Submit it now to
          send it to your Team Lead for review, or come back to it later.
        </Text>

        <View style={styles.card}>
          <ErrorBanner message={submitForReviewError} />

          <Button
            title="Submit for review"
            onPress={handleSubmitForReview}
            loading={isSubmittingForReview}
            style={styles.action}
          />
          <Button
            title="Not now"
            onPress={() => navigation.goBack()}
            variant="text"
            disabled={isSubmittingForReview}
          />
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
