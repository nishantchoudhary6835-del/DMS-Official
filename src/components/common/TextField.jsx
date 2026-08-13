import Ionicons from '@expo/vector-icons/Ionicons';
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
    icon,
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

  const input = (
    <TextInput
      ref={ref}
      style={icon ? styles.fieldInput : [
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
  );

  return (
    <View style={styles.container}>
      {compact ? null : <Text style={styles.label}>{label}</Text>}

      {/* The icon variant is opt-in and additive — every existing caller
          that doesn't pass `icon` renders the plain bordered input exactly
          as before, unchanged. */}
      {icon ? (
        <View
          style={[
            styles.fieldRow,
            isFocused && styles.fieldRowFocused,
            hasError && styles.fieldRowError,
            !editable && styles.fieldRowDisabled,
          ]}
        >
          <Ionicons
            name={icon}
            size={16}
            color={hasError ? theme.colors.danger : theme.colors.textMuted}
            style={styles.fieldIcon}
          />
          {input}
        </View>
      ) : (
        input
      )}

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
