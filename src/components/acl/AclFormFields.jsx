import { Text, View } from 'react-native';

import { Select } from '@components/common/Select';
import { ACL_EFFECT } from '@validation/acl';

import { styles } from '@theme/styles/AclFormFields.styles';

const EFFECT_OPTIONS = [
  { value: ACL_EFFECT.ALLOW, label: 'Allow' },
  { value: ACL_EFFECT.DENY, label: 'Deny' },
];

export function AclFormFields({
  values,
  setField,
  errorFor,
  hierarchyOptions,
  permissionOptions,
  departmentOptions,
  teamOptions,
  employeeOptions,
  disabled = false,
}) {
  // A team belongs to one department, so there is nothing to scope to until
  // one is chosen — matching EmployeeFormFields' identical rule for the same
  // reason.
  const hasDepartment = Boolean(values.department);
  const teamPlaceholder = !hasDepartment
    ? 'Select a department first'
    : teamOptions.length
      ? 'Optional — leave blank for department-wide'
      : 'No teams in this department';

  return (
    <>
      <Select
        label="Hierarchy level"
        value={values.hierarchyLevel}
        options={hierarchyOptions}
        onChange={(value) => setField('hierarchyLevel', value)}
        error={errorFor('hierarchyLevel')}
        placeholder="Select a level"
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
        disabled={disabled || !permissionOptions.length}
      />

      <Select
        label="Effect"
        value={values.effect}
        options={EFFECT_OPTIONS}
        onChange={(value) => setField('effect', value)}
        error={errorFor('effect')}
        placeholder="Select an effect"
        helper="Allow lets the request continue. Deny blocks it, overriding a broader Allow."
        disabled={disabled}
      />

      <Text style={styles.sectionLabel}>Scope (optional)</Text>

      <Select
        label="Department"
        value={values.department}
        options={departmentOptions}
        onChange={(value) => setField('department', value)}
        error={errorFor('department')}
        placeholder={
          departmentOptions.length ? 'Global — applies everywhere' : 'No departments available yet'
        }
        helper="Leave blank for a rule that applies across the whole hierarchy level."
        disabled={disabled || !departmentOptions.length}
        allowClear
      />

      <Select
        label="Team"
        value={values.team}
        options={teamOptions}
        onChange={(value) => setField('team', value)}
        error={errorFor('team')}
        placeholder={teamPlaceholder}
        helper="Narrows the rule to one team within the department above."
        disabled={disabled || !hasDepartment || !teamOptions.length}
        allowClear
      />

      <Select
        label="Employee"
        value={values.employee}
        options={employeeOptions}
        onChange={(value) => setField('employee', value)}
        error={errorFor('employee')}
        placeholder={
          employeeOptions.length ? 'Global — applies to everyone' : 'No employees available yet'
        }
        helper="The most specific option. Overrides team, department, and hierarchy-wide rules for this one person."
        disabled={disabled || !employeeOptions.length}
        allowClear
      />

      <View style={styles.notice}>
        <Text style={styles.noticeTitle}>Only the most specific match applies</Text>
        <Text style={styles.noticeBody}>
          Most rules set only one of Department, Team, or Employee. When
          several separate rules could match the same request, the most
          specific one wins — Employee first, then Team, then Department,
          then this hierarchy level globally.
        </Text>
      </View>
    </>
  );
}
