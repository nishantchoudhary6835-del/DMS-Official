import { StyleSheet } from 'react-native';

import { theme } from '@theme';

export const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: theme.colors.transparent,
  },
  flex: {
    flex: 1,
  },
  row: {
    flex: 1,
    flexDirection: 'row',
  },
  main: {
    flex: 1,
    // Minimum guards the content column from collapsing to nothing while the
    // rail still holds its 260px on a narrow desktop window.
    minWidth: 0,
  },

  content: {
    padding: theme.spacing.xl,
    paddingBottom: theme.spacing.lg,
  },
  contentCompact: {
    padding: theme.spacing.lg,
  },

  footer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: theme.spacing.xl,
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.cardBorder,
  },
  footerText: {
    ...theme.typography.small,
    color: theme.colors.textMuted,
  },

  drawerRow: {
    flex: 1,
    flexDirection: 'row',
  },
  drawer: {
    width: '82%',
    maxWidth: 300,
    backgroundColor: theme.colors.card,
  },
  scrim: {
    flex: 1,
    backgroundColor: theme.colors.overlay,
  },
});
