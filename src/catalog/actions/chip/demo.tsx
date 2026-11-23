// Showcase stage for Chip: draws the chips for the Playground values (playground.ts). Code is shown in the Code tab.
import { Chip } from "march/actions";
import type { ColorToken } from "march/theme";
import { heart, tag, star } from "march/icons";

export const code = `<Chip>Tasarım</Chip>
<Chip selected={$on} onClick={() => $on = !$on}>Açık</Chip>          // filter: aria-pressed
<Chip tone="primary" onRemove={() => remove(tag)}>{tag}</Chip>       // removable
<Chip m:color="brand-blue" size="sm" selected>Mavi</Chip>
<Chip selected={$on} selectedIcon={heart} onClick={toggle}>Beğenilenler</Chip>   // selectedIcon: false | your own icon
<Chip onRemove={drop} removeIcon={trash} removeLabel="Etiketi sil">{tag}</Chip>`

// the Playground's icon names → their glyphs
const ICONS: Record<string, typeof tag> = { tag, star }

export default function ChipDemo(props: { values: { label: string; mode: string; tone: string; size: string; icon: string; color: string; selectedIcon: string } }) {
  let $on = new Set(["Açık"])
  let $removed = new Set<string>()
  return <div class="sc-row">
    {() => {
      const v = props.values, tone = v.tone as "neutral", size = v.size as "md", color = (v.color || undefined) as ColorToken | undefined
      const icon = v.icon ? ICONS[v.icon] ?? tag : undefined
      const selectedIcon = v.selectedIcon === "off" ? false : v.selectedIcon === "heart" ? heart : true
      // the first chip carries the Playground's label
      const first = (list: string[]): string[] => [v.label || list[0] || "", ...list.slice(1)]
      if (v.mode === "toggle") return first(["Açık", "Bekliyor", "Çözüldü"]).map((f) => <Chip tone={tone} size={size} icon={icon} m:color={color} selectedIcon={selectedIcon} selected={$on.has(f)} onClick={() => { const n = new Set($on); n.has(f) ? n.delete(f) : n.add(f); $on = n }}>{f}</Chip>)
      if (v.mode === "remove") return first(["Tasarım", "Ürün", "Çok uzun bir etiket adı kayarak okunur"]).filter((t) => !$removed.has(t)).map((t) => <Chip tone={tone} size={size} icon={icon} m:color={color} removeLabel="Etiketi sil" onRemove={() => { $removed = new Set([...$removed, t]) }}>{t}</Chip>)
      return first(["Tasarım", "Ürün", "Pazarlama"]).map((t) => <Chip tone={tone} size={size} icon={icon} m:color={color}>{t}</Chip>)
    }}
  </div>
}
