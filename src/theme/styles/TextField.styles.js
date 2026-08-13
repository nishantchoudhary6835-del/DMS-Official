import { Platform, StyleSheet } from 'react-native';

import { theme } from '@theme';

// react-native-web renders TextInput as a real <input>, which the browser
// gives its own default focus ring — a second, black outline drawn on top
// of the crimson border `inputFocused`/`fieldRowFocused` already provide.
// `outlineStyle` is a react-native-web-only style property with no native
// counterpart, so it's scoped to web rather than passed on every platform.
const noOutline = Platform.select({ web: { outlineStyle: 'none' }, default: {} });

export const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.xs,
  },
  label: {
    ...theme.typography.overline,
    color: theme.colors.textSecondary,
    marginBottom: 5,
  },
  input: {
    height: 44,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.spacing.md,
    ...theme.typography.body,
    color: theme.colors.textPrimary,
    backgroundColor: theme.colors.background,
    ...noOutline,
  },
  // Crimson focus ring — the one place the brand colour appears on a form.
  inputFocused: {
    borderColor: theme.colors.borderFocus,
    borderWidth: 1.5,
    backgroundColor: theme.colors.card,
  },
  inputError: {
    borderColor: theme.colors.danger,
  },
  inputDisabled: {
    backgroundColor: theme.colors.surface,
    color: theme.colors.textMuted,
  },

  // --- Icon variant --------------------------------------------------------
  // Same box the plain `input` draws, moved onto the wrapping row so an icon
  // can sit inside the border with the input; the border itself never
  // shows up on both at once.
  fieldRow: {
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.background,
  },
  fieldRowFocused: {
    borderColor: theme.colors.borderFocus,
    borderWidth: 1.5,
    backgroundColor: theme.colors.card,
  },
  fieldRowError: {
    borderColor: theme.colors.danger,
  },
  fieldRowDisabled: {
    backgroundColor: theme.colors.surface,
  },
  fieldIcon: {
    marginRight: theme.spacing.sm,
  },
  fieldInput: {
    flex: 1,
    ...theme.typography.body,
    color: theme.colors.textPrimary,
    padding: 0,
    ...noOutline,
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
});
