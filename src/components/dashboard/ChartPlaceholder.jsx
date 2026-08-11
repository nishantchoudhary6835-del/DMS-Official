import { Text, View } from 'react-native';

import { styles } from '@theme/styles/ChartPlaceholder.styles';

/**
 * Stand-ins for the two charts.
 *
 * These hold the real footprint and the real labels but draw no data series —
 * the ring is undivided and the bars are unfilled grey. Swapping either for a
 * real chart later is a change to this file alone; nothing above it knows the
 * difference.
 */

const PLOT_HEIGHT = 140;

export function DonutPlaceholder({ total, caption = 'Total' }) {
  return (
    <View style={styles.donutWrap}>
      <View style={styles.donut}>
        <Text style={styles.donutTotal}>{total}</Text>
        <Text style={styles.donutCaption}>{caption}</Text>
      </View>
    </View>
  );
}

export function BarsPlaceholder({ series }) {
  const max = series.reduce((peak, item) => Math.max(peak, item.value), 0) || 1;

  return (
    <View style={styles.barsWrap}>
      <View style={styles.plot}>
        {series.map((item) => (
          <View key={item.key} style={styles.column}>
            <Text style={styles.barValue}>{item.value}</Text>
            <View
              style={[
                styles.bar,
                { height: Math.max(4, Math.round((item.value / max) * PLOT_HEIGHT)) },
              ]}
            />
          </View>
        ))}
      </View>

      <View style={styles.axis}>
        {series.map((item) => (
          <Text key={item.key} style={styles.axisLabel} numberOfLines={1}>
            {item.label}
          </Text>
        ))}
      </View>
    </View>
  );
}
