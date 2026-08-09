import { StyleSheet } from 'react-native';

import { theme } from '@theme';

export const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 7,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.card,
    marginRight: theme.spacing.sm,
  },
  chipSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  // Opacity rather than a background, so it composes correctly over
  // chipSelected — which is applied earlier in the same style array.
  chipPressed: {
    opacity: 0.72,
  },
  chipDisabled: {
    opacity: 0.45,
  },
  label: {
    ...theme.typography.label,
    fontSize: 12.5,
    color: theme.colors.textSecondary,
  },
  labelSelected: {
    color: theme.colors.textOnPrimary,
  },
});
