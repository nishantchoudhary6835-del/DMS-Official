import { useMemo } from 'react';
import { Text, View } from 'react-native';

import { Select } from '@components/common/Select';
import { TextField } from '@components/common/TextField';

import { styles } from '@theme/styles/DepartmentFormFields.styles';

export function DepartmentFormFields({
  values,
  setField,
  errorFor,
  headOptions,
  disabled = false,
}) {
  // The current head stays selectable even once deactivated — otherwise the
  // Select falls to its placeholder and a name edit reads as removing them.
  const options = useMemo(() => {
    const current = values.head;

    if (!current || headOptions.some((option) => option.value === current)) {
      return headOptions;
    }

    return [
      ...headOptions,
      { value: current, label: 'Current head', hint: 'No longer active' },
    ];
  }, [headOptions, values.head]);

  return (
    <>
      <TextField
        label="Department name"
        value={values.name}
        onChangeText={(text) => setField('name', text)}
        error={errorFor('name')}
        placeholder="Human Resources"
        editable={!disabled}
      />

      <TextField
        label="Department code"
        value={values.code}
        onChangeText={(text) => setField('code', text)}
        error={errorFor('code')}
        placeholder="HR"
        helper="Uppercased automatically. Must be unique."
        autoCapitalize="characters"
        autoCorrect={false}
        editable={!disabled}
      />

      <Select
        label="Department head"
        value={values.head}
        options={options}
        onChange={(value) => setField('head', value)}
        error={errorFor('head')}
        placeholder={
          headOptions.length ? 'Optional' : 'No employees available yet'
        }
        helper="Optional. Can be assigned later."
        disabled={disabled || !headOptions.length}
        allowClear
      />

      <View style={styles.notice}>
        <Text style={styles.noticeTitle}>Heads are a one-way reference</Text>
        <Text style={styles.noticeBody}>
          Naming someone head does not move them into this department. Their own
          department is set on their employee record, and the two are stored
          separately — so a head can belong to a different department entirely.
        </Text>
      </View>
    </>
  );
}
