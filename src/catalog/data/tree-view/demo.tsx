// Showcase stage for TreeView: the Playground's nodes (JSON) and a generated project tree of ~3 000 nodes; folders marked "lazy" load their children on open.
import { signal, untrack } from "march";
import { TextInput } from "march/forms";
import { TreeView, type TreeViewNode } from "march/components/data/tree-view";
import { NODES } from "./playground.ts";

export const code = `<TreeView nodes={files} selection="multiple" draggable search={$q}
  load={(node) => api.children(node.id)}
  onSelect={(ids) => $selected = ids}
  onMove={(ids, target, position) => api.move(ids, target, position)} />
// chevron={false | (node, open) => …} m:color="brand-purple" animate={false}
// labels={{ retry, empty, noMatch: (q) => … }} ghost={(nodes) => …} empty={<EmptyState />}`

const AREAS = ["web", "mobil", "api", "tasarım", "belgeler", "araçlar"];
const PARTS = ["bileşenler", "sayfalar", "servisler", "testler", "stiller", "varlıklar", "yardımcılar", "çeviriler"];
const EXT = [".ts", ".tsx", ".css", ".md", ".json", ".svg"];
const NAMES = ["giriş", "liste", "kart", "menü", "ayarlar", "profil", "ödeme", "arama", "bildirim", "takvim", "rapor", "panel"];
const rnd = (i: number, m: number) => ((i * 2654435761) >>> 0) % m;
const files = (prefix: string, n: number, seed: number): TreeViewNode[] => Array.from({ length: n }, (_, i) => {
  const name = `${NAMES[rnd(seed + i * 7, NAMES.length)]}-${i + 1}${EXT[rnd(seed + i * 3, EXT.length)]}`;
  return { id: `${prefix}/${name}`, label: name, meta: `${1 + rnd(seed + i * 13, 48)} KB` };
});
// the Playground's nodes (JSON) come first, then the generated areas
const fromJson = (json: string): TreeViewNode[] => { try { const x = JSON.parse(json || NODES); return Array.isArray(x) ? x : [] } catch { return [] } }
const build = (json: string): TreeViewNode[] => { const mine = fromJson(json), ids = new Set(mine.map((n) => n.id)); return [...mine, ...AREAS.filter((a) => !ids.has(a)).map((a, ai) => ({
  id: a, label: a, children: PARTS.map((p, pi) => ({
    id: `${a}/${p}`, label: p,
    children: [
      { id: `${a}/${p}/eski`, label: "eski", lazy: true },
      ...files(`${a}/${p}`, 40 + rnd(ai * 31 + pi, 40), ai * 100 + pi),
    ],
  })),
}))] };

export default function TreeViewDemo(props: { values: { nodes: string; expanded: string; label: string; search: string; selection: string; draggable: boolean; icons: boolean; load: string; chevron: string; color: string; animate: boolean; labels: boolean } }) {
  let $q = ""
  const picked = signal<string[]>([])
  const moved = signal("")
  const load = (node: TreeViewNode) => new Promise<TreeViewNode[]>((ok, fail) => {
    const mode = props.values.load
    // a failing request fails quickly (the retry row shows at once); a slow one shows the loading row for a while
    setTimeout(() => (mode === "fail" ? fail(new Error("Ağ hatası")) : ok(files(node.id, 12, node.id.length * 17))), mode === "fast" ? 60 : mode === "fail" ? 250 : 900)
  })
  return <div class="sc-stage">
    <TextInput bind:value={$q} type="search" placeholder="Ağaçta ara (ör. menü, ödeme)" aria-label="Ağaçta ara" />
    {() => {
      // the open lazy folder "web/parts/old" shows the load mode at once: the tree is drawn again when it changes
      // (and when a part read once changes: the arrow, the colour, the motion, the texts)
      void props.values.load
      const json = props.values.nodes, open = props.values.expanded, name = props.values.label
      const chevron = props.values.chevron, color = props.values.color, animate = props.values.animate, own = props.values.labels
      const tint = color ? color as "brand-orange" : undefined
      return untrack(() => {
        // two rows at the top start selected ("web", "web/parts"): the selection mode shows at once
        const nodes = build(json), first = [nodes[0]!, nodes[0]!.children?.[0] ?? nodes[0]!]
        picked.set(props.values.selection === "none" ? [] : props.values.selection === "single" ? [first[0]!.id] : [first[0]!.id, first[1]!.id])
        return <TreeView nodes={nodes} expanded={fromJson(open) as unknown as string[]} height={380} label={name || "Proje dosyaları"}
      selected={[first[0]!.id, first[1]!.id]} selection={props.values.selection as "multiple"} draggable={() => props.values.draggable} icons={() => props.values.icons}
      m:color={tint} animate={animate}
      chevron={chevron === "off" ? false : chevron === "own" ? (_n: TreeViewNode, open: boolean) => <b>{open ? "−" : "+"}</b> : true}
      labels={own ? { retry: "Yeniden dene", empty: "Henüz dosya yok", noMatch: (q: string) => `“${q}” adında dosya yok, başka bir şey deneyin` } : undefined}
      ghost={own ? (list: TreeViewNode[]) => <b>{`${list.length} dosya taşınıyor`}</b> : undefined}
      search={() => $q || props.values.search} load={load} onSelect={(ids: string[]) => picked.set(ids)}
      onMove={(ids: string[], target: string, pos: string) => moved.set(`${ids.length} öğe → ${target} (${pos === "inside" ? "içine" : pos === "before" ? "önüne" : "arkasına"})`)} />
      })
    }}
    <p role="status">{() => `${picked().length} seçili${moved() ? ` · son taşıma: ${moved()}` : ""}`}</p>
  </div>
}
