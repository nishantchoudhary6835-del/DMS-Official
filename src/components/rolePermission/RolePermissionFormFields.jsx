import { Text, View } from 'react-native';

import { Select } from '@components/common/Select';

import { styles } from '@theme/styles/RolePermissionFormFields.styles';

export function RolePermissionFormFields({
  values,
  setField,
  errorFor,
  hierarchyOptions,
  permissionOptions,
  disabled = false,
}) {
  return (
    <>
      <Select
        label="Hierarchy level"
        value={values.hierarchyLevel}
        options={hierarchyOptions}
        onChange={(value) => setField('hierarchyLevel', value)}
        error={errorFor('hierarchyLevel')}
        placeholder="Select a level"
        helper="Which level of the organization gets this permission."
        disabled={disabled || !hierarchyOptions.length}
      />

      <Select
        label="Permission"
        value={values.permission}
        options={permissionOptions}
        onChange={(value) => setField('permission', value)}
        error={errorFor('permission')}
        placeholder={
          permissionOptions.length
            ? 'Select a permission'
            : 'No active permissions available yet'
        }
        helper="Only active permissions can be assigned."
        disabled={disabled || !permissionOptions.length}
      />

      <View style={styles.notice}>
        <Text style={styles.noticeTitle}>Eligibility, not final access</Text>
        <Text style={styles.noticeBody}>
          This only makes the hierarchy eligible for the permission. Whether a
          specific request is actually allowed still depends on the ACL rule
          that applies to it.
        </Text>
      </View>
    </>
  );
}
