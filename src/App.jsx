import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';

import { ScreenBackground } from '@components/layout/ScreenBackground';
import { RootNavigator } from '@navigation/RootNavigator';
import { AppProviders } from '@providers/AppProviders';
import { colors, fontAssets } from '@theme';
import { installPersistentScrollbars } from '@utils/webScrollbars';

import { styles } from '@theme/styles/App.styles';

// React Navigation paints its own background behind every screen, which would
// cover the painted canvas. Transparent lets the canvas show through and stay.
const navigationTheme = {
  ...DefaultTheme,
  colors: { ...DefaultTheme.colors, background: 'transparent' },
};

export default function App() {
  const [fontsLoaded, fontError] = useFonts(fontAssets);

  useEffect(() => {
    installPersistentScrollbars();
  }, []);

  // Hold the first paint until the typefaces are in memory, or the app flashes
  // in the system font and reflows. A font failure carries on rather than traps.
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
