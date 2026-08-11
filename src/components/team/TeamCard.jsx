import Ionicons from '@expo/vector-icons/Ionicons';
import { useRef } from 'react';
import { Animated, Platform, Pressable, Text, View } from 'react-native';

import { Badge } from '@components/common/Badge';
import { theme } from '@theme';
import { TEAM_STATUS } from '@validation/team';

import { styles } from '@theme/styles/TeamCard.styles';

const USE_NATIVE_DRIVER = Platform.OS !== 'web';

/**
 * Both references arrive populated from list and detail responses, but a
 * write response may return them bare — so a card can only name them when it
 * was handed the object.
 */
function departmentLabel(department) {
  if (!department || typeof department !== 'object') return null;
  if (!department.name) return null;

  return department.code
    ? `${department.name} (${department.code})`
    : department.name;
}

function leadName(teamLead) {
  if (!teamLead || typeof teamLead !== 'object') return null;

  const name = [teamLead.firstName, teamLead.lastName].filter(Boolean).join(' ');

  return name || teamLead.employeeId || null;
}

export function TeamCard({ team, onPress }) {
  const isActive = team.status === TEAM_STATUS.ACTIVE;
  const department = departmentLabel(team.department);
  const lead = leadName(team.teamLead);

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
          <View style={styles.glyph}>
            <Ionicons
              name="git-network-outline"
              size={18}
              color={theme.colors.primary}
            />
          </View>

          <View style={styles.details}>
            <View style={styles.topRow}>
              <Text style={styles.name} numberOfLines={2}>
                {team.name || 'Unnamed team'}
              </Text>
              <Badge
                label={isActive ? 'Active' : 'Inactive'}
                tone={isActive ? 'success' : 'neutral'}
              />
            </View>

            <Text
              style={department ? styles.meta : styles.metaEmpty}
              numberOfLines={1}
            >
              {department ?? 'No department'}
            </Text>

            <Text style={lead ? styles.meta : styles.metaEmpty} numberOfLines={1}>
              {lead ? `Lead · ${lead}` : 'No team lead assigned'}
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
