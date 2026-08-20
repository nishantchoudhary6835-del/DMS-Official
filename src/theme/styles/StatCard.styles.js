import { StyleSheet } from 'react-native';

import { theme } from '@theme';

export const styles = StyleSheet.create({
  // The reference tints the whole card; Bureau states it with a spine and keeps
  // the surface white, so four in a row do not read as a paint chart.
  card: {
    flex: 1,
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    borderLeftWidth: theme.spine.width,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
    ...theme.elevation.card,
  },

  top: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  glyph: {
    width: 40,
    height: 40,
    borderRadius: theme.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  figures: {
    flex: 1,
    minWidth: 0,
  },
  value: {
    ...theme.typography.displaySm,
    color: theme.colors.textPrimary,
  },
  label: {
    ...theme.typography.small,
    color: theme.colors.textSecondary,
    marginTop: 1,
  },

  link: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginTop: theme.spacing.md,
  },
  linkHovered: {
    opacity: 0.7,
  },
  linkLabel: {
    ...theme.typography.small,
    color: theme.colors.primary,
    fontFamily: theme.typography.label.fontFamily,
  },
  linkIcon: {
    marginLeft: 4,
  },
});
