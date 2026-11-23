// Showcase stage for Breadcrumbs: the path comes from the Playground (playground.ts); narrow it to collapse the middle.
import { signal } from "march";
import { Breadcrumbs, type Crumb, type CrumbSibling } from "march/components/navigation/breadcrumbs";
import { arrowRight } from "march/icons";

export const code = `<Breadcrumbs label="Dosya yolu" items={[
  { id: "hadi", label: "hadi", icon: folder, onSelect: () => openFolder("hadi") },
  { id: "src", label: "src", icon: folder, siblings: () => folders("hadi") },   // kardeşlere menüyle git: { id, label, sub, href | onSelect, current }
  { id: "file", label: "app.ts", icon: fileText },
]} />
<Breadcrumbs items={path} separator="/" />                       // kendi ayracın: metin, ikon ya da () => düğüm
<Breadcrumbs items={path} separator={false} collapse={false} />  // ayraçsız, toplamadan`

const SEPARATORS: Record<string, unknown> = { chevron: undefined, slash: "/", dot: "•", icon: arrowRight, off: false }

export default function BreadcrumbsDemo(props: { values: { items: readonly Crumb[]; width: number; siblings: boolean; subs: boolean; separator: string; collapse: boolean } }) {
  // the sibling chosen in a crumb's menu (crumb id → its label); the first crumb goes back to the path as given
  const picked = signal<Record<string, string>>({})
  const items = (): Crumb[] => props.values.items.map((c, i): Crumb => {
    if (i === 0) return { ...c, onSelect: () => picked.set({}) }
    const sib = c.siblings as readonly CrumbSibling[] | undefined
    if (!sib) return c
    const now = picked()[c.id] ?? String(c.label)
    return { ...c, label: now, ...(props.values.siblings ? { siblings: sib.map((x) => ({
      ...x, sub: props.values.subs ? x.sub : undefined, current: x.label === now, onSelect: () => picked.set({ ...picked(), [c.id]: x.label }),
    })) } : { siblings: undefined }) }
  })
  // separator and collapse are read once: the path is drawn again when one of them changes
  return <div class="sc-bc-stage" style={{ "--sc-bc-w": `${props.values.width}px` }}>{() => {
    const separator = SEPARATORS[props.values.separator], collapse = props.values.collapse
    return <Breadcrumbs items={items} label="Dosya yolu" separator={separator} collapse={collapse} />
  }}</div>
}
