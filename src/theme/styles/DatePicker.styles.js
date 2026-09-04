import { StyleSheet } from 'react-native';

import { theme } from '@theme';

export const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.xs,
  },
  label: {
    ...theme.typography.label,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  field: {
    height: 42,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.background,
  },
  fieldError: {
    borderColor: theme.colors.danger,
  },
  fieldDisabled: {
    backgroundColor: theme.colors.surface,
  },
  value: {
    ...theme.typography.body,
    color: theme.colors.textPrimary,
    flexShrink: 1,
  },
  placeholder: {
    color: theme.colors.textMuted,
  },
  message: {
    ...theme.typography.small,
    minHeight: 15,
    marginTop: 3,
  },
  errorText: {
    color: theme.colors.danger,
  },
  helperText: {
    color: theme.colors.textSecondary,
  },

  backdrop: {
    flex: 1,
    backgroundColor: theme.colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.xl,
  },
  sheet: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.lg,
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.lg,
    ...theme.elevation.raised,
  },

  monthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  monthNavButton: {
    width: 32,
    height: 32,
    borderRadius: theme.radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthNavButtonPressed: {
    backgroundColor: theme.colors.surface,
  },
  monthLabel: {
    ...theme.typography.h3,
    color: theme.colors.textPrimary,
  },

  weekRow: {
    flexDirection: 'row',
    marginBottom: theme.spacing.xs,
  },
  weekdayCell: {
    flex: 1,
    alignItems: 'center',
  },
  weekdayLabel: {
    ...theme.typography.small,
    color: theme.colors.textMuted,
  },

  weekGrid: {
    flexDirection: 'row',
  },
  dayCell: {
    flex: 1,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radius.full,
  },
  dayCellPressed: {
    backgroundColor: theme.colors.surface,
  },
  dayCellToday: {
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  dayCellSelected: {
    backgroundColor: theme.colors.primary,
  },
  dayCellDisabled: {
    opacity: 0.35,
  },
  dayText: {
    ...theme.typography.body,
    color: theme.colors.textPrimary,
  },
  dayTextSelected: {
    color: theme.colors.textOnPrimary,
    ...theme.typography.bodyBold,
  },
  dayTextOutside: {
    color: theme.colors.transparent,
  },

  clear: {
    paddingTop: theme.spacing.md,
    marginTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.cardBorder,
  },
  clearLabel: {
    ...theme.typography.label,
    color: theme.colors.danger,
    textAlign: 'center',
  },
});
