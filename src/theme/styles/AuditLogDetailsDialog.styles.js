import { StyleSheet } from 'react-native';

import { theme } from '@theme';

export const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: theme.colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.lg,
  },
  sheet: {
    width: '100%',
    maxWidth: 520,
    // Caps the sheet on tall screens so the Close button stays reachable
    // without scrolling the whole dialog.
    maxHeight: '85%',
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    padding: theme.spacing.lg,
    ...theme.elevation.raised,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  module: {
    ...theme.typography.overline,
    color: theme.colors.textMuted,
  },

  description: {
    ...theme.typography.body,
    color: theme.colors.textPrimary,
    marginTop: theme.spacing.md,
  },

  body: {
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  bodyContent: {
    paddingBottom: theme.spacing.sm,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    gap: theme.spacing.md,
  },
  rowLabel: {
    ...theme.typography.label,
    color: theme.colors.textMuted,
    width: 108,
  },
  rowValue: {
    ...theme.typography.small,
    color: theme.colors.textPrimary,
    flex: 1,
    // IDs, IPs and user agents are the point of this dialog — let them wrap
    // in full rather than truncating what someone came here to read.
    flexWrap: 'wrap',
  },

  sectionLabel: {
    ...theme.typography.overline,
    color: theme.colors.textMuted,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.xs,
  },
  noMetadata: {
    ...theme.typography.small,
    color: theme.colors.textMuted,
    marginTop: theme.spacing.lg,
  },
});
