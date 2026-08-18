import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, Text, View } from 'react-native';

import { theme } from '@theme';
import { initialsOf } from '@utils/format';

import { styles } from '@theme/styles/TopBar.styles';

export function TopBar({
  isCompact = false,
  email,
  name = 'Signed in',
  role,
  onOpenMenu,
  onProfilePress,
}) {
  // initialsOf takes the name in two parts, so a display name has to be split
  // back apart to yield a two-letter monogram rather than one.
  const [firstName = '', lastName = ''] = String(name ?? '').trim().split(/\s+/);

  return (
    <View style={styles.bar}>
      {isCompact ? (
        <Pressable
          onPress={onOpenMenu}
          accessibilityRole="button"
          accessibilityLabel="Open menu"
          hitSlop={8}
          style={({ hovered }) => [styles.iconAction, hovered && styles.hovered]}
        >
          <Ionicons name="menu" size={22} color={theme.colors.textPrimary} />
        </Pressable>
      ) : null}

      <View style={styles.actions}>
        <Pressable
          onPress={onProfilePress}
          accessibilityRole="button"
          accessibilityLabel="Account"
          style={({ hovered }) => [styles.profile, hovered && styles.hovered]}
        >
          <View style={styles.avatar}>
            <Text style={styles.avatarLabel}>
              {initialsOf(firstName, lastName, email)}
            </Text>
          </View>

          {isCompact ? null : (
            <>
              <View style={styles.identity}>
                <Text style={styles.name} numberOfLines={1}>
                  {name}
                </Text>
                {role ? (
                  <Text style={styles.role} numberOfLines={1}>
                    {role}
                  </Text>
                ) : null}
              </View>
              <Ionicons
                name="chevron-down"
                size={15}
                color={theme.colors.textMuted}
              />
            </>
          )}
        </Pressable>
      </View>
    </View>
  );
}
