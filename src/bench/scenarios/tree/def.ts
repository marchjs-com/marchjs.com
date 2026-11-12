// Scenario: one value deep in a large tree (see ../core.ts for how scenarios are measured).
import { rng } from "../../core.ts"
import type { Scenario } from "../core.ts"

/** A tree node: inner nodes have `kids`; a leaf has `leaf`, its index into `Tree.values` (document order). */
export interface TNode { id: number; label: string; kids?: TNode[]; leaf?: number }
export interface Tree { roots: TNode[]; values: number[]; target: number; count: number }
const BRANCH = 10, DEPTH = 4

// Markup every app produces: <div class="tree"> then per node <div class="n"><span class="l">label</span>…kids</div>,
// per leaf <div class="n leaf"><span class="l">label</span><b class="v">value</b></div>.
export const tree: Scenario<Tree, number> = {
  id: "tree", label: "Derin ağaçta tek hücre", steps: 150, warm: 10,
  desc: "10 dallı, 4 katlı, 11.110 düğümlü bir ağaç (10.000 yaprağın her biri bir sayı gösterir); 150 kare boyunca her karede en alttaki tek bir yaprağın sayısı değişir. Ölçülen: kare başına süre (işlem + boyama) ve 16,7 ms'yi aşan (düşen) kare sayısı. Sanal DOM'lu kitaplıklarda değer yaprağa yakın bir durumda tutulur (önerilen kalıp), yine de bileşen yeniden çizilip karşılaştırılır; ağacı kökten yeniden çizen kitaplık tüm düğümleri gezer; ince taneli kitaplıklar yalnız o yaprağın metnine dokunur.",
  data(seed) {
    const r = rng(seed), values: number[] = []
    let id = 0
    const make = (prefix: string, depth: number): TNode[] => Array.from({ length: BRANCH }, (_, k) => {
      const label = prefix ? `${prefix}.${k}` : `${k}`
      if (depth === DEPTH) { values.push(Math.floor(r() * 1000)); return { id: ++id, label, leaf: values.length - 1 } }
      return { id: ++id, label, kids: make(label, depth + 1) }
    })
    const roots = make("", 1)
    return { roots, values, target: Math.floor(r() * values.length), count: id }
  },
  plan(_data, seed, count) {
    const r = rng(seed + 1)
    return Array.from({ length: count }, (_, i) => 1000 + i * 7 + Math.floor(r() * 7))
  },
  check(host, data, applied) {
    const nodes = host.querySelectorAll(".tree .n"), leaves = host.querySelectorAll(".tree .n.leaf > .v")
    if (nodes.length !== data.count || leaves.length !== data.values.length) return false
    if (leaves[data.target]?.textContent !== String(applied.at(-1))) return false
    for (const i of [0, 1, 4321, data.values.length - 1]) {
      if (i !== data.target && leaves[i]?.textContent !== String(data.values[i])) return false
    }
    // the leaf sits at depth 4 and its label is its path
    const t = leaves[data.target]!.parentElement!
    return t.querySelector(".l")?.textContent === labelOf(data, data.target) && !!t.parentElement?.parentElement?.parentElement?.classList.contains("n")
  },
}
const labelOf = (data: Tree, leaf: number): string => {
  let out = ""
  const walk = (ns: TNode[]): boolean => ns.some((n) => (n.leaf === leaf ? (out = n.label, true) : !!n.kids && walk(n.kids)))
  walk(data.roots)
  return out
}

export default tree
