import { Text, View } from 'react-native';

import { toneOf } from '@theme/tones';

import { styles } from '@theme/styles/ChartPlaceholder.styles';

const PLOT_HEIGHT = 140;

/**
 * A proportional stacked bar rather than a literal ring — React Native has
 * no built-in way to draw a circular arc without an SVG dependency this
 * project doesn't have. Segment widths are still proportional to real
 * `count` values, so the color is accurate, just laid out straight instead
 * of curved.
 */
export function DonutPlaceholder({ total, segments = [], caption = 'Total' }) {
  const sum = segments.reduce((running, segment) => running + (segment.count || 0), 0);

  return (
    <View style={styles.donutWrap}>
      <Text style={styles.donutTotal}>{total}</Text>
      <Text style={styles.donutCaption}>{caption}</Text>

      <View style={styles.proportionBar}>
        {sum > 0
          ? segments.map((segment) => {
              if (!segment.count) return null;

              return (
                <View
                  key={segment.key}
                  style={[
                    styles.proportionSegment,
                    { flex: segment.count, backgroundColor: toneOf(segment.tone).ink },
                  ]}
                />
              );
            })
          : null}
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
                {
                  height: Math.max(4, Math.round((item.value / max) * PLOT_HEIGHT)),
                  backgroundColor: toneOf(item.tone).ink,
                },
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
