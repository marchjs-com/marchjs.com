// Showcase stage for Kanban: drag cards (or Alt+← / Alt+→); the columns (JSON), their count and colours, dot, count and entrance follow the Playground values.
import { Kanban, type KanbanColumn } from "march/data";
import { Chip } from "march/actions";
import { Icon, layers } from "march/icons";
import { COLUMNS } from "./playground.ts";

export const code = `<Kanban columns={$board} itemKey={(x) => x.id} card={(x) => <strong>{x.title}</strong>}
  onMove={(item, from, to) => { $board = move($board, item, from, to) }} />
// column: { id, title, tone?, color?, items } — drag and drop, or Alt+← / Alt+→ on a focused card
// dot={false} count={(col) => col.items.length + " iş"} animate={false}: every part is optional or yours`

interface Task { id: string; title: string; tag: string }
const parse = (json: string): KanbanColumn<Task>[] => { try { const x = JSON.parse(json); return Array.isArray(x) ? x : [] } catch { return [] } }

const BRAND: Record<string, "brand-blue" | "brand-orange" | "brand-purple" | "brand-green"> = { todo: "brand-blue", doing: "brand-orange", review: "brand-purple", done: "brand-green" }

export default function KanbanDemo(props: { values: { columns: string; cols: number; brand: boolean; tones: boolean; dot: string; count: string; animate: boolean } }) {
  // the board as moved; the Playground's JSON starts it again when it changes
  let $moved: { json: string; board: KanbanColumn<Task>[] } | null = null
  const board = (): KanbanColumn<Task>[] => { const json = props.values.columns || COLUMNS; return $moved && $moved.json === json ? $moved.board : parse(json) }
  const move = (it: Task, from: string, to: string) => {
    $moved = { json: props.values.columns || COLUMNS, board: board().map((c) => (c.id === from ? { ...c, items: c.items.filter((x) => x.id !== it.id) } : c.id === to ? { ...c, items: [...c.items, it] } : c)) }
  }
  const shown = () => {
    const v = props.values
    const all = board(), ids = v.cols === 2 ? ["todo", "done"] : v.cols === 3 ? ["todo", "doing", "done"] : null
    const cols = ids && ids.every((id) => all.some((c) => c.id === id)) ? all.filter((c) => ids.includes(c.id)) : all.slice(0, v.cols || all.length)
    return cols.map((c) => ({ ...c, tone: v.tones || v.brand ? c.tone : undefined, color: v.brand ? BRAND[c.id] : undefined }))
  }
  // dot, count and the entrance are read once by the board: it is drawn again when one of them changes
  return <div>{() => {
    const dot = props.values.dot, count = props.values.count, animate = props.values.animate
    return <Kanban columns={shown} itemKey={(x: Task) => x.id} onMove={move} animate={animate}
      dot={dot === "off" ? false : dot === "own" ? () => <Icon of={layers} size="sm" /> : true}
      count={count === "off" ? false : count === "own" ? (c: KanbanColumn<Task>) => `${c.items.length} iş` : true}
      card={(x: Task) => <div class="sc-col">
        <strong>{x.title}</strong>
        {x.tag ? <div class="sc-row"><Chip size="sm">{x.tag}</Chip></div> : null}
      </div>} />
  }}</div>
}
