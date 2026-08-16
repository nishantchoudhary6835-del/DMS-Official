import { Text, View } from 'react-native';

import { FilePicker } from '@components/common/FilePicker';
import { Select } from '@components/common/Select';
import { TextField } from '@components/common/TextField';

import { styles } from '@theme/styles/DocumentFormFields.styles';

export function DocumentFormFields({
  values,
  setField,
  errorFor,
  departmentOptions,
  teamOptions,
  disabled = false,
  mode = 'create',
}) {
  const isEdit = mode === 'edit';
  // A team belongs to one department, so there is nothing to scope to until
  // one is chosen — same rule EmployeeFormFields and AclFormFields use.
  const hasDepartment = Boolean(values.department);
  const teamPlaceholder = !hasDepartment
    ? 'Select a department first'
    : teamOptions.length
    ? 'Optional — leave blank if the whole department applies'
    : 'No teams in this department';

  return (
    <>
      <TextField
        label="Title"
        value={values.title}
        onChangeText={(text) => setField('title', text)}
        error={errorFor('title')}
        placeholder="Employee Leave Policy"
        editable={!disabled}
      />

      <TextField
        label="Description (optional)"
        value={values.description}
        onChangeText={(text) => setField('description', text)}
        error={errorFor('description')}
        placeholder="What this document covers"
        multiline
        numberOfLines={2}
        editable={!disabled}
      />

      <TextField
        label="Document type"
        value={values.documentType}
        onChangeText={(text) => setField('documentType', text)}
        error={errorFor('documentType')}
        placeholder="POLICY"
        helper="e.g. POLICY, SOP, STANDARD — however this organization categorizes it."
        autoCapitalize="characters"
        editable={!disabled}
      />

      <Select
        label="Department"
        value={values.department}
        options={departmentOptions}
        onChange={(value) => setField('department', value)}
        error={errorFor('department')}
        placeholder={
          departmentOptions.length ? 'Select a department' : 'No departments available yet'
        }
        disabled={disabled || !departmentOptions.length}
      />

      <Select
        label="Team (optional)"
        value={values.team}
        options={teamOptions}
        onChange={(value) => setField('team', value)}
        error={errorFor('team')}
        placeholder={teamPlaceholder}
        disabled={disabled || !hasDepartment || !teamOptions.length}
        allowClear
      />

      <FilePicker
        label={isEdit ? 'Replace file (optional)' : 'File'}
        value={values.file}
        onChange={(file) => setField('file', file)}
        error={errorFor('file')}
        helper={
          isEdit
            ? 'PDF or Word document. Leave blank to keep the current file.'
            : 'PDF or Word document.'
        }
        disabled={disabled}
      />

      <View style={styles.notice}>
        {isEdit ? (
          <>
            <Text style={styles.noticeTitle}>Creates a new version</Text>
            <Text style={styles.noticeBody}>
              Saving creates a new version of this document — the backend
              tracks the version number, not this form.
            </Text>
          </>
        ) : (
          <>
            <Text style={styles.noticeTitle}>Saved as a draft</Text>
            <Text style={styles.noticeBody}>
              This creates the document as a Draft. You'll be prompted to
              submit it for review on the next screen.
            </Text>
          </>
        )}
      </View>
    </>
  );
}
