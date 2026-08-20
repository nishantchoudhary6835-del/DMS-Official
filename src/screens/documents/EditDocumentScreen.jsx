import { useMemo, useState } from 'react';
import { Text, View } from 'react-native';

import { Button } from '@components/common/Button';
import { ErrorBanner } from '@components/common/ErrorBanner';
import { Loader } from '@components/common/Loader';
import { Screen } from '@components/layout/Screen';
import { DocumentFormFields } from '@components/document/DocumentFormFields';
import { useAuth } from '@context/AuthContext';
import { useToast } from '@context/ToastContext';
import { useDepartmentOptions } from '@hooks/useDepartmentOptions';
import { useDocument } from '@hooks/useDocument';
import { useTeamOptions } from '@hooks/useTeamOptions';
import { useUpdateDocument } from '@hooks/useUpdateDocument';
import { referenceId } from '@utils/format';
import { ownReferenceOptions } from '@utils/referenceOptions';
import { validateDocumentEditForm } from '@validation/document';

import { styles } from '@theme/styles/CreateDocumentScreen.styles';

function toFormValues(documentRecord) {
  return {
    title: documentRecord.title ?? '',
    description: documentRecord.description ?? '',
    documentType: documentRecord.documentType ?? '',
    department: referenceId(documentRecord.department),
    team: referenceId(documentRecord.team),
    file: null,
  };
}

/**
 * Reached from WorkflowDetailScreen's Resubmit block once a reviewer has
 * RETURNed a document for revision — DOCUMENT_MODULE_DOCUMENTATION.md §13's
 * loop is PATCH Document (here) then a separate Resubmit call back on that
 * screen, so this always ends with `navigation.goBack()` rather than
 * resubmitting itself.
 */
export function EditDocumentScreen({ navigation, route }) {
  const { documentId } = route.params ?? {};
  const toast = useToast();
  const { user } = useAuth();

  const {
    document: documentRecord,
    isLoading,
    error: loadError,
    isForbidden,
    isNotFound,
    refresh,
  } = useDocument(documentId);

  const { submit, isSubmitting, error, fieldErrors, clearMessages } =
    useUpdateDocument();

  const departments = useDepartmentOptions();

  const [values, setValues] = useState(null);
  const [localErrors, setLocalErrors] = useState({});

  const teams = useTeamOptions(values?.department);

  const ownEmployee =
    user?.employeeId && typeof user.employeeId === 'object'
      ? user.employeeId
      : null;
  // The whole populated object, not just its id: the login response carries
  // `name` on both, which is what lets the fallback options below show the
  // real department and team to an account that cannot list either. The
  // document being edited carries them populated too, which covers a record
  // assigned somewhere other than this account's own department.
  const ownDepartment = ownEmployee?.department ?? null;
  const ownTeam = ownEmployee?.team ?? null;
  const ownDepartmentId = referenceId(ownDepartment);
  const ownTeamId = referenceId(ownTeam);

  const departmentOptions = useMemo(
    () =>
      ownReferenceOptions(
        departments.options,
        ownDepartment,
        'department',
        documentRecord?.department ?? values?.department
      ),
    [departments.options, ownDepartment, documentRecord, values?.department]
  );

  const teamOptions = useMemo(
    () =>
      ownReferenceOptions(
        teams.options,
        ownTeam,
        'team',
        documentRecord?.team ?? values?.team
      ),
    [teams.options, ownTeam, documentRecord, values?.team]
  );

  if (isLoading) {
    return (
      <Screen>
        <Loader message="Loading document…" fullScreen={false} />
      </Screen>
    );
  }

  if (loadError || !documentRecord) {
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

        <ErrorBanner message={loadError ?? 'Document not found.'} />
        {!isForbidden && !isNotFound ? (
          <Button
            title="Try again"
            onPress={refresh}
            variant="secondary"
            fullWidth={false}
            style={styles.action}
          />
        ) : null}
      </Screen>
    );
  }

  const formValues = values ?? toFormValues(documentRecord);

  const setField = (key, value) => {
    setValues((prev) => {
      const base = prev ?? toFormValues(documentRecord);

      // A team belongs to exactly one department — same rule
      // CreateDocumentScreen enforces for the same reason.
      if (key === 'department' && base.department !== value) {
        return { ...base, department: value, team: null };
      }

      return { ...base, [key]: value };
    });
    setLocalErrors((prev) => ({ ...prev, [key]: undefined }));
    clearMessages();
  };

  const errorFor = (key) => fieldErrors[key] || localErrors[key];

  const handleSubmit = async () => {
    const { errors, hasError } = validateDocumentEditForm(formValues);

    if (hasError) {
      setLocalErrors(errors);
      return;
    }

    const updated = await submit(documentId, formValues);

    if (updated) {
      toast.success(
        updated.currentVersion
          ? `Document updated to ${updated.currentVersion}.`
          : 'Document updated.'
      );
      navigation.goBack();
    }
  };

  return (
    <Screen>
      <View style={styles.header}>
        <Button
          title="Cancel"
          icon="chevron-back"
          onPress={() => navigation.goBack()}
          variant="text"
          fullWidth={false}
          disabled={isSubmitting}
        />
      </View>

      <Text style={styles.title}>Edit document</Text>
      <Text style={styles.subtitle}>
        Update the document's details, or replace its file. Saving creates a
        new version — resubmit it from the previous screen once you're done.
      </Text>

      <View style={styles.card}>
        <ErrorBanner message={error} />

        <DocumentFormFields
          mode="edit"
          values={formValues}
          setField={setField}
          errorFor={errorFor}
          departmentOptions={departmentOptions}
          teamOptions={teamOptions}
          disabled={isSubmitting}
        />

        <Button
          title={isSubmitting ? 'Saving…' : 'Save changes'}
          onPress={handleSubmit}
          loading={isSubmitting}
          style={styles.action}
        />
      </View>
    </Screen>
  );
}
