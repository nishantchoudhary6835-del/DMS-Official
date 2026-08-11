import Ionicons from '@expo/vector-icons/Ionicons';
import { useRef } from 'react';
import { Animated, Platform, Pressable, Text, View } from 'react-native';

import { Badge } from '@components/common/Badge';
import { theme } from '@theme';
import { DEPARTMENT_STATUS } from '@validation/department';

import { styles } from '@theme/styles/DepartmentCard.styles';

const USE_NATIVE_DRIVER = Platform.OS !== 'web';

/**
 * `head` arrives populated from update responses and bare (or null) from the
 * list, so a card can only name a head when it was given the object.
 */
function headName(head) {
  if (!head || typeof head !== 'object') return null;

  const name = [head.firstName, head.lastName].filter(Boolean).join(' ');

  return name || head.employeeId || null;
}

export function DepartmentCard({ department, onPress }) {
  const isActive = department.status === DEPARTMENT_STATUS.ACTIVE;
  const head = headName(department.head);

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
          isActive ? styles.spineActive : styles.spineInactive,
          pressed && onPress && styles.pressed,
        ]}
      >
        <View style={styles.body}>
          {/* The code is the department's identity everywhere else in the
              system, so it takes the position an avatar would. */}
          <View style={styles.codeTile}>
            <Text style={styles.codeLabel} numberOfLines={1}>
              {department.code}
            </Text>
          </View>

          <View style={styles.details}>
            <View style={styles.topRow}>
              <Text style={styles.name} numberOfLines={2}>
                {department.name || 'Unnamed department'}
              </Text>
              <Badge
                label={isActive ? 'Active' : 'Inactive'}
                tone={isActive ? 'success' : 'neutral'}
              />
            </View>

            <Text style={head ? styles.head : styles.headEmpty} numberOfLines={1}>
              {head ? `Head · ${head}` : 'No department head assigned'}
            </Text>
          </View>

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
