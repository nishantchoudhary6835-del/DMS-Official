import Ionicons from '@expo/vector-icons/Ionicons';
import { Text, View } from 'react-native';

import { toneOf } from '@theme/tones';

import { Panel } from './Panel';

import { styles } from '@theme/styles/DashboardPanels.styles';

export function ActivityPanel({ entries, style }) {
  return (
    <Panel title="Recent Activity" footerLabel="View all activity" style={style}>
      {entries.map((entry) => {
        const { ink, tint } = toneOf(entry.tone);

        return (
          <View key={entry.key} style={styles.activity}>
            <View style={[styles.activityGlyph, { backgroundColor: tint }]}>
              <Ionicons name={entry.icon} size={13} color={ink} />
            </View>

            <View style={styles.activityCopy}>
              <Text style={styles.activityTitle} numberOfLines={1}>
                {entry.title}
              </Text>
              <Text style={styles.activityDetail} numberOfLines={2}>
                {entry.detail}
              </Text>
            </View>

            <Text style={styles.activityAt}>{entry.at}</Text>
          </View>
        );
      })}
    </Panel>
  );
}
