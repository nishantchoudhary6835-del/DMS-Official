import { useRef } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';

import { digitsOnly } from '@utils/format';
import { OTP_LENGTH } from '@validation/auth';

import { styles } from '@theme/styles/OtpInput.styles';

export function OtpInput({
  value,
  onChangeText,
  hasError = false,
  editable = true,
  autoFocus = true,
}) {
  const inputRef = useRef(null);

  const focusInput = () => inputRef.current?.focus();

  const handleChange = (text) => {
    onChangeText(digitsOnly(text).slice(0, OTP_LENGTH));
  };

  const slots = Array.from({ length: OTP_LENGTH }, (_, index) => index);

  return (
    <Pressable onPress={focusInput} style={styles.wrapper}>
      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={handleChange}
        style={styles.hiddenInput}
        keyboardType="number-pad"
        textContentType="oneTimeCode"
        autoComplete="sms-otp"
        maxLength={OTP_LENGTH}
        editable={editable}
        autoFocus={autoFocus}
        autoCorrect={false}
        spellCheck={false}
        accessibilityLabel={`Enter the ${OTP_LENGTH} digit code from your email`}
      />

      <View style={styles.row}>
        {slots.map((index) => {
          const digit = value[index] ?? '';
          const isFilled = Boolean(digit);
          const isActive = index === value.length && editable;

          return (
            <View
              key={index}
              style={[
                styles.box,
                isFilled && styles.boxFilled,
                isActive && styles.boxActive,
                hasError && styles.boxError,
                !editable && styles.boxDisabled,
              ]}
              importantForAccessibility="no"
              accessibilityElementsHidden
            >
              <Text style={styles.digit}>{digit}</Text>
            </View>
          );
        })}
      </View>
    </Pressable>
  );
}
