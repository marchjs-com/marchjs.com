// Showcase stage for RowTools: a small list whose rows really move and go: drag a row by its grip, or use the arrows
// (off on the first and the last row). "Geri yükle" brings the rows back.
import { RowTools, type RowAction } from "march/components/forms/row-tools";
import { Button } from "march/components/actions/button";

export const code = `<RowTools index={i} count={() => $rows.length} onReorder={(from, to) => reorder(from, to)}
  onUp={() => move(i, -1)} onDown={() => move(i, 1)} onRemove={() => remove(i)} />
<RowTools actions={["remove"]} onRemove={() => remove(i)} danger icons={{ remove: trash }} labels={{ remove: "Satırı sil" }} />`

const START = ["Isınma", "Sahil koşusu", "Esneme", "Kahvaltı"]
const SETS: Record<string, RowAction[]> = { drag: ["drag", "up", "down", "remove"], all: ["up", "down", "remove"], move: ["up", "down"], remove: ["remove"] }

export default function RowToolsDemo(props: { values: { actions: string; size: string; danger: boolean; disabled: boolean } }) {
  let $rows = START
  const move = (i: number, d: number): void => { const next = [...$rows]; const [x] = next.splice(i, 1); next.splice(i + d, 0, x!); $rows = next }
  const remove = (i: number): void => { $rows = $rows.filter((_, j) => j !== i) }
  const reorder = (from: number, to: number): void => { const next = [...$rows]; const [x] = next.splice(from, 1); next.splice(to, 0, x!); $rows = next }
  return <div class="sc-col">
    {() => {
      const v = { ...props.values }
      return <ol class="sc-rowtools-list">
        {$rows.map((row, i) => <li class="sc-row sc-row-between">
          <span>{row}</span>
          <RowTools actions={SETS[v.actions]} index={i} count={$rows.length} size={v.size as "sm"} danger={v.danger} disabled={v.disabled}
            onReorder={reorder} onUp={() => move(i, -1)} onDown={() => move(i, 1)} onRemove={() => remove(i)} />
        </li>)}
      </ol>
    }}
    <div class="sc-row"><Button size="sm" on:click={() => { $rows = START }}>Geri yükle</Button></div>
  </div>
}
