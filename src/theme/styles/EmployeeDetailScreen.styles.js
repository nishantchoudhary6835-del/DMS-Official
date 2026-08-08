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

  registrationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: theme.radius.full,
    marginRight: theme.spacing.sm,
  },
  dotOn: {
    backgroundColor: theme.colors.success,
  },
  dotOff: {
    backgroundColor: theme.colors.textMuted,
  },
  registration: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },

  errorBlock: {
    marginTop: theme.spacing.lg,
  },

  accountAction: {
    marginTop: theme.spacing.sm,
  },

  statusBlock: {
    marginTop: theme.spacing.xl,
  },
  statusHint: {
    ...theme.typography.small,
    color: theme.colors.textMuted,
    textAlign: 'center',
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
