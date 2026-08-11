import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, Text, View } from 'react-native';

import { theme } from '@theme';
import { toneOf } from '@theme/tones';

import { Panel } from './Panel';

import { styles } from '@theme/styles/DashboardPanels.styles';

export function QuickActionsPanel({ actions, style }) {
  return (
    <Panel title="Quick Actions" style={style}>
      {actions.map((action) => {
        const { ink, tint } = toneOf(action.tone);

        return (
          <Pressable
            key={action.key}
            accessibilityRole="button"
            style={({ pressed, hovered }) => [
              styles.action,
              hovered && styles.actionHovered,
              pressed && styles.actionHovered,
            ]}
          >
            <View style={[styles.actionGlyph, { backgroundColor: tint }]}>
              <Ionicons name={action.icon} size={15} color={ink} />
            </View>

            <Text style={styles.actionLabel} numberOfLines={1}>
              {action.label}
            </Text>

            <Ionicons
              name="chevron-forward"
              size={14}
              color={theme.colors.textMuted}
            />
          </Pressable>
        );
      })}
    </Panel>
  );
}
