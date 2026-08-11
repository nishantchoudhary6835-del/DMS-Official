import { Text, View } from 'react-native';

import { Badge } from '@components/common/Badge';

import { Panel } from './Panel';

import { styles } from '@theme/styles/DashboardPanels.styles';

export function IdeasPipelinePanel({ ideas, style }) {
  return (
    <Panel title="Strategic Ideas Pipeline" footerLabel="View all ideas" style={style}>
      {ideas.map((idea) => (
        <View key={idea.key} style={styles.idea}>
          <View style={styles.ideaCopy}>
            <Text style={styles.ideaTitle} numberOfLines={2}>
              {idea.title}
            </Text>
            <Text style={styles.ideaMeta} numberOfLines={1}>
              {idea.submittedBy}
            </Text>
          </View>

          <Badge label={idea.stage} tone={idea.tone} style={styles.ideaBadge} />
        </View>
      ))}
    </Panel>
  );
}
