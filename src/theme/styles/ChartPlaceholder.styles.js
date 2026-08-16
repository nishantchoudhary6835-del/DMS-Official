import { StyleSheet } from 'react-native';

import { theme } from '@theme';

const DONUT_SIZE = 148;

export const styles = StyleSheet.create({
  donutWrap: {
    width: DONUT_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.sm,
  },
  donutTotal: {
    ...theme.typography.displaySm,
    color: theme.colors.textPrimary,
  },
  donutCaption: {
    ...theme.typography.small,
    color: theme.colors.textMuted,
    marginTop: -2,
  },
  proportionBar: {
    flexDirection: 'row',
    width: '100%',
    height: 14,
    borderRadius: theme.radius.full,
    overflow: 'hidden',
    backgroundColor: theme.colors.surfaceSunk,
    marginTop: theme.spacing.md,
  },
  proportionSegment: {
    height: '100%',
  },

  barsWrap: {
    paddingTop: theme.spacing.sm,
  },
  plot: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.cardBorder,
    paddingBottom: 1,
  },
  column: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingHorizontal: 3,
  },
  barValue: {
    ...theme.typography.small,
    color: theme.colors.textMuted,
    marginBottom: 3,
  },
  bar: {
    alignSelf: 'stretch',
    borderTopLeftRadius: theme.radius.xs,
    borderTopRightRadius: theme.radius.xs,
  },

  axis: {
    flexDirection: 'row',
    marginTop: theme.spacing.xs,
  },
  axisLabel: {
    flex: 1,
    ...theme.typography.small,
    fontSize: 9.5,
    color: theme.colors.textMuted,
    textAlign: 'center',
    paddingHorizontal: 1,
  },
});
