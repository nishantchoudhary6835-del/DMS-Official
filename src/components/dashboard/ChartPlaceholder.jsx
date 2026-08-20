import { Text, View } from 'react-native';

import { toneOf } from '@theme/tones';

import { styles } from '@theme/styles/ChartPlaceholder.styles';

const PLOT_HEIGHT = 140;

// A lone bar is always full height and a one-segment proportion bar is always
// a solid block, so below two values both fall back to reading the figures out.
const MIN_PLOTTABLE = 2;

// A proportional stacked bar, not a literal ring: drawing an arc would need an
// SVG dependency this project does not have. Widths stay true to `count`.
export function DonutPlaceholder({ total, segments = [], caption = 'Total' }) {
  // Zero-count segments contribute no width, so they are not what decides
  // whether the bar is worth drawing — the non-zero ones are.
  const plotted = segments.filter((segment) => segment.count > 0);

  return (
    <View style={styles.donutWrap}>
      <Text style={styles.donutTotal}>{total}</Text>
      <Text style={styles.donutCaption}>{caption}</Text>

      {plotted.length >= MIN_PLOTTABLE ? (
        <View style={styles.proportionBar}>
          {plotted.map((segment) => (
            <View
              key={segment.key}
              style={[
                styles.proportionSegment,
                { flex: segment.count, backgroundColor: toneOf(segment.tone).ink },
              ]}
            />
          ))}
        </View>
      ) : null}
    </View>
  );
}

export function BarsPlaceholder({ series }) {
  if (series.length < MIN_PLOTTABLE) {
    return (
      <View style={styles.readout}>
        {series.map((item) => (
          <View key={item.key} style={styles.readoutRow}>
            <View style={[styles.readoutDot, { backgroundColor: toneOf(item.tone).ink }]} />
            <Text style={styles.readoutLabel} numberOfLines={1}>
              {item.label}
            </Text>
            <Text style={styles.readoutValue}>{item.value}</Text>
          </View>
        ))}
      </View>
    );
  }

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
