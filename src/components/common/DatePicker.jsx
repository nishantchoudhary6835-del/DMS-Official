import Ionicons from '@expo/vector-icons/Ionicons';
import { useEffect, useState } from 'react';
import { Modal, Pressable, Text, View } from 'react-native';

import { theme } from '@theme';

import { styles } from '@theme/styles/DatePicker.styles';

const WEEKDAY_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function pad(n) {
  return String(n).padStart(2, '0');
}

// Local-date formatting — toISOString() shifts to UTC and can land on the
// wrong day for anyone west of Greenwich.
function formatDateString(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function parseDateString(value) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return Number.isNaN(date.getTime()) ? null : date;
}

// 6 weeks x 7 days, padded with the adjoining months so the grid is always
// a full rectangle.
function buildMonthGrid(year, month) {
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const cells = [];
  for (let i = firstWeekday - 1; i >= 0; i--) {
    cells.push({ date: new Date(year, month - 1, daysInPrevMonth - i), inMonth: false });
  }
  for (let day = 1; day <= daysInMonth; day++) {
    cells.push({ date: new Date(year, month, day), inMonth: true });
  }
  let trailing = 1;
  while (cells.length < 42) {
    cells.push({ date: new Date(year, month + 1, trailing), inMonth: false });
    trailing += 1;
  }

  const weeks = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}

export function DatePicker({
  label,
  value,
  onChange,
  placeholder = 'Select date',
  error,
  helper,
  disabled = false,
  minDate,
  maxDate,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [viewedMonth, setViewedMonth] = useState(() => parseDateString(value) ?? new Date());

  // Re-centre on the selected month every time the picker opens, so a
  // reopen doesn't strand the user on whatever month they last browsed to.
  useEffect(() => {
    if (!isOpen) return;
    setViewedMonth(parseDateString(value) ?? new Date());
  }, [isOpen, value]);

  const hasError = Boolean(error);
  const today = new Date();
  const todayString = formatDateString(today);

  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);

  const choose = (date) => {
    onChange(formatDateString(date));
    close();
  };

  const clear = () => {
    onChange(null);
    close();
  };

  const goToPrevMonth = () =>
    setViewedMonth((current) => new Date(current.getFullYear(), current.getMonth() - 1, 1));
  const goToNextMonth = () =>
    setViewedMonth((current) => new Date(current.getFullYear(), current.getMonth() + 1, 1));

  const weeks = buildMonthGrid(viewedMonth.getFullYear(), viewedMonth.getMonth());

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>

      <Pressable
        onPress={open}
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
        <Text style={[styles.value, !value && styles.placeholder]} numberOfLines={1}>
          {value || placeholder}
        </Text>
        <Ionicons
          name="calendar-outline"
          size={16}
          color={disabled ? theme.colors.disabled : theme.colors.textMuted}
        />
      </Pressable>

      <Text
        style={[styles.message, hasError ? styles.errorText : styles.helperText]}
        numberOfLines={2}
      >
        {error || helper || ''}
      </Text>

      <Modal visible={isOpen} transparent animationType="fade" onRequestClose={close}>
        <Pressable style={styles.backdrop} onPress={close}>
          <Pressable style={styles.sheet} onPress={() => {}}>
            <View style={styles.monthRow}>
              <Pressable
                onPress={goToPrevMonth}
                accessibilityRole="button"
                accessibilityLabel="Previous month"
                style={({ pressed }) => [
                  styles.monthNavButton,
                  pressed && styles.monthNavButtonPressed,
                ]}
              >
                <Ionicons name="chevron-back" size={18} color={theme.colors.textPrimary} />
              </Pressable>

              <Text style={styles.monthLabel}>
                {MONTH_NAMES[viewedMonth.getMonth()]} {viewedMonth.getFullYear()}
              </Text>

              <Pressable
                onPress={goToNextMonth}
                accessibilityRole="button"
                accessibilityLabel="Next month"
                style={({ pressed }) => [
                  styles.monthNavButton,
                  pressed && styles.monthNavButtonPressed,
                ]}
              >
                <Ionicons name="chevron-forward" size={18} color={theme.colors.textPrimary} />
              </Pressable>
            </View>

            <View style={styles.weekRow}>
              {WEEKDAY_LABELS.map((weekday, index) => (
                <View key={`${weekday}-${index}`} style={styles.weekdayCell}>
                  <Text style={styles.weekdayLabel}>{weekday}</Text>
                </View>
              ))}
            </View>

            {weeks.map((week, weekIndex) => (
              <View key={weekIndex} style={styles.weekGrid}>
                {week.map(({ date, inMonth }) => {
                  const dateString = formatDateString(date);
                  const isSelected = dateString === value;
                  const isToday = dateString === todayString;
                  const isOutOfRange =
                    (minDate && dateString < minDate) || (maxDate && dateString > maxDate);
                  const isDisabled = !inMonth || isOutOfRange;

                  return (
                    <Pressable
                      key={dateString}
                      onPress={() => choose(date)}
                      disabled={isDisabled}
                      style={({ pressed }) => [
                        styles.dayCell,
                        isSelected && styles.dayCellSelected,
                        !isSelected && isToday && inMonth && styles.dayCellToday,
                        pressed && !isDisabled && styles.dayCellPressed,
                        isOutOfRange && inMonth && styles.dayCellDisabled,
                      ]}
                    >
                      <Text
                        style={[
                          styles.dayText,
                          isSelected && styles.dayTextSelected,
                          !inMonth && styles.dayTextOutside,
                        ]}
                      >
                        {date.getDate()}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            ))}

            {value ? (
              <Pressable onPress={clear} style={styles.clear}>
                <Text style={styles.clearLabel}>Clear date</Text>
              </Pressable>
            ) : null}
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
