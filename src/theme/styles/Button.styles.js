import { StyleSheet } from 'react-native';

import { theme } from '@theme';

export const styles = StyleSheet.create({
  base: {
    minHeight: 44,
    borderRadius: theme.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  fullWidth: {
    alignSelf: 'stretch',
  },
  labelWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    ...theme.typography.button,
  },

  primary: {
    backgroundColor: theme.colors.primary,
  },
  primaryPressed: {
    backgroundColor: theme.colors.primaryDark,
  },
  primaryLabel: {
    color: theme.colors.textOnPrimary,
  },

  secondary: {
    backgroundColor: theme.colors.transparent,
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  secondaryPressed: {
    backgroundColor: theme.colors.primaryLight,
  },
  secondaryLabel: {
    color: theme.colors.primary,
  },

  danger: {
    backgroundColor: theme.colors.danger,
  },
  dangerPressed: {
    backgroundColor: theme.colors.dangerDark,
  },
  dangerLabel: {
    color: theme.colors.textOnPrimary,
  },

  text: {
    backgroundColor: theme.colors.transparent,
    minHeight: 36,
    paddingHorizontal: theme.spacing.sm,
  },
  textPressed: {
    opacity: 0.6,
  },
  textLabel: {
    color: theme.colors.primary,
  },

  disabled: {
    backgroundColor: theme.colors.disabled,
    borderColor: theme.colors.disabled,
  },
});
