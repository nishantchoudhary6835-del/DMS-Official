import { useMemo } from 'react';
import { Text, View } from 'react-native';

import { Select } from '@components/common/Select';
import { TextField } from '@components/common/TextField';
import { labelFor, optionsWithCurrentLevel } from '@validation/employee';

import { styles } from '@theme/styles/EmployeeFormFields.styles';

export function EmployeeFormFields({
  values,
  setField,
  errorFor,
  hierarchyOptions,
  hierarchyHelper,
  managerOptions,
  managerHiddenCount = 0,
  managerHelper = 'Optional. Can be assigned later.',
  disabled = false,
}) {
  // Applied here rather than in the edit screen because it is a property of
  // the field — a Select must always be able to display its own value — not a
  // rule about editing.
  const levelOptions = useMemo(
    () => optionsWithCurrentLevel(hierarchyOptions, values.hierarchyLevel),
    [hierarchyOptions, values.hierarchyLevel]
  );

  // An empty manager list means two different things, and saying "none
  // available" when the real reason is that everyone was filtered out would
  // send someone hunting for a data problem that isn't there.
  const managerPlaceholder = managerOptions.length
    ? 'Optional'
    : managerHiddenCount
      ? 'No one senior enough'
      : 'No employees available yet';

  const managerNote = [
    managerHelper,
    managerHiddenCount
      ? `${labelFor(values.hierarchyLevel)} and above only — ${managerHiddenCount} hidden.`
      : null,
  ]
    .filter(Boolean)
    .join(' ');

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
        options={levelOptions}
        onChange={(value) => setField('hierarchyLevel', value)}
        error={errorFor('hierarchyLevel')}
        helper={hierarchyHelper}
        placeholder="Select a level"
        disabled={disabled}
      />

      <Select
        label="Reporting manager"
        value={values.reportingManager}
        options={managerOptions}
        onChange={(value) => setField('reportingManager', value)}
        error={errorFor('reportingManager')}
        placeholder={managerPlaceholder}
        helper={managerNote}
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
