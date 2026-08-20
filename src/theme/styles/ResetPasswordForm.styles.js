import { StyleSheet } from 'react-native';

import { theme } from '@theme';

export const styles = StyleSheet.create({
  title: theme.patterns.screenTitle,
  subtitle: theme.patterns.screenSubtitle,
  timer: theme.patterns.mutedCaption,

  // flex-start, not the default stretch: an error message wrapping under the
  // email field must not drag the button down with it.
  sendRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  sendField: {
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  // Matches the compact TextField's input height so the two sit level — same
  // measurement EmployeeListScreen's Find button uses.
  sendButton: {
    minHeight: 44,
    height: 44,
    paddingHorizontal: theme.spacing.md,
  },

  // Three questions on one screen. Labels and rules keep them legible as
  // separate asks without splitting them back into separate steps.
  fieldLabel: {
    ...theme.typography.label,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.cardBorder,
    marginVertical: theme.spacing.lg,
  },

  error: {
    ...theme.typography.caption,
    color: theme.colors.danger,
    marginTop: theme.spacing.sm,
    textAlign: 'center',
  },
  // Fixed slot under the code boxes: countdown, expiry, or the reason the
  // boxes are inert. Keeping one row for all three stops the password fields
  // shifting up and down as the state changes.
  statusRow: {
    marginTop: theme.spacing.md,
    alignItems: 'center',
  },
  waiting: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
    textAlign: 'center',
  },
  expired: {
    ...theme.typography.caption,
    color: theme.colors.warning,
    textAlign: 'center',
  },
  // Same voice as `waiting`, but it sits directly above a field rather than
  // alone in a row, so it needs its own gap.
  lockNote: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },

  action: {
    marginTop: theme.spacing.md,
  },
});
