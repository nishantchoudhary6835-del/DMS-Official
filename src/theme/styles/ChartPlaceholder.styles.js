import { StyleSheet } from 'react-native';

import { theme } from '@theme';

const DONUT_SIZE = 148;

export const styles = StyleSheet.create({
  donutWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.sm,
  },
  // A ring rather than a disc, so the footprint and the centred total match
  // what the real chart will occupy. Left undivided because an invented
  // series is worse than an obvious gap.
  donut: {
    width: DONUT_SIZE,
    height: DONUT_SIZE,
    borderRadius: DONUT_SIZE / 2,
    borderWidth: 26,
    borderColor: theme.colors.surfaceSunk,
    alignItems: 'center',
    justifyContent: 'center',
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
    backgroundColor: theme.colors.surfaceSunk,
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: theme.colors.cardBorder,
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
