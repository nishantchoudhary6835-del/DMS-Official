import Ionicons from '@expo/vector-icons/Ionicons';
import { useMemo } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { BrandMark } from '@components/common/BrandMark';
import { useAuth } from '@context/AuthContext';
import { theme } from '@theme';

import { NAV_SECTIONS } from './navigation';

import { styles } from '@theme/styles/Sidebar.styles';

// No `requiresAccess` reads as "everyone" rather than a third tier to track.
// Unresolved (null) fails closed, since the alternative flashes Administration.
function isVisible(
  requiresAccess,
  { isSuperAdmin, isAdminOrAbove, isTeamLeadOrAbove }
) {
  if (requiresAccess === 'SUPER_ADMIN') return isSuperAdmin === true;
  if (requiresAccess === 'ADMIN_OR_ABOVE') return isAdminOrAbove === true;
  if (requiresAccess === 'TEAM_LEAD_OR_ABOVE') return isTeamLeadOrAbove === true;
  return true;
}

// Entries without a `route` are structural placeholders — they hover and read
// as live, but pressing one does nothing because the screen does not exist.
function NavItem({ item, isActive, isCollapsed, onPress }) {
  return (
    <Pressable
      onPress={item.route ? onPress : undefined}
      accessibilityRole="button"
      accessibilityLabel={item.label}
      accessibilityState={{ selected: isActive }}
      style={({ pressed, hovered }) => [
        styles.item,
        isCollapsed && styles.itemCollapsed,
        hovered && !isActive && styles.itemHovered,
        pressed && !isActive && styles.itemPressed,
        isActive && styles.itemActive,
      ]}
    >
      <Ionicons
        name={item.icon}
        size={17}
        color={isActive ? theme.colors.textOnPrimary : theme.colors.textSecondary}
      />

      {isCollapsed ? null : (
        <Text
          style={[styles.itemLabel, isActive && styles.itemLabelActive]}
          numberOfLines={1}
        >
          {item.label}
        </Text>
      )}
    </Pressable>
  );
}

export function Sidebar({
  activeKey = 'dashboard',
  onNavigate,
  onDismiss,
  isOverlay = false,
  isCollapsed = false,
  onToggleCollapse,
}) {
  // Collapsing is a desktop affordance; in drawer form the rail is already
  // temporary, so the control would only be a second way to close it.
  const collapsed = isCollapsed && !isOverlay;

  const { isSuperAdmin, isAdminOrAbove, isTeamLeadOrAbove } = useAuth();

  const sections = useMemo(() => {
    const access = { isSuperAdmin, isAdminOrAbove, isTeamLeadOrAbove };

    return NAV_SECTIONS.filter((section) => isVisible(section.requiresAccess, access))
      .map((section) => ({
        ...section,
        items: section.items.filter((item) => isVisible(item.requiresAccess, access)),
      }))
      .filter((section) => section.items.length > 0);
  }, [isSuperAdmin, isAdminOrAbove, isTeamLeadOrAbove]);

  return (
    <View
      style={[
        styles.rail,
        collapsed && styles.railCollapsed,
        isOverlay && styles.railOverlay,
      ]}
    >
      <View style={[styles.header, collapsed && styles.headerCollapsed]}>
        {collapsed ? (
          <View style={styles.mark}>
            <Ionicons
              name="layers"
              size={18}
              color={theme.colors.textOnPrimary}
            />
          </View>
        ) : (
          <BrandMark size="small" align="left" showTagline />
        )}

        {isOverlay ? (
          <Pressable
            onPress={onDismiss}
            accessibilityRole="button"
            accessibilityLabel="Close menu"
            hitSlop={10}
            style={styles.dismiss}
          >
            <Ionicons name="close" size={20} color={theme.colors.textMuted} />
          </Pressable>
        ) : null}
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {sections.map((section) => (
          <View key={section.key} style={styles.section}>
            {section.title ? (
              collapsed ? (
                <View style={styles.sectionRule} />
              ) : (
                <Text style={styles.sectionTitle}>{section.title}</Text>
              )
            ) : null}

            {section.items.map((item) => (
              <NavItem
                key={item.key}
                item={item}
                isActive={item.key === activeKey}
                isCollapsed={collapsed}
                onPress={() => onNavigate?.(item)}
              />
            ))}
          </View>
        ))}
      </ScrollView>

      {isOverlay ? null : (
        <Pressable
          onPress={onToggleCollapse}
          accessibilityRole="button"
          accessibilityLabel={collapsed ? 'Expand menu' : 'Collapse menu'}
          style={({ hovered }) => [
            styles.collapse,
            collapsed && styles.itemCollapsed,
            hovered && styles.itemHovered,
          ]}
        >
          <Ionicons
            name={collapsed ? 'chevron-forward' : 'chevron-back'}
            size={16}
            color={theme.colors.textMuted}
          />
          {collapsed ? null : (
            <Text style={styles.collapseLabel}>Collapse Menu</Text>
          )}
        </Pressable>
      )}
    </View>
  );
}
