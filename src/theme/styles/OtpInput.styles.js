import { StyleSheet } from 'react-native';

import { theme } from '@theme';

export const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
  },
  hiddenInput: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0,
    zIndex: 1,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  box: {
    flex: 1,
    marginHorizontal: theme.spacing.xs,
    height: 56,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.background,
  },
  boxFilled: {
    borderColor: theme.colors.primary,
  },
  boxActive: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primaryLight,
  },
  boxError: {
    borderColor: theme.colors.danger,
  },
  boxDisabled: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
  },
  digit: {
    ...theme.typography.otpDigit,
    color: theme.colors.textPrimary,
  },
});
