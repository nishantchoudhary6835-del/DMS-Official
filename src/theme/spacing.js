export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
};

/**
 * Bureau runs tight — 5px on cards, near-square on chips and inputs.
 * `hero` is reserved for the Signal blocks on Login and Dashboard.
 */
export const radius = {
  xs: 3,
  sm: 4,
  md: 5,
  lg: 7,
  xl: 10,
  hero: 16,
  full: 999,
};

/**
 * Three tiers instead of one, so an interactive surface can be told apart
 * from a static one. Bureau leans on the 1px border for definition and
 * uses `card` only to lift the surface off the canvas.
 */
export const elevation = {
  card: {
    shadowColor: '#1A1A18',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },

  raised: {
    shadowColor: '#1A1A18',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 6,
  },

  hero: {
    shadowColor: '#6E1418',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.24,
    shadowRadius: 24,
    elevation: 10,
  },
};

/** Left-edge severity bar. Pair with colors.spine.*. */
export const spine = {
  width: 3,
};
