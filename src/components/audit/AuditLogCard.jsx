import { Pressable, Text, View } from 'react-native';

import { Badge } from '@components/common/Badge';
import { formatDateTime } from '@utils/format';
import {
  auditActionLabel,
  auditActionTone,
  auditModuleLabel,
} from '@validation/audit';

import { styles } from '@theme/styles/AuditLogCard.styles';

// `actorEmail` is denormalised onto the log and survives the User being
// deleted; the populated `actor.email` is preferred as the current address.
function actorLabel(log) {
  return log?.actor?.email || log?.actorEmail || 'Unknown';
}

export function AuditLogCard({ log, onPress }) {
  const timestamp = formatDateTime(log?.createdAt);
  const hasMetadata = Boolean(
    log?.metadata && Object.keys(log.metadata).length > 0
  );

  return (
    <View style={styles.wrap}>
      <Pressable
        onPress={onPress}
        disabled={!onPress}
        accessibilityRole={onPress ? 'button' : undefined}
        style={({ pressed }) => [styles.card, pressed && onPress && styles.pressed]}
      >
        <View style={styles.topRow}>
          <Badge
            label={auditActionLabel(log?.action)}
            tone={auditActionTone(log?.action)}
          />
          <Text style={styles.module}>{auditModuleLabel(log?.module)}</Text>

          {timestamp ? <Text style={styles.time}>{timestamp}</Text> : null}
        </View>

        {log?.description ? (
          <Text style={styles.description} numberOfLines={2}>
            {log.description}
          </Text>
        ) : null}

        <View style={styles.metaRow}>
          <Text style={styles.actor} numberOfLines={1}>
            {actorLabel(log)}
          </Text>

          {log?.targetType ? (
            <Text style={styles.target}>{log.targetType}</Text>
          ) : null}

          {hasMetadata ? <Text style={styles.details}>Details</Text> : null}
        </View>
      </Pressable>
    </View>
  );
}
