import Ionicons from '@expo/vector-icons/Ionicons';
import { useRef } from 'react';
import { Animated, Platform, Pressable, Text, View } from 'react-native';

import { Badge } from '@components/common/Badge';
import { theme } from '@theme';
import { formatDate } from '@utils/format';
import { documentStatusLabel, documentStatusTone } from '@validation/document';
import { employeeRefLabel } from '@validation/workflow';

import { styles } from '@theme/styles/WorkflowCard.styles';

const USE_NATIVE_DRIVER = Platform.OS !== 'web';

// The same card shell as WorkflowCard (shares its styles) but for a raw
// Document: no `document.document` wrapper, no reviewer, no workflow status.
export function DocumentCard({ document, onPress }) {
  const title = document?.title || 'Untitled document';
  const status = documentStatusLabel(document?.status);
  const owner = employeeRefLabel(document?.owner);

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
              <Badge label={status || '—'} tone={documentStatusTone(document?.status)} />
            </View>

            <Text style={owner ? styles.meta : styles.metaEmpty} numberOfLines={1}>
              {owner ? `Owned by ${owner}` : 'Owner not known'}
            </Text>

            {document?.updatedAt ? (
              <Text style={styles.dateMeta} numberOfLines={1}>
                Updated {formatDate(document.updatedAt)}
                {document.currentVersion ? ` · ${document.currentVersion}` : ''}
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
