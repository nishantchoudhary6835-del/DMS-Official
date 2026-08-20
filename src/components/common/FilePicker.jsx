import Ionicons from '@expo/vector-icons/Ionicons';
import * as DocumentPicker from 'expo-document-picker';
import { Pressable, Text, View } from 'react-native';

import { theme } from '@theme';
import { ACCEPTED_FILE_TYPES } from '@validation/document';

import { styles } from '@theme/styles/FilePicker.styles';

function formatBytes(bytes) {
  if (typeof bytes !== 'number' || Number.isNaN(bytes)) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// A single-file picker matching TextField/Select's language. `value` is the
// asset expo-document-picker returned (or null); `onChange` gets the same back.
export function FilePicker({ label, value, onChange, error, helper, disabled = false }) {
  const hasError = Boolean(error);
  const message = error || helper || '';

  const pick = async () => {
    if (disabled) return;

    const result = await DocumentPicker.getDocumentAsync({
      type: ACCEPTED_FILE_TYPES,
      copyToCacheDirectory: true,
      multiple: false,
    });

    if (result.canceled) return;

    onChange(result.assets?.[0] ?? null);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>

      <Pressable
        onPress={pick}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={label}
        style={[styles.field, hasError && styles.fieldError, disabled && styles.fieldDisabled]}
      >
        <Ionicons
          name={value ? 'document-attach' : 'cloud-upload-outline'}
          size={18}
          color={disabled ? theme.colors.disabled : theme.colors.textSecondary}
        />

        <View style={styles.textWrap}>
          <Text style={[styles.value, !value && styles.placeholder]} numberOfLines={1}>
            {value ? value.name : 'Choose a PDF or Word file'}
          </Text>
          {value ? (
            <Text style={styles.size} numberOfLines={1}>
              {formatBytes(value.size)}
            </Text>
          ) : null}
        </View>

        <Text style={styles.action}>{value ? 'Change' : 'Browse'}</Text>
      </Pressable>

      <Text
        style={[styles.message, hasError ? styles.errorText : styles.helperText]}
        numberOfLines={2}
      >
        {message}
      </Text>
    </View>
  );
}
