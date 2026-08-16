import { Text, View } from 'react-native';

import { Badge } from '@components/common/Badge';

import { Panel } from './Panel';

import { styles } from '@theme/styles/DashboardPanels.styles';

/**
 * A short list of workflow items (pending approvals, my submissions) with a
 * title, a meta line, and a status badge. Generic on purpose — the dashboard
 * uses this same shell for two different real data sources rather than two
 * near-identical components, since neither has enough of its own layout to
 * justify a separate file.
 */
export function WorkflowListPanel({
  title,
  footerLabel,
  onFooterPress,
  items,
  emptyLabel = 'Nothing here right now.',
  style,
}) {
  return (
    <Panel title={title} footerLabel={footerLabel} onFooterPress={onFooterPress} style={style}>
      {items.length === 0 ? (
        <Text style={styles.ideaMeta}>{emptyLabel}</Text>
      ) : (
        items.map((item) => (
          <View key={item.key} style={styles.idea}>
            <View style={styles.ideaCopy}>
              <Text style={styles.ideaTitle} numberOfLines={2}>
                {item.title}
              </Text>
              {item.meta ? (
                <Text style={styles.ideaMeta} numberOfLines={1}>
                  {item.meta}
                </Text>
              ) : null}
            </View>

            {item.stage ? (
              <Badge label={item.stage} tone={item.tone} style={styles.ideaBadge} />
            ) : null}
          </View>
        ))
      )}
    </Panel>
  );
}
