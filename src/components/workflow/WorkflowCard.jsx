import Ionicons from '@expo/vector-icons/Ionicons';
import { useRef } from 'react';
import { Animated, Platform, Pressable, Text, View } from 'react-native';

import { Badge } from '@components/common/Badge';
import { theme } from '@theme';
import { formatDateTime } from '@utils/format';
import {
  documentRefLabel,
  employeeRefLabel,
  workflowLevelLabel,
  workflowStatusLabel,
} from '@validation/workflow';

import { styles } from '@theme/styles/WorkflowCard.styles';

const USE_NATIVE_DRIVER = Platform.OS !== 'web';

// Shared by Pending Approvals and My Submissions, which populate opposite
// sides of the record — so the secondary line renders whichever arrived.
export function WorkflowCard({ workflow, onPress }) {
  const title = documentRefLabel(workflow.document) ?? 'Untitled document';
  const level = workflowLevelLabel(workflow.currentLevel);
  const status = workflowStatusLabel(workflow.status);

  const reviewer = employeeRefLabel(workflow.currentReviewer);
  const owner = employeeRefLabel(workflow.owner ?? workflow.document?.owner);

  const secondary = owner
    ? `Submitted by ${owner}`
    : reviewer
    ? `With ${reviewer}`
    : null;

  const scale = useRef(new Animated.Value(1)).current;

  const press = (toValue) => {
    Animated.spring(scale, {
      toValue,
      speed: 44,
      bounciness: 0,
      useNativeDriver: USE_NATIVE_DRIVER,
    }).start();
  };

  return (
    <Animated.View style={[styles.wrap, { transform: [{ scale }] }]}>
      <Pressable
        onPress={onPress}
        onPressIn={() => onPress && press(0.985)}
        onPressOut={() => press(1)}
        disabled={!onPress}
        accessibilityRole={onPress ? 'button' : undefined}
        style={({ pressed }) => [styles.card, pressed && onPress && styles.pressed]}
      >
        <View style={styles.body}>
          <View style={styles.glyph}>
            <Ionicons
              name="document-text-outline"
              size={18}
              color={theme.colors.info}
            />
          </View>

          <View style={styles.details}>
            <View style={styles.topRow}>
              <Text style={styles.name} numberOfLines={2}>
                {title}
              </Text>
              <Badge label={status || '—'} tone="info" />
            </View>

            <Text style={secondary ? styles.meta : styles.metaEmpty} numberOfLines={1}>
              {secondary ?? (level ? `Waiting on ${level}` : 'Reviewer not yet known')}
            </Text>

            {level && secondary ? (
              <Text style={styles.dateMeta} numberOfLines={1}>
                {level}
                {workflow.submittedAt ? ` · Submitted ${formatDateTime(workflow.submittedAt)}` : ''}
              </Text>
            ) : workflow.submittedAt ? (
              <Text style={styles.dateMeta} numberOfLines={1}>
                Submitted {formatDateTime(workflow.submittedAt)}
              </Text>
            ) : null}
          </View>

          {onPress ? (
            <Ionicons
              name="chevron-forward"
              size={15}
              color={theme.colors.textMuted}
              style={styles.chevron}
            />
          ) : null}
        </View>
      </Pressable>
    </Animated.View>
  );
}
