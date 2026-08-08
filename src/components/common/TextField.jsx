import { forwardRef, useState } from 'react';
import { Text, TextInput, View } from 'react-native';

import { theme } from '@theme';

import { styles } from '@theme/styles/TextField.styles';

export const TextField = forwardRef(function TextField(
  {
    label,
    value,
    onChangeText,
    error,
    helper,
    placeholder,
    secureTextEntry = false,
    editable = true,
    compact = false,
    ...inputProps
  },
  ref
) {
  const [isFocused, setIsFocused] = useState(false);

  const hasError = Boolean(error);
  const message = error || helper || '';

  return (
    <View style={styles.container}>
      {compact ? null : <Text style={styles.label}>{label}</Text>}

      <TextInput
        ref={ref}
        style={[
          styles.input,
          isFocused && styles.inputFocused,
          hasError && styles.inputError,
          !editable && styles.inputDisabled,
        ]}
        value={value}
        onChangeText={onChangeText}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.textMuted}
        secureTextEntry={secureTextEntry}
        editable={editable}
        accessibilityLabel={label}
        accessibilityHint={hasError ? error : helper}
        {...inputProps}
      />

      {compact && !message ? null : (
        <Text
          style={[
            styles.message,
            hasError ? styles.errorText : styles.helperText,
          ]}
          numberOfLines={2}
        >
          {message}
        </Text>
      )}
    </View>
  );
});
