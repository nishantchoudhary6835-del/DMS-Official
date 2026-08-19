import { Text, View } from 'react-native';

import { toneOf } from '@theme/tones';

import { styles } from '@theme/styles/ChartPlaceholder.styles';

const PLOT_HEIGHT = 140;

/**
 * A chart earns its space by letting you compare things. With one value there
 * is nothing to compare: a lone bar is always full height, and a proportion
 * bar with one segment is always a solid block — both encode exactly zero
 * information beyond the number printed beside them, while taking a chart's
 * worth of room and implying a comparison that isn't there.
 *
 * So both components below fall back to reading the figures out plainly
 * whenever fewer than two of them are actually plottable. The data never
 * disappears; only the graphic does.
 */
const MIN_PLOTTABLE = 2;

/**
 * A proportional stacked bar rather than a literal ring — React Native has
 * no built-in way to draw a circular arc without an SVG dependency this
 * project doesn't have. Segment widths are still proportional to real
 * `count` values, so the color is accurate, just laid out straight instead
 * of curved.
 */
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
