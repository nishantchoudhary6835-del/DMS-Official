import { Panel } from './Panel';
import { BarsPlaceholder } from './ChartPlaceholder';

export function ApprovalFlowPanel({ series, style }) {
  return (
    <Panel title="Approval Flow Overview" style={style}>
      <BarsPlaceholder series={series} />
    </Panel>
  );
}
