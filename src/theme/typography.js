import { fonts } from './fonts';

/**
 * Bureau type scale.
 *
 * fontFamily carries the weight (see fonts.js) — do not add fontWeight to
 * these, it is ignored on native and double-bolds on web.
 */
export const typography = {
  // Instrument Serif. Dashboard figures and the Login hero. Nothing else.
  display: {
    fontFamily: fonts.serif,
    fontSize: 44,
    lineHeight: 48,
    letterSpacing: -0.8,
  },
  displaySm: {
    fontFamily: fonts.serif,
    fontSize: 30,
    lineHeight: 34,
    letterSpacing: -0.4,
  },

  h1: {
    fontFamily: fonts.sansBold,
    fontSize: 26,
    lineHeight: 32,
    letterSpacing: -0.5,
  },
  h2: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 21,
    lineHeight: 27,
    letterSpacing: -0.3,
  },
  h3: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 17,
    lineHeight: 23,
    letterSpacing: -0.2,
  },

  body: { fontFamily: fonts.sans, fontSize: 15, lineHeight: 22 },
  bodyBold: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 15,
    lineHeight: 22,
    letterSpacing: -0.1,
  },
  caption: { fontFamily: fonts.sans, fontSize: 13, lineHeight: 18 },
  small: { fontFamily: fonts.sans, fontSize: 11, lineHeight: 15 },

  label: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 13,
    lineHeight: 18,
    letterSpacing: -0.1,
  },
  button: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 15,
    lineHeight: 20,
    letterSpacing: -0.1,
  },

  /** Uppercase section headers. Tracking is doing the work here, not size. */
  overline: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 10,
    lineHeight: 14,
    letterSpacing: 1.1,
    textTransform: 'uppercase',
  },

  /** Employee IDs, reference codes, timestamps. */
  mono: { fontFamily: fonts.mono, fontSize: 12, lineHeight: 17 },
  monoSmall: { fontFamily: fonts.mono, fontSize: 10.5, lineHeight: 15 },

  otpDigit: {
    fontFamily: fonts.monoMedium,
    fontSize: 21,
    lineHeight: 28,
    textAlign: 'center',
  },
};
