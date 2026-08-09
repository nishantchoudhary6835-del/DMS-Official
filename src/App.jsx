import { NavigationContainer } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View } from 'react-native';

import { RootNavigator } from '@navigation/RootNavigator';
import { AppProviders } from '@providers/AppProviders';
import { colors, fontAssets } from '@theme';

export default function App() {
  const [fontsLoaded, fontError] = useFonts(fontAssets);

  // Hold the first paint until the typefaces are in memory, otherwise the
  // app flashes in the system font and reflows. If a font fails to load we
  // carry on rather than trapping the user on a spinner — React Native
  // falls back to the system face for that family.
  if (!fontsLoaded && !fontError) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: colors.canvas,
        }}
      >
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <AppProviders>
      <NavigationContainer>
        <StatusBar style="dark" />
        <RootNavigator />
      </NavigationContainer>
    </AppProviders>
  );
}
