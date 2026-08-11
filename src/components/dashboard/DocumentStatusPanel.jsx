import { Text, View } from 'react-native';

import { Panel } from './Panel';
import { DonutPlaceholder } from './ChartPlaceholder';

import { styles } from '@theme/styles/DashboardPanels.styles';

export function DocumentStatusPanel({ data, style }) {
  return (
    <Panel title="Document Status Overview" style={style}>
      <View style={styles.statusRow}>
        <DonutPlaceholder total={data.total} />

        <View style={styles.legend}>
          {data.segments.map((segment) => (
            <View key={segment.key} style={styles.legendRow}>
              <View style={[styles.dot, { backgroundColor: segment.color }]} />
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
