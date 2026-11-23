// Showcase stage for OverflowToolbar: the items and the name follow the Playground (playground.ts); narrow the bar with
// the Playground width and watch items move to More; widen it to see them come back with the chosen motion. The More
// icon and the colour of pressed toggles follow the options.
import { signal } from "march";
import { type Signal } from "../../demo-util.ts";
import { OverflowToolbar, type ToolbarItem } from "march/components/actions/overflow-toolbar";
import { command } from "march/managers/command";
import { toast } from "march/components/overlays/toast";
import { plus, download, menu } from "march/icons";
import { animate } from "march/motion";
import type { ColorToken } from "march/theme";

export const code = `<OverflowToolbar label="Belge" items={[
  { id: "new", label: "Yeni", icon: plus, onSelect: create, priority: 10 },
  { id: "save", command: "doc.save", priority: 9 },          // başlık, ikon, kısayol, etkinlik komuttan
  { id: "s1", separator: true },
  { id: "split", label: "Böl", icon: columns, pressed: () => $split, onSelect: () => $split = !$split },
  { id: "delete", label: "Sil", icon: trash, danger: true },  // sığmayan "Daha fazla" menüsüne gider
]} moreIcon={menu} moreLabel="Diğer araçlar" motion="fade" m:color="brand-purple" />   // motion: pop | fade | none | (el) => …`

export default function OverflowToolbarDemo(props: { values: { label: string; items: readonly ToolbarItem[]; width: number; size: string; labels: boolean; motion: string; moreIcon: string; color: string } }) {
  // a toggle's state, one per item id (it starts at the item's own pressed value)
  const toggles = new Map<string, Signal<boolean>>()
  const toggle = (it: ToolbarItem): Signal<boolean> => { let s = toggles.get(it.id); if (!s) toggles.set(it.id, s = signal(!!it.pressed)); return s }
  command({ id: "demo.export", title: "Dışa aktar", icon: download, shortcut: "mod+e", group: "Belge", run: () => { toast("Dışa aktarıldı") } })
  // the chosen items (playground.ts): each gets its action; a toggle flips its state; "export" runs a command
  const items = (): ToolbarItem[] => {
    const l = props.values.labels
    return props.values.items.map((it): ToolbarItem => {
      if (it.separator) return it
      if (it.id === "export") return { id: it.id, command: "demo.export", priority: it.priority ?? 0, showLabel: l }
      if (it.pressed !== undefined) { const on = toggle(it); return { ...it, pressed: () => on(), onSelect: () => on.set(!on()), showLabel: l } }
      return { ...it, onSelect: () => { toast(String(it.label)) }, showLabel: l }
    })
  }
  return <div class="sc-otb-stage" style={{ "--sc-otb-w": `${props.values.width}px` }}>
    {() => {
      const v = props.values
      const motion = v.motion === "own" ? (el: Element) => animate(el, [{ opacity: 0, transform: "translateY(-10px)" }, { opacity: 1, transform: "none" }], { duration: 320, easing: "easeOutBack" }) : v.motion as "pop"
      return <OverflowToolbar label={v.label || "Belge araçları"} items={items} size={v.size as "sm"} motion={motion}
        moreIcon={v.moreIcon === "menu" ? menu : v.moreIcon === "plus" ? plus : undefined} m:color={(v.color || undefined) as never} />
    }}
  </div>
}
