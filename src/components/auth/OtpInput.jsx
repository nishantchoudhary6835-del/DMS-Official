import { useEffect, useRef, useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';

import { digitsOnly } from '@utils/format';
import { OTP_LENGTH } from '@validation/auth';

import { styles } from '@theme/styles/OtpInput.styles';

/**
 * How long a freshly typed digit stays legible before it turns into a dot —
 * the same reveal-then-mask a phone keyboard uses for passwords. Long enough
 * to confirm you hit the key you meant, short enough that a finished code is
 * not left sitting on screen.
 */
const REVEAL_MS = 800;

export function OtpInput({
  value,
  onChangeText,
  hasError = false,
  editable = true,
  autoFocus = true,
}) {
  const inputRef = useRef(null);

  // A non-editable input can still take focus on web, which puts a caret in a
  // field that will not accept a keystroke. Refusing the tap outright is what
  // "disabled" should look like.
  const focusInput = () => {
    if (!editable) return;
    inputRef.current?.focus();
  };

  const handleChange = (text) => {
    onChangeText(digitsOnly(text).slice(0, OTP_LENGTH));
  };

  const [revealedIndex, setRevealedIndex] = useState(-1);
  const previousLengthRef = useRef(value.length);

  // Reveals only the digit that just arrived, and only briefly. Shortening
  // the value (backspace, clearing on resend) reveals nothing — there is no
  // new keystroke to confirm, and re-showing an earlier digit would undo the
  // masking that already happened.
  useEffect(() => {
    const previousLength = previousLengthRef.current;
    previousLengthRef.current = value.length;

    if (value.length <= previousLength) {
      setRevealedIndex(-1);
      return undefined;
    }

    setRevealedIndex(value.length - 1);

    const timeout = setTimeout(() => setRevealedIndex(-1), REVEAL_MS);
    return () => clearTimeout(timeout);
  }, [value]);

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
          const isRevealed = isFilled && index === revealedIndex;

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
              {isRevealed ? (
                <Text style={styles.digit}>{digit}</Text>
              ) : isFilled ? (
                <View style={styles.mask} />
              ) : null}
            </View>
          );
        })}
      </View>
    </Pressable>
  );
}
