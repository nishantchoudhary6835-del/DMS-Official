import { Modal, Pressable, ScrollView, Text, View } from 'react-native';

import { Badge } from '@components/common/Badge';
import { Button } from '@components/common/Button';
import { formatDateTime } from '@utils/format';
import {
  auditActionLabel,
  auditActionTone,
  auditModuleLabel,
} from '@validation/audit';

import { styles } from '@theme/styles/AuditLogDetailsDialog.styles';

function Row({ label, value }) {
  if (value === null || value === undefined || value === '') return null;

  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue} selectable>
        {String(value)}
      </Text>
    </View>
  );
}

// §24: metadata is dynamic and new event types add new keys, so this renders
// whatever is present. Nested values are stringified, not rendered recursively.
function metadataEntries(metadata) {
  if (!metadata || typeof metadata !== 'object') return [];

  return Object.entries(metadata).map(([key, value]) => {
    const isPrimitive =
      value === null || ['string', 'number', 'boolean'].includes(typeof value);

    return {
      key,
      label: key
        .replace(/([a-z])([A-Z])/g, '$1 $2')
        .replace(/^./, (character) => character.toUpperCase()),
      value: isPrimitive ? String(value ?? '—') : JSON.stringify(value),
    };
  });
}

export function AuditLogDetailsDialog({ log, onClose }) {
  const entries = metadataEntries(log?.metadata);

  return (
    <Modal
      visible={Boolean(log)}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        {/* Swallows the press so tapping inside the sheet doesn't close it. */}
        <Pressable style={styles.sheet} onPress={() => {}}>
          <View style={styles.header}>
            <Badge
              label={auditActionLabel(log?.action)}
              tone={auditActionTone(log?.action)}
            />
            <Text style={styles.module}>{auditModuleLabel(log?.module)}</Text>
          </View>

          {log?.description ? (
            <Text style={styles.description}>{log.description}</Text>
          ) : null}

          <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}>
            <Row label="When" value={formatDateTime(log?.createdAt)} />
            <Row label="Actor" value={log?.actor?.email || log?.actorEmail} />
            <Row label="Action" value={log?.action} />
            <Row label="Module" value={log?.module} />
            <Row label="Target type" value={log?.targetType} />
            <Row label="Target ID" value={log?.targetId} />
            <Row label="IP address" value={log?.ipAddress} />
            <Row label="User agent" value={log?.userAgent} />
            <Row label="Log ID" value={log?._id} />

            {entries.length ? (
              <>
                <Text style={styles.sectionLabel}>Details</Text>
                {entries.map((entry) => (
                  <Row key={entry.key} label={entry.label} value={entry.value} />
                ))}
              </>
            ) : (
              <Text style={styles.noMetadata}>
                This event recorded no extra details.
              </Text>
            )}
          </ScrollView>

          <Button title="Close" onPress={onClose} variant="secondary" />
        </Pressable>
      </Pressable>
    </Modal>
  );
}
