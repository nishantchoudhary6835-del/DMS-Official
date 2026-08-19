import { Pressable, Text, View } from 'react-native';

import { Badge } from '@components/common/Badge';
import { formatDateTime } from '@utils/format';
import {
  auditActionLabel,
  auditActionTone,
  auditModuleLabel,
} from '@validation/audit';

import { styles } from '@theme/styles/AuditLogCard.styles';

/**
 * `actorEmail` is denormalised onto the log itself, which matters: it is the
 * only actor detail that survives if the User record is later deleted. The
 * populated `actor.email` is preferred when present because it reflects the
 * account's current address, but this falls back rather than showing nothing.
 *
 * Note `actor.employeeId` is the Employee's ObjectId, not the readable
 * "EMP-001" code — audit.service.js populates the User, whose `employeeId` is
 * a reference. There is no human-readable employee code on an audit log.
 */
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
