/**
 * Bureau palette.
 *
 * Crimson is structural, not decorative — it appears as spines, underlines
 * and focus rings, and as a fill only on the primary button. Semantic
 * colour (success / warning / danger) is kept separate from the brand
 * accent so status never competes with navigation.
 *
 * Amber is deepened from the logo's #E8A020 to #B87A0C for anything
 * bearing text; #E8A020 itself only survives on dark or gradient grounds,
 * where it lives as accentBright.
 */
export const colors = {
  primary: '#A81E24',
  primaryDark: '#8A181D',
  primaryLight: '#F6EAEA',

  accent: '#B87A0C',
  accentLight: '#FBF3E3',
  accentBright: '#E8A020',

  danger: '#C1121F',
  dangerDark: '#9A0E19',
  dangerLight: '#FBEAEB',
  success: '#2E6B3F',
  successLight: '#E7F2E9',
  warning: '#B87A0C',
  info: '#43708F',
  infoLight: '#E9F0F5',

  background: '#FFFFFF',
  canvas: '#F7F7F5',
  card: '#FFFFFF',
  cardBorder: '#E3E2DE',
  surface: '#FAFAF9',
  surfaceSunk: '#F1F0EC',
  border: '#DDDCD7',
  borderFocus: '#A81E24',

  textPrimary: '#1A1A18',
  textSecondary: '#5C5A54',
  textMuted: '#8A8880',
  textOnPrimary: '#FFFFFF',

  disabled: '#D6D5D0',
  overlay: 'rgba(26, 26, 24, 0.45)',
  shadow: '#1A1A18',
  transparent: 'transparent',

  /** Left-edge severity bars on tiles and rows. */
  spine: {
    primary: '#A81E24',
    accent: '#B87A0C',
    neutral: '#C9C7C2',
    info: '#6E8FA8',
    success: '#2E6B3F',
  },

  /**
   * Signal treatment — Login and Dashboard headers only. Used with
   * expo-linear-gradient; every other screen stays flat.
   */
  gradient: {
    brand: ['#A81E24', '#C4571F', '#E8A020'],
    onGradient: '#FFFFFF',
    onGradientMuted: 'rgba(255, 255, 255, 0.78)',
    hairline: 'rgba(255, 255, 255, 0.22)',
  },
};
