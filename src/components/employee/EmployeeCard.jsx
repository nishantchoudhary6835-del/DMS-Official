import Ionicons from '@expo/vector-icons/Ionicons';
import { useRef } from 'react';
import { Animated, Platform, Pressable, Text, View } from 'react-native';

import { Badge } from '@components/common/Badge';
import { theme } from '@theme';
import { initialsOf } from '@utils/format';
import { HIERARCHY_LABELS } from '@validation/employee';

import { styles } from '@theme/styles/EmployeeCard.styles';

const USE_NATIVE_DRIVER = Platform.OS !== 'web';

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

  const scale = useRef(new Animated.Value(1)).current;

  const press = (toValue) => {
    Animated.spring(scale, {
      toValue,
      speed: 44,
      bounciness: 0,
      useNativeDriver: USE_NATIVE_DRIVER,
    }).start();
  };

  // Animated cannot walk a function-style prop, so the transform sits on a
  // wrapper and the Pressable keeps its pressed-state styling.
  return (
    <Animated.View style={[styles.wrap, { transform: [{ scale }] }]}>
      <Pressable
        onPress={onPress}
        onPressIn={() => onPress && press(0.985)}
        onPressOut={() => press(1)}
        disabled={!onPress}
        accessibilityRole={onPress ? 'button' : undefined}
        style={({ pressed }) => [
          styles.card,
          // The spine states the one thing worth knowing before you read
          // anything else on the card.
          isActive ? styles.spineActive : styles.spineInactive,
          pressed && onPress && styles.pressed,
        ]}
      >
        <View style={styles.body}>
          <View style={styles.avatar}>
            <Text style={styles.avatarLabel}>
              {initialsOf(employee.firstName, employee.lastName, employee.email)}
            </Text>
          </View>

          <View style={styles.details}>
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
              <Text style={styles.employeeId}>{employee.employeeId}</Text>
              <Text style={styles.metaDot}>·</Text>
              <Text style={styles.role} numberOfLines={1}>
                {HIERARCHY_LABELS[employee.hierarchyLevel] ??
                  employee.hierarchyLevel}
              </Text>
            </View>

            <Text style={placements ? styles.placement : styles.placementEmpty}>
              {placements ?? 'No department or team assigned'}
            </Text>
          </View>
        </View>

        <View style={styles.footerRow}>
          <Ionicons
            name={employee.isRegistered ? 'shield-checkmark' : 'time-outline'}
            size={13}
            color={
              employee.isRegistered
                ? theme.colors.success
                : theme.colors.textMuted
            }
          />
          <Text style={styles.registration}>
            {employee.isRegistered
              ? 'Account registered'
              : 'Awaiting registration'}
          </Text>
          {onPress ? (
            <Ionicons
              name="chevron-forward"
              size={15}
              color={theme.colors.textMuted}
              style={styles.chevron}
            />
          ) : null}
        </View>
      </Pressable>
    </Animated.View>
  );
}
