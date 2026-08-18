import { useEffect, useMemo, useState } from 'react';
import { Text, View } from 'react-native';

import { Button } from '@components/common/Button';
import { ErrorBanner } from '@components/common/ErrorBanner';
import { Screen } from '@components/layout/Screen';
import { DocumentFormFields } from '@components/document/DocumentFormFields';
import { useAuth } from '@context/AuthContext';
import { useToast } from '@context/ToastContext';
import { useCreateDocument } from '@hooks/useCreateDocument';
import { useDepartmentOptions } from '@hooks/useDepartmentOptions';
import { useSubmitDocument } from '@hooks/useSubmitDocument';
import { useTeamOptions } from '@hooks/useTeamOptions';
import { useUpdateDocument } from '@hooks/useUpdateDocument';
import { referenceId } from '@utils/format';
import { ownReferenceOptions } from '@utils/referenceOptions';
import { validateDocumentEditForm, validateDocumentForm } from '@validation/document';

import { styles } from '@theme/styles/CreateDocumentScreen.styles';

const EMPTY_VALUES = {
  title: '',
  description: '',
  documentType: '',
  department: null,
  team: null,
  file: null,
};

/**
 * `screenMode` walks: 'create' -> 'created' -> optionally 'edit' -> back to
 * 'created'. Editing loops back in-place, right after create, rather than
 * navigating to the standalone EditDocumentScreen — the just-created
 * response already has every field this form needs, so there's no reason to
 * round-trip through GET /document/:id a second time in the same flow.
 * EditDocumentScreen exists for the other entry point: editing a document
 * from outside this screen (e.g. WorkflowDetailScreen's Resubmit block,
 * after a reviewer RETURNs it), where the id is all that's carried over.
 */
export function CreateDocumentScreen({ navigation }) {
  const toast = useToast();
  const { user } = useAuth();
  const { submit, isSubmitting, error, fieldErrors, clearMessages } =
    useCreateDocument();

  const {
    submit: submitUpdate,
    isSubmitting: isUpdating,
    error: updateError,
    fieldErrors: updateFieldErrors,
    clearMessages: clearUpdateMessages,
  } = useUpdateDocument();

  const {
    submit: submitForReview,
    isSubmitting: isSubmittingForReview,
    error: submitForReviewError,
  } = useSubmitDocument();

  const [screenMode, setScreenMode] = useState('create');
  const [createdDocument, setCreatedDocument] = useState(null);

  const departments = useDepartmentOptions();

  const [values, setValues] = useState(EMPTY_VALUES);
  const [localErrors, setLocalErrors] = useState({});

  // Scoped to the chosen department — no department, no teams to offer.
  const teams = useTeamOptions(values.department);

  // Populated on login (see the header comment); bare id/null otherwise.
  const ownEmployee =
    user?.employeeId && typeof user.employeeId === 'object'
      ? user.employeeId
      : null;
  const ownDepartmentId = referenceId(ownEmployee?.department);
  const ownTeamId = referenceId(ownEmployee?.team);

  const departmentOptions = useMemo(
    () =>
      ownReferenceOptions(
        departments.options,
        ownDepartmentId,
        'department',
        values.department
      ),
    [departments.options, ownDepartmentId, values.department]
  );

  const teamOptions = useMemo(
    () => ownReferenceOptions(teams.options, ownTeamId, 'team', values.team),
    [teams.options, ownTeamId, values.team]
  );

  // Department is required and, for most employees, the directory is
  // unbrowsable — so once it's clear the real list has nothing to offer,
  // default to the one department this account is actually authorized to
  // know about instead of leaving a required field impossible to fill.
  useEffect(() => {
    if (screenMode !== 'create') return;
    if (values.department) return;
    if (departments.isLoading || departments.options.length) return;
    if (!ownDepartmentId) return;

    setValues((prev) => ({ ...prev, department: ownDepartmentId }));
  }, [
    screenMode,
    values.department,
    departments.isLoading,
    departments.options.length,
    ownDepartmentId,
  ]);

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
    clearUpdateMessages();
  };

  const isEditing = screenMode === 'edit';
  const activeFieldErrors = isEditing ? updateFieldErrors : fieldErrors;
  const errorFor = (key) => activeFieldErrors[key] || localErrors[key];

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
      setScreenMode('created');
    }
  };

  const handleSubmitForReview = async () => {
    const result = await submitForReview(createdDocument._id);

    if (result) {
      toast.success('Document submitted for review.');
      navigation.goBack();
    }
  };

  const startEditing = () => {
    setValues({
      title: createdDocument.title ?? '',
      description: createdDocument.description ?? '',
      documentType: createdDocument.documentType ?? '',
      department: referenceId(createdDocument.department),
      team: referenceId(createdDocument.team),
      file: null,
    });
    setLocalErrors({});
    clearUpdateMessages();
    setScreenMode('edit');
  };

  const cancelEditing = () => {
    setScreenMode('created');
  };

  const handleUpdate = async () => {
    const { errors, hasError } = validateDocumentEditForm(values);

    if (hasError) {
      setLocalErrors(errors);
      return;
    }

    const updated = await submitUpdate(createdDocument._id, values);

    if (updated) {
      toast.success(
        updated.currentVersion
          ? `Document updated to ${updated.currentVersion}.`
          : 'Document updated.'
      );
      setCreatedDocument(updated);
      setScreenMode('created');
    }
  };

  if (screenMode === 'edit') {
    return (
      <Screen>
        <View style={styles.header}>
          <Button
            title="Cancel"
            icon="chevron-back"
            onPress={cancelEditing}
            variant="text"
            fullWidth={false}
            disabled={isUpdating}
          />
        </View>

        <Text style={styles.title}>Edit document</Text>
        <Text style={styles.subtitle}>
          Update the document's details, or replace its file. Saving creates
          a new version.
        </Text>

        <View style={styles.card}>
          <ErrorBanner message={updateError} />

          <DocumentFormFields
            mode="edit"
            values={values}
            setField={setField}
            errorFor={errorFor}
            departmentOptions={departmentOptions}
            teamOptions={teamOptions}
            disabled={isUpdating}
          />

          <Button
            title={isUpdating ? 'Saving…' : 'Save changes'}
            onPress={handleUpdate}
            loading={isUpdating}
            style={styles.action}
          />
        </View>
      </Screen>
    );
  }

  if (screenMode === 'created') {
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
          "{createdDocument.title}" was saved as a Draft
          {createdDocument.currentVersion ? ` (${createdDocument.currentVersion})` : ''}.
          Submit it now to send it to your Team Lead for review, edit it
          first, or come back to it later.
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
            title="Edit document"
            onPress={startEditing}
            variant="secondary"
            disabled={isSubmittingForReview}
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
          mode="create"
          values={values}
          setField={setField}
          errorFor={errorFor}
          departmentOptions={departmentOptions}
          teamOptions={teamOptions}
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
