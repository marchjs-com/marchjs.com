// Showcase stage for Grid: cards with the last-row options (Playground values in playground.ts).
import { Grid } from "march/components/layout/grid";

export const code = `<Grid cols={4} gap={3} fill="stretch" balance>{cards}</Grid>`

export default function GridDemo(props: { values: { cols: number; count: number; fill: string; balance: boolean } }) {
  return <div class="sc-grid-frame">
    {() => {
      const cols = props.values.cols, fill = (props.values.fill || undefined) as "stretch", balance = props.values.balance, count = props.values.count
      return <Grid cols={cols} gap={3} fill={fill} balance={balance}>{Array.from({ length: count }, (_, i) => <div class="sc-tile"><span>Kart {i + 1}</span></div>)}</Grid>
    }}
  </div>
}
