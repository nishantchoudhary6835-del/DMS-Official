import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { Badge } from '@components/common/Badge';
import { theme } from '@theme';

import { Panel } from './Panel';

import { styles } from '@theme/styles/DashboardPanels.styles';

// Type, stage, timestamp and action claim ~294px between them; below this the
// title is left with under 140px, which truncates every real filename.
const FOLD_WIDTH = 430;

/**
 * Folds on its own measured width rather than the window's — the panel sits in
 * a grid column, so the viewport says nothing useful about how much room it
 * actually has.
 */
export function RecentDocumentsPanel({ documents, style }) {
  const [width, setWidth] = useState(0);
  const isNarrow = width > 0 && width < FOLD_WIDTH;

  return (
    <Panel title="Recent Documents" footerLabel="View all documents" style={style}>
      <View onLayout={(event) => setWidth(event.nativeEvent.layout.width)}>
        {isNarrow ? null : (
          <View style={[styles.tableRow, styles.tableHead]}>
            <Text style={[styles.headCell, styles.colTitle]}>Document Title</Text>
            <Text style={[styles.headCell, styles.colType]}>Type</Text>
            <Text style={[styles.headCell, styles.colStage]}>Current Stage</Text>
            <Text style={[styles.headCell, styles.colUpdated]}>Updated At</Text>
            <Text style={[styles.headCell, styles.colAction]}>Action</Text>
          </View>
        )}

        {documents.map((document) => (
          <View key={document.key} style={styles.tableRow}>
            <View style={styles.colTitle}>
              <Text style={styles.cellTitle} numberOfLines={1}>
                {document.title}
              </Text>
              {isNarrow ? (
                <Text style={styles.cellMeta} numberOfLines={1}>
                  {document.type} · {document.updatedAt}
                </Text>
              ) : null}
            </View>

            {isNarrow ? null : (
              <Text style={[styles.cell, styles.colType]} numberOfLines={1}>
                {document.type}
              </Text>
            )}

            <View style={styles.colStage}>
              <Badge label={document.stage} tone={document.tone} />
            </View>

            {isNarrow ? null : (
              <Text style={[styles.cell, styles.colUpdated]} numberOfLines={1}>
                {document.updatedAt}
              </Text>
            )}

            {isNarrow ? null : (
              <View style={styles.colAction}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`View ${document.title}`}
                  hitSlop={6}
                  style={({ hovered }) => [hovered && styles.actionHovered]}
                >
                  <Ionicons
                    name="eye-outline"
                    size={16}
                    color={theme.colors.textMuted}
                  />
                </Pressable>
              </View>
            )}
          </View>
        ))}
      </View>
    </Panel>
  );
}
