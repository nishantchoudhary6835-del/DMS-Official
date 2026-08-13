import { useMemo } from 'react';
import { Text, View } from 'react-native';

import { Select } from '@components/common/Select';
import { TextField } from '@components/common/TextField';
import { actionLabel, PERMISSION_ACTIONS } from '@validation/permission';

import { styles } from '@theme/styles/PermissionFormFields.styles';

export function PermissionFormFields({ values, setField, errorFor, disabled = false }) {
  const actionOptions = useMemo(
    () =>
      PERMISSION_ACTIONS.map((action) => ({
        value: action,
        label: actionLabel(action),
      })),
    []
  );

  return (
    <>
      <TextField
        label="Resource"
        value={values.resource}
        onChangeText={(text) => setField('resource', text)}
        error={errorFor('resource')}
        placeholder="TEAM"
        helper="The system resource this permission applies to."
        autoCorrect={false}
        editable={!disabled}
      />

      <Select
        label="Action"
        value={values.action}
        options={actionOptions}
        onChange={(value) => setField('action', value)}
        error={errorFor('action')}
        placeholder="Select an action"
        helper="One of the nine actions the Permission Engine supports."
        disabled={disabled}
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
