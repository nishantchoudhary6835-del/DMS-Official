import { Text, View } from 'react-native';

import { Select } from '@components/common/Select';
import { TextField } from '@components/common/TextField';

import { styles } from '@theme/styles/PermissionFormFields.styles';

export function PermissionFormFields({
  values,
  setField,
  errorFor,
  resourceOptions,
  actionOptions,
  disabled = false,
}) {
  return (
    <>
      <Select
        label="Resource"
        value={values.resource}
        options={resourceOptions}
        onChange={(value) => setField('resource', value)}
        error={errorFor('resource')}
        placeholder="Select a resource"
        helper="The system resource this permission applies to."
        disabled={disabled || !resourceOptions.length}
      />

      <Select
        label="Action"
        value={values.action}
        options={actionOptions}
        onChange={(value) => setField('action', value)}
        error={errorFor('action')}
        placeholder="Select an action"
        helper="One of the nine actions the Permission Engine supports."
        disabled={disabled || !actionOptions.length}
      />

      <TextField
        label="Note (optional)"
        value={values.description}
        onChangeText={(text) => setField('description', text)}
        error={errorFor('description')}
        placeholder="e.g. Only needed for onboarding new hires"
        helper="What this action does is explained automatically. Use this only to add context the action name doesn't already say."
        multiline
        numberOfLines={2}
        editable={!disabled}
      />

      <View style={styles.notice}>
        <Text style={styles.noticeTitle}>Not authorization by itself</Text>
        <Text style={styles.noticeBody}>
          A permission only defines that an action exists on a resource. It has
          to be assigned to a hierarchy through RolePermission, and pass the
          ACL check, before it grants anyone access.
        </Text>
      </View>
    </>
  );
}
