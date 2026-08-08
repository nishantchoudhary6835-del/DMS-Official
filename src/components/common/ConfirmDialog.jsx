import { Modal, Pressable, Text } from 'react-native';

import { Button } from '@components/common/Button';

import { styles } from '@theme/styles/ConfirmDialog.styles';

export function ConfirmDialog({
  visible,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  confirmVariant = 'primary',
  onConfirm,
  onCancel,
  isBusy = false,
}) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={isBusy ? undefined : onCancel}
    >
      <Pressable
        style={styles.backdrop}
        onPress={isBusy ? undefined : onCancel}
        accessibilityRole="button"
        accessibilityLabel={cancelLabel}
      >
        <Pressable style={styles.sheet} onPress={() => {}}>
          <Text style={styles.title}>{title}</Text>
          {message ? <Text style={styles.message}>{message}</Text> : null}

          <Button
            title={confirmLabel}
            onPress={onConfirm}
            loading={isBusy}
            variant={confirmVariant}
            style={styles.confirm}
          />
          <Button
            title={cancelLabel}
            onPress={onCancel}
            variant="text"
            disabled={isBusy}
          />
        </Pressable>
      </Pressable>
    </Modal>
  );
}
