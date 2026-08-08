import { Pressable, Text, View } from 'react-native';

import { Badge } from '@components/common/Badge';
import { HIERARCHY_LABELS } from '@validation/employee';

import { styles } from '@theme/styles/EmployeeCard.styles';

function nameOf(reference) {
  if (!reference || typeof reference !== 'object') return null;
  return reference.name ?? null;
}

export function EmployeeCard({ employee, onPress }) {
  const fullName = [employee.firstName, employee.lastName]
    .filter(Boolean)
    .join(' ');

  const isActive = employee.status === 'ACTIVE';
  const departmentName = nameOf(employee.department);
  const teamName = nameOf(employee.team);

  const placements =
    departmentName || teamName
      ? [departmentName ?? 'No department', teamName ?? 'No team'].join('  ·  ')
      : null;

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      style={({ pressed }) => [styles.card, pressed && onPress && styles.pressed]}
    >
      <View style={styles.topRow}>
        <Text style={styles.name} numberOfLines={1}>
          {fullName || 'Unnamed employee'}
        </Text>
        <Badge
          label={isActive ? 'Active' : 'Inactive'}
          tone={isActive ? 'success' : 'neutral'}
        />
      </View>

      <Text style={styles.email} numberOfLines={1}>
        {employee.email}
      </Text>

      <View style={styles.metaRow}>
        <Badge
          label={HIERARCHY_LABELS[employee.hierarchyLevel] ?? employee.hierarchyLevel}
          tone="accent"
        />
        <Text style={styles.employeeId}>{employee.employeeId}</Text>
      </View>

      {placements ? (
        <Text style={styles.placement} numberOfLines={1}>
          {placements}
        </Text>
      ) : (
        <Text style={styles.placementEmpty}>No department or team assigned</Text>
      )}

      <View style={styles.footerRow}>
        <View
          style={[
            styles.dot,
            employee.isRegistered ? styles.dotOn : styles.dotOff,
          ]}
        />
        <Text style={styles.registration}>
          {employee.isRegistered ? 'Account registered' : 'Awaiting registration'}
        </Text>
      </View>
    </Pressable>
  );
}
