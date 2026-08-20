import { StyleSheet } from 'react-native';

import { theme } from '@theme';

export const styles = StyleSheet.create({
  // Layout lives on the animated wrapper; `base` fills whatever it is given.
  wrap: {
    alignSelf: 'flex-start',
  },
  fullWidth: {
    alignSelf: 'stretch',
  },
  base: {
    minHeight: 46,
    borderRadius: theme.radius.md,
    alignSelf: 'stretch',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  labelWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    marginRight: 7,
  },
  iconTrailing: {
    marginLeft: 7,
  },
  // Opt-in, for one-off hero actions (Login) rather than the default control
  // shape — the same way `radius.hero` is reserved for the Signal blocks.
  pill: {
    borderRadius: theme.radius.full,
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
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  secondaryPressed: {
    backgroundColor: theme.colors.surfaceSunk,
    borderColor: theme.colors.textMuted,
  },
  secondaryLabel: {
    color: theme.colors.textPrimary,
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
    minHeight: 38,
    paddingHorizontal: theme.spacing.sm,
  },
  textPressed: {
    opacity: 0.55,
  },
  textLabel: {
    color: theme.colors.primary,
  },

  disabled: {
    backgroundColor: theme.colors.disabled,
    borderColor: theme.colors.disabled,
  },
});
