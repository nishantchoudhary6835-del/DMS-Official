import { useWindowDimensions } from 'react-native';

/**
 * Width thresholds, named for what changes at each rather than for a device.
 *
 * `md` is where the sidebar stops being affordable as a permanent fixture:
 * below 900px a 260px rail leaves too little for a content column, so it
 * becomes an overlay drawer instead.
 */
export const BREAKPOINTS = {
  sm: 600,
  md: 900,
  lg: 1200,
};

export function useBreakpoint() {
  const { width } = useWindowDimensions();

  return {
    width,
    /** Sidebar is an overlay drawer rather than a permanent rail. */
    isCompact: width < BREAKPOINTS.md,
    isPhone: width < BREAKPOINTS.sm,
    /** Columns for the two three-up panel rows. */
    columns: width >= BREAKPOINTS.lg ? 3 : width >= BREAKPOINTS.md ? 2 : 1,
    /** Columns for the KPI row, which tolerates being denser. */
    statColumns: width >= BREAKPOINTS.lg ? 4 : width >= BREAKPOINTS.sm ? 2 : 1,
  };
}
