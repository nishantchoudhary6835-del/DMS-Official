// Imported by exact file, not each package's index: the index require()s every
// weight, which Metro cannot tree-shake — 18 Public Sans faces instead of 4.
const PublicSans_400Regular = require('@expo-google-fonts/public-sans/400Regular/PublicSans_400Regular.ttf');
const PublicSans_500Medium = require('@expo-google-fonts/public-sans/500Medium/PublicSans_500Medium.ttf');
const PublicSans_600SemiBold = require('@expo-google-fonts/public-sans/600SemiBold/PublicSans_600SemiBold.ttf');
const PublicSans_700Bold = require('@expo-google-fonts/public-sans/700Bold/PublicSans_700Bold.ttf');
const InstrumentSerif_400Regular = require('@expo-google-fonts/instrument-serif/400Regular/InstrumentSerif_400Regular.ttf');
const IBMPlexMono_400Regular = require('@expo-google-fonts/ibm-plex-mono/400Regular/IBMPlexMono_400Regular.ttf');
const IBMPlexMono_500Medium = require('@expo-google-fonts/ibm-plex-mono/500Medium/IBMPlexMono_500Medium.ttf');

// React Native does not synthesise weights for custom fonts, so every weight is
// its own family and typography.js sets fontFamily rather than fontWeight.
export const fonts = {
  // Public Sans — the interface face. Drawn for civic and enterprise UI,
  // so it holds up at 11px in a table and at 26px in a title.
  sans: 'PublicSans_400Regular',
  sansMedium: 'PublicSans_500Medium',
  sansSemiBold: 'PublicSans_600SemiBold',
  sansBold: 'PublicSans_700Bold',

  // Instrument Serif — dashboard figures and the Login hero only.
  serif: 'InstrumentSerif_400Regular',

  // IBM Plex Mono — employee IDs, OTP digits, timestamps. Anything that is
  // a code rather than a word.
  mono: 'IBMPlexMono_400Regular',
  monoMedium: 'IBMPlexMono_500Medium',
};

/** Passed straight to useFonts() in App.jsx. */
export const fontAssets = {
  PublicSans_400Regular,
  PublicSans_500Medium,
  PublicSans_600SemiBold,
  PublicSans_700Bold,
  InstrumentSerif_400Regular,
  IBMPlexMono_400Regular,
  IBMPlexMono_500Medium,
};
