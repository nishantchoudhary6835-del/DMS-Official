import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View } from 'react-native';

import { ScreenBackground } from '@components/layout/ScreenBackground';
import { RootNavigator } from '@navigation/RootNavigator';
import { AppProviders } from '@providers/AppProviders';
import { colors, fontAssets } from '@theme';

import { styles } from '@theme/styles/App.styles';

/**
 * React Navigation paints its own background behind every screen, which
 * would sit on top of the painted canvas. Making it transparent lets the
 * canvas show through and stay put while screens slide over it.
 */
const navigationTheme = {
  ...DefaultTheme,
  colors: { ...DefaultTheme.colors, background: 'transparent' },
};

export default function App() {
  const [fontsLoaded, fontError] = useFonts(fontAssets);

  // Hold the first paint until the typefaces are in memory, otherwise the
  // app flashes in the system font and reflows. If a font fails to load we
  // carry on rather than trapping the user on a spinner — React Native
  // falls back to the system face for that family.
  if (!fontsLoaded && !fontError) {
    return (
      <View style={styles.booting}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <AppProviders>
      <View style={styles.root}>
        {/* Rendered once for the whole app rather than per screen. */}
        <ScreenBackground />

        <NavigationContainer theme={navigationTheme}>
          <StatusBar style="dark" />
          <RootNavigator />
        </NavigationContainer>
      </View>
    </AppProviders>
  );
}
