import { StyleSheet } from 'react-native';

import { theme } from '@theme';

export const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.sm,
  },

  titleRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  title: {
    ...theme.typography.h1,
    color: theme.colors.textPrimary,
  },
  count: {
    ...theme.typography.small,
    color: theme.colors.textMuted,
    flexShrink: 1,
    marginLeft: theme.spacing.sm,
  },

  /**
   * react-native-web gives ScrollView a base `flexGrow: 1`. While the list
   * below has results it claims the spare height and this row stays squeezed
   * to its content — but filter to an empty result and the list collapses,
   * freeing height this row then grows into. Its content container is a flex
   * row, so the default align-items:stretch turns every chip into a
   * full-height bar. Pinning flexGrow removes the growth.
   */
  filterScroll: {
    flexGrow: 0,
    flexShrink: 0,
  },
  filterRow: {
    // Belt and braces: even if this row is ever given height by something
    // else, the chips keep hugging their labels.
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.sm,
  },

  errorBlock: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
  },

  listContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl,
  },

  centred: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.xxl,
  },
  emptyTitle: {
    ...theme.typography.h3,
    color: theme.colors.textPrimary,
    textAlign: 'center',
    marginBottom: theme.spacing.xs,
  },
  emptyBody: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
});
