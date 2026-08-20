import { useWindowDimensions } from 'react-native';

// Width thresholds, named for what changes at each rather than for a device.
// Below `md` a 260px rail leaves too little content column, so it goes drawer.
const BREAKPOINTS = {
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
    /** Columns for the two three-up panel rows. */
    columns: width >= BREAKPOINTS.lg ? 3 : width >= BREAKPOINTS.md ? 2 : 1,
    /** Columns for the KPI row, which tolerates being denser. */
    statColumns: width >= BREAKPOINTS.lg ? 4 : width >= BREAKPOINTS.sm ? 2 : 1,
  };
}
