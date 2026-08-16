import { Panel } from './Panel';
import { BarsPlaceholder } from './ChartPlaceholder';

export function ApprovalFlowPanel({ title, series, style }) {
  return (
    <Panel title={title} style={style}>
      <BarsPlaceholder series={series} />
    </Panel>
  );
}
