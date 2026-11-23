// Showcase stage for ThreadNav: a small app frame, the thread at its side, the chosen page's title in it. Press a bead
// to open its capsule, a category to hang its pages, a page to go there: the drop flows to it in its section's colour.
import { ThreadNav, threadPath, type ThreadNavItem } from "march/navigation";
import { computed } from "march";

export const code = `<ThreadNav items={sections} value={$page} onNavigate={(it) => go(it.href)} fixed />
<ThreadNav items={sections} value={$page} onNavigate={(it) => $page = it.id} search={false} crumbs={false} />`

export default function ThreadNavDemo(props: { values: { items: readonly ThreadNavItem[]; magnify: boolean; bend: boolean; search: boolean; crumbs: boolean; closeOnNavigate: boolean; reach: number; grow: number; colors: boolean } }) {
  let $page = "stat"
  // the chosen tree (playground.ts: the documentation or a shop); "Bölüm renkleri" off takes the sections' colours away
  // (computed: one array per choice, so the sections stay the same objects between reads)
  const tree = computed((): readonly ThreadNavItem[] => (props.values.colors ? props.values.items : props.values.items.map((s) => ({ ...s, color: undefined }))))
  return <div class="sc-thn-stage">
    {() => {
      const v = { ...props.values }
      return <ThreadNav items={tree} value={() => $page} onNavigate={(it: ThreadNavItem) => { $page = it.id }} magnify={v.magnify} bend={v.bend}
        search={v.search} crumbs={v.crumbs} closeOnNavigate={v.closeOnNavigate} reach={v.reach} grow={v.grow} />
    }}
    <div class="sc-thn-page">
      <p class="sc-demo-call">{() => threadPath(tree(), $page).map((x) => x.label).join(" › ")}</p>
      <h3>{() => threadPath(tree(), $page).at(-1)?.label ?? ""}</h3>
    </div>
  </div>
}
