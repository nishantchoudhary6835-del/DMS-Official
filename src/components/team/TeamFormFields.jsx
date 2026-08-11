import { Text, View } from 'react-native';

import { Select } from '@components/common/Select';
import { TextField } from '@components/common/TextField';

import { styles } from '@theme/styles/TeamFormFields.styles';

export function TeamFormFields({
  values,
  setField,
  errorFor,
  departmentOptions,
  leadOptions,
  disabled = false,
}) {
  return (
    <>
      <TextField
        label="Team name"
        value={values.name}
        onChangeText={(text) => setField('name', text)}
        error={errorFor('name')}
        placeholder="Backend Development"
        helper="Must be unique within its department."
        editable={!disabled}
      />

      <Select
        label="Department"
        value={values.department}
        options={departmentOptions}
        onChange={(value) => setField('department', value)}
        error={errorFor('department')}
        placeholder={
          departmentOptions.length
            ? 'Select a department'
            : 'No departments available yet'
        }
        helper="Required. A team always belongs to one department."
        disabled={disabled || !departmentOptions.length}
      />

      <Select
        label="Team lead"
        value={values.teamLead}
        options={leadOptions}
        onChange={(value) => setField('teamLead', value)}
        error={errorFor('teamLead')}
        placeholder={
          leadOptions.length ? 'Optional' : 'No team leads available yet'
        }
        helper="Optional. Only active employees at Team Lead level can lead a team."
        disabled={disabled || !leadOptions.length}
        allowClear
      />

      {!leadOptions.length ? (
        <View style={styles.notice}>
          <Text style={styles.noticeTitle}>No eligible team leads</Text>
          <Text style={styles.noticeBody}>
            The backend only accepts a lead who is an active employee at Team
            Lead level. Promote someone to that level on their employee record
            and they will appear here.
          </Text>
        </View>
      ) : null}
    </>
  );
}
