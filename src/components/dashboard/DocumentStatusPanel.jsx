import { Text, View } from 'react-native';

import { toneOf } from '@theme/tones';

import { Panel } from './Panel';
import { DonutPlaceholder } from './ChartPlaceholder';

import { styles } from '@theme/styles/DashboardPanels.styles';

export function DocumentStatusPanel({ title, data, style }) {
  return (
    <Panel title={title} style={style}>
      <View style={styles.statusRow}>
        <DonutPlaceholder total={data.total} segments={data.segments} />

        <View style={styles.legend}>
          {data.segments.map((segment) => (
            <View key={segment.key} style={styles.legendRow}>
              <View style={[styles.dot, { backgroundColor: toneOf(segment.tone).ink }]} />
              <Text style={styles.legendLabel} numberOfLines={1}>
                {segment.label}
              </Text>
              <Text style={styles.legendValue}>
                {segment.count} ({segment.share})
              </Text>
            </View>
          ))}
        </View>
      </View>
    </Panel>
  );
}
