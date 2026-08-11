import Ionicons from '@expo/vector-icons/Ionicons';
import { Platform, Pressable, Text, TextInput, View } from 'react-native';

import { theme } from '@theme';
import { initialsOf } from '@utils/format';

import { styles } from '@theme/styles/TopBar.styles';

function IconAction({ icon, count, label, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={count ? `${label}, ${count} unread` : label}
      hitSlop={6}
      style={({ hovered }) => [styles.iconAction, hovered && styles.hovered]}
    >
      <Ionicons name={icon} size={19} color={theme.colors.textSecondary} />
      {count ? (
        <View style={styles.count}>
          <Text style={styles.countLabel}>{count}</Text>
        </View>
      ) : null}
    </Pressable>
  );
}

export function TopBar({
  isCompact = false,
  isPhone = false,
  email,
  name = 'Signed in',
  role = 'Team Lead',
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

      <View style={styles.search}>
        <Ionicons
          name="search"
          size={16}
          color={theme.colors.textMuted}
          style={styles.searchIcon}
        />
        <TextInput
          placeholder={
            isPhone ? 'Search…' : 'Search documents, users, ideas…'
          }
          placeholderTextColor={theme.colors.textMuted}
          style={styles.searchInput}
          returnKeyType="search"
        />
        {/* The shortcut hint is only true where there is a keyboard to press. */}
        {Platform.OS === 'web' && !isPhone ? (
          <View style={styles.shortcut}>
            <Text style={styles.shortcutLabel}>⌘K</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.actions}>
        <IconAction icon="notifications-outline" count={10} label="Notifications" />
        <IconAction icon="mail-outline" count={3} label="Messages" />
        {isPhone ? null : (
          <IconAction icon="help-circle-outline" label="Help" />
        )}

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
                <Text style={styles.role} numberOfLines={1}>
                  {role}
                </Text>
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
