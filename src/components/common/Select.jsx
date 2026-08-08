import { useState } from 'react';
import { FlatList, Modal, Pressable, Text, View } from 'react-native';

import { styles } from '@theme/styles/Select.styles';

export function Select({
  label,
  value,
  options,
  onChange,
  placeholder = 'Select an option',
  error,
  helper,
  disabled = false,
  allowClear = false,
}) {
  const [isOpen, setIsOpen] = useState(false);

  const hasError = Boolean(error);
  const selected = options.find((option) => option.value === value);

  const choose = (optionValue) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>

      <Pressable
        onPress={() => setIsOpen(true)}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{ disabled, expanded: isOpen }}
        style={[
          styles.field,
          hasError && styles.fieldError,
          disabled && styles.fieldDisabled,
        ]}
      >
        <Text
          style={[styles.value, !selected && styles.placeholder]}
          numberOfLines={1}
        >
          {selected ? selected.label : placeholder}
        </Text>
        <Text style={styles.chevron}>{isOpen ? '▴' : '▾'}</Text>
      </Pressable>

      <Text
        style={[styles.message, hasError ? styles.errorText : styles.helperText]}
        numberOfLines={2}
      >
        {error || helper || ''}
      </Text>

      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <Pressable style={styles.backdrop} onPress={() => setIsOpen(false)}>
          <Pressable style={styles.sheet} onPress={() => {}}>
            <Text style={styles.sheetTitle}>{label}</Text>

            <FlatList
              data={options}
              keyExtractor={(option) => String(option.value)}
              style={styles.sheetList}
              renderItem={({ item }) => {
                const isSelected = item.value === value;
                return (
                  <Pressable
                    onPress={() => choose(item.value)}
                    style={({ pressed }) => [
                      styles.option,
                      isSelected && styles.optionSelected,
                      pressed && styles.optionPressed,
                    ]}
                  >
                    <View style={styles.optionTextWrap}>
                      <Text
                        style={[
                          styles.optionLabel,
                          isSelected && styles.optionLabelSelected,
                        ]}
                      >
                        {item.label}
                      </Text>
                      {item.hint ? (
                        <Text style={styles.optionHint}>{item.hint}</Text>
                      ) : null}
                    </View>
                    {isSelected ? <Text style={styles.tick}>✓</Text> : null}
                  </Pressable>
                );
              }}
            />

            {allowClear && value ? (
              <Pressable onPress={() => choose(null)} style={styles.clear}>
                <Text style={styles.clearLabel}>Clear selection</Text>
              </Pressable>
            ) : null}
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
