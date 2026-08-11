import { colors } from './colors';

/**
 * Ink and tint pairs for tone-coded glyphs, spines and figures.
 *
 * `ink` is safe on a light ground for text and icons; `tint` is the wash
 * behind them. Kept as pairs so a caller can never put ink on the wrong tint.
 */
export const TONES = {
  primary: { ink: colors.primary, tint: colors.primaryLight },
  accent: { ink: colors.accent, tint: colors.accentLight },
  success: { ink: colors.success, tint: colors.successLight },
  info: { ink: colors.info, tint: colors.infoLight },
  neutral: { ink: colors.textSecondary, tint: colors.surfaceSunk },
};

export function toneOf(name) {
  return TONES[name] ?? TONES.neutral;
}
