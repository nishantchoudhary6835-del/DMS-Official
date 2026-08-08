import { Text, View } from 'react-native';

import { Select } from '@components/common/Select';
import { TextField } from '@components/common/TextField';
import { HIERARCHY_LABELS, HIERARCHY_LEVELS } from '@validation/employee';

import { styles } from '@theme/styles/EmployeeFormFields.styles';

const HIERARCHY_OPTIONS = HIERARCHY_LEVELS.map((level) => ({
  value: level,
  label: HIERARCHY_LABELS[level],
}));

export function EmployeeFormFields({
  values,
  setField,
  errorFor,
  managerOptions,
  managerHelper = 'Optional. Can be assigned later.',
  disabled = false,
}) {
  return (
    <>
      <TextField
        label="Employee ID"
        value={values.employeeId}
        onChangeText={(text) => setField('employeeId', text)}
        error={errorFor('employeeId')}
        placeholder="EMP-001"
        helper="Uppercased automatically. Must be unique."
        autoCapitalize="characters"
        autoCorrect={false}
        editable={!disabled}
      />

      <TextField
        label="First name"
        value={values.firstName}
        onChangeText={(text) => setField('firstName', text)}
        error={errorFor('firstName')}
        placeholder="Rahul"
        editable={!disabled}
      />

      <TextField
        label="Last name"
        value={values.lastName}
        onChangeText={(text) => setField('lastName', text)}
        error={errorFor('lastName')}
        placeholder="Patil"
        editable={!disabled}
      />

      <TextField
        label="Work email"
        value={values.email}
        onChangeText={(text) => setField('email', text)}
        error={errorFor('email')}
        placeholder="rahul@company.com"
        helper="They will use this to register and receive the OTP."
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        editable={!disabled}
      />

      <Select
        label="Hierarchy level"
        value={values.hierarchyLevel}
        options={HIERARCHY_OPTIONS}
        onChange={(value) => setField('hierarchyLevel', value)}
        error={errorFor('hierarchyLevel')}
        placeholder="Select a level"
        disabled={disabled}
      />

      <Select
        label="Reporting manager"
        value={values.reportingManager}
        options={managerOptions}
        onChange={(value) => setField('reportingManager', value)}
        error={errorFor('reportingManager')}
        placeholder={
          managerOptions.length ? 'Optional' : 'No employees available yet'
        }
        helper={managerHelper}
        disabled={disabled || !managerOptions.length}
        allowClear
      />

      <View style={styles.notice}>
        <Text style={styles.noticeTitle}>Department and team</Text>
        <Text style={styles.noticeBody}>
          Not assignable yet — the backend has no endpoint to list departments or
          teams, so both are left unset. They can be assigned once those
          endpoints exist.
        </Text>
      </View>
    </>
  );
}
