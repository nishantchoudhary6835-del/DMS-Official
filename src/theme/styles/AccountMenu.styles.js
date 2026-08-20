import { StyleSheet } from 'react-native';

import { theme } from '@theme';

// TopBar's own footprint (minHeight 56 + paddingVertical both sides). Anchored
// below it rather than measured, since the trigger is always top-right.
const TOP_OFFSET = 56 + theme.spacing.sm * 2 + theme.spacing.xs;

export const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
    paddingTop: TOP_OFFSET,
    paddingRight: theme.spacing.lg,
  },
  sheetWrap: {
    width: '100%',
    maxWidth: 240,
  },
  sheet: {
    width: '100%',
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    paddingVertical: theme.spacing.sm,
    ...theme.elevation.raised,
  },

  identity: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  name: {
    ...theme.typography.label,
    color: theme.colors.textPrimary,
  },
  email: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },

  divider: {
    height: 1,
    backgroundColor: theme.colors.cardBorder,
    marginVertical: theme.spacing.xs,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  rowHovered: {
    backgroundColor: theme.colors.surfaceSunk,
  },
  rowLabel: {
    ...theme.typography.body,
    color: theme.colors.textPrimary,
    marginLeft: theme.spacing.sm,
  },
  rowLabelDanger: {
    color: theme.colors.danger,
  },
});
