import { useMemo } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { styles } from '@theme/styles/Screen.styles';

export function Screen({
  children,
  scrollable = true,
  dismissKeyboardOnTap = true,
  style,
  padded = true,
  background = 'default',
}) {
  const contentStyle = useMemo(
    () => [
      scrollable ? styles.content : styles.contentFixed,
      padded && styles.padded,
      style,
    ],
    [scrollable, padded, style]
  );

  const tapToDismiss = dismissKeyboardOnTap && Platform.OS !== 'web';

  const keyboardBehavior = Platform.select({
    ios: 'padding',
    android: 'height',
    default: undefined,
  });

  const body = scrollable ? (
    <ScrollView
      style={styles.flex}
      contentContainerStyle={contentStyle}
      keyboardShouldPersistTaps="handled"
    >
      {children}
    </ScrollView>
  ) : (
    <View style={contentStyle}>{children}</View>
  );

  return (
    <SafeAreaView
      style={[styles.safe, background === 'canvas' && styles.safeCanvas]}
      edges={['top', 'bottom']}
    >
      <KeyboardAvoidingView style={styles.flex} behavior={keyboardBehavior}>
        {tapToDismiss ? (
          <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            <View style={styles.flex}>{body}</View>
          </TouchableWithoutFeedback>
        ) : (
          body
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
