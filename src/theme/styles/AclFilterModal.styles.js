import { StyleSheet } from 'react-native';

import { theme } from '@theme';

export const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: theme.colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.lg,
  },
  sheet: {
    width: '100%',
    maxWidth: 640,
    maxHeight: '85%',
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    padding: theme.spacing.lg,
    ...theme.elevation.raised,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    ...theme.typography.h3,
    color: theme.colors.textPrimary,
  },

  body: {
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  bodyContent: {
    paddingBottom: theme.spacing.sm,
  },

  groupLabel: {
    ...theme.typography.label,
    color: theme.colors.textMuted,
    marginBottom: theme.spacing.xs,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.md,
  },

  selectGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: theme.spacing.md,
  },
  selectGridItem: {
    width: '47%',
    minWidth: 220,
  },

  footer: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  footerButton: {
    flex: 1,
  },
});
