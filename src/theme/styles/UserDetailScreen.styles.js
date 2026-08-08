import { StyleSheet } from 'react-native';

import { theme } from '@theme';

export const styles = StyleSheet.create({
  page: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.xxl,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  identity: {
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  name: {
    ...theme.typography.h1,
    color: theme.colors.textPrimary,
    flexShrink: 1,
    marginRight: theme.spacing.sm,
  },
  email: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },

  sectionLabel: {
    ...theme.typography.small,
    color: theme.colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.xs,
  },
  section: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    paddingHorizontal: theme.spacing.lg,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.md,
  },
  rowDivider: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.cardBorder,
  },
  rowLabel: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginRight: theme.spacing.lg,
  },
  rowValue: {
    ...theme.typography.bodyBold,
    color: theme.colors.textPrimary,
    flexShrink: 1,
    textAlign: 'right',
  },
  rowValueMuted: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
    fontStyle: 'italic',
    flexShrink: 1,
    textAlign: 'right',
  },

  actionBlock: {
    marginTop: theme.spacing.xl,
  },
  statusSelect: {
    marginTop: theme.spacing.xs,
  },
  hint: {
    ...theme.typography.small,
    color: theme.colors.textMuted,
    marginTop: theme.spacing.xs,
    marginBottom: theme.spacing.md,
  },

  passwordCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    padding: theme.spacing.lg,
    marginTop: theme.spacing.sm,
  },

  dangerBlock: {
    marginTop: theme.spacing.xxl,
    paddingTop: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: theme.colors.cardBorder,
  },
  dangerLabel: {
    ...theme.typography.small,
    color: theme.colors.danger,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: theme.spacing.sm,
  },
  dangerHint: {
    ...theme.typography.small,
    color: theme.colors.textMuted,
    textAlign: 'center',
    marginTop: theme.spacing.sm,
  },

  errorBlock: {
    marginTop: theme.spacing.lg,
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
  },
});
