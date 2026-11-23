// Showcase stage for Tree: nodes (JSON), label, initial expansion, icons and meta follow the Playground values (playground.ts).
import { Tree, type TreeNode } from "march/components/data/tree";
import { folder, fileText, code as codeIcon, settings } from "march/icons";
import { NODES } from "./playground.ts";

export const code = `<Tree label="Dosyalar" nodes={files} expanded={["src", "ui"]}
  selected={() => $file} onSelect={(n) => { $file = n.id }} />
// node: { id, label, icon?, meta?, children? } — ↑ ↓ move, → opens, ← closes, Enter selects
<Tree nodes={files} toggle="chevron" />                       // only the arrow opens / closes; a row click selects
<Tree nodes={files} m:color="brand-purple" chevron={(node, open) => <b>{() => (open() ? "−" : "+")}</b>} />   // or chevron={false}`

// the Playground's nodes (JSON) with the card's icons (a branch: folder, a file: code / text / settings by its name)
const iconOf = (n: TreeNode): unknown => (n.children ? folder : /\.css$/.test(n.id + String(n.label)) ? fileText : /config/.test(String(n.label)) ? settings : codeIcon)
const parse = (json: string): TreeNode[] => { try { const x = JSON.parse(json); return Array.isArray(x) ? x : [] } catch { return [] } }
const nodes = (json: string, icons: boolean, meta: boolean): TreeNode[] => {
  const go = (n: TreeNode): TreeNode => ({ ...n, icon: icons ? iconOf(n) : undefined, meta: meta ? n.meta : undefined, children: n.children?.map(go) })
  return parse(json || NODES).map(go)
}

export default function TreeDemo(props: { values: { nodes: string; label: string; expanded: string; icons: boolean; meta: boolean; chevron: string; toggle: string; color: string } }) {
  let $file = "button"
  return <div class="sc-col">
    {() => {
      const v = props.values
      const color = v.color ? v.color as "brand-orange" : undefined
      const expanded = parse(v.expanded) as unknown as string[]
      return <Tree label={v.label || "Dosyalar"} nodes={nodes(v.nodes, v.icons, v.meta)} expanded={expanded} m:color={color}
        chevron={v.chevron === "off" ? false : v.chevron === "own" ? (_n: TreeNode, open: () => boolean) => <b>{() => (open() ? "−" : "+")}</b> : true} toggle={v.toggle as "row"} selected={() => $file} onSelect={(n: TreeNode) => { $file = n.id }} />
    }}
    <p class="m-muted">Seçili: <code>{() => $file}</code></p>
  </div>
}
