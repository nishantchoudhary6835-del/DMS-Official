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
  chevron: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
    marginLeft: theme.spacing.sm,
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
    maxWidth: 380,
    maxHeight: '75%',
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.xl,
    paddingVertical: theme.spacing.lg,
    ...theme.elevation.card,
  },
  sheetTitle: {
    ...theme.typography.h3,
    color: theme.colors.textPrimary,
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
  },
  sheetList: {
    flexGrow: 0,
  },

  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  optionSelected: {
    backgroundColor: theme.colors.primaryLight,
  },
  optionPressed: {
    backgroundColor: theme.colors.surface,
  },
  optionTextWrap: {
    flexShrink: 1,
  },
  optionLabel: {
    ...theme.typography.body,
    color: theme.colors.textPrimary,
  },
  optionLabelSelected: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
  optionHint: {
    ...theme.typography.small,
    color: theme.colors.textMuted,
    marginTop: 1,
  },
  tick: {
    ...theme.typography.body,
    color: theme.colors.primary,
    marginLeft: theme.spacing.sm,
  },

  clear: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.cardBorder,
    marginTop: theme.spacing.sm,
  },
  clearLabel: {
    ...theme.typography.caption,
    color: theme.colors.danger,
    fontWeight: '600',
  },
});
