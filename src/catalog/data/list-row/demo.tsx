// Showcase stage for ListRow: four rows of a small list in a narrow box (the long title does not fit). A click makes
// a row the active one; the options change what the row is (button, link, listbox option, plain), its slots and its look.
import { ListRow, Badge } from "march/data";
import { Kbd } from "march/typography";
import { Avatar } from "march/social";
import { StatusDot, type StatusDotTone } from "march/feedback";
import { Chevron, IconButton } from "march/actions";
import type { ColorToken } from "march/theme";
import { home, calendar, bell, settings, more } from "march/icons";

export const code = `<ListRow lead={home} title="Ana sayfa" sub="Genel bakış" trail={<Badge count={3} />} href="/" active />
<ListRow lead={<Avatar name="Deniz Kaya" size="sm" decorative />} title="Deniz Kaya" sub="çevrimiçi" onClick={open} />
<ListRow as="li" role="option" aria-selected={on} interactive active={on} title={cmd.title} trail={<Kbd keys="mod+k" />} />
<ListRow title={file.name} sub="2,4 MB" actions={<IconButton icon={trash} label="Kaldır" onClick={remove} />} />
<ListRow as="article" direction="column" overflow="wrap" lead={<IconTile icon={zap} />} title="Hızlı" titleAs="h3" sub="Her sayfa ayrı yüklenir." subAs="p" />`

const ROWS = [
  { id: "home", icon: home, emoji: "🏠", name: "Ana sayfa", sub: "Genel bakış", tone: "success", count: 3, keys: "mod+1" },
  { id: "events", icon: calendar, emoji: "📅", name: "Bu hafta sonu yakınındaki bütün etkinlikler ve buluşmalar", sub: "Kadıköy, Beşiktaş, Moda ve çevresinde 42 etkinlik", tone: "warn", count: 42, keys: "mod+2" },
  { id: "alerts", icon: bell, emoji: "🔔", name: "Bildirimler", sub: "Yeni yok", tone: "neutral", count: 0, keys: "mod+3" },
  { id: "settings", icon: settings, emoji: "⚙️", name: "Ayarlar", sub: "Hesap ve gizlilik", tone: "info", count: 0, keys: "mod+," },
]

export default function ListRowDemo(props: { values: { kind: string; title: string; active: boolean; lead: string; sub: boolean; trail: string; size: string; color: string; overflow: string; indicator: boolean; disabled: boolean; direction: string; heading: boolean } }) {
  let $active = "home"
  let $said = ""
  return <div class="sc-col">
    {() => {
      const v = { ...props.values }
      const option = v.kind === "option", color = (v.color || undefined) as ColorToken | undefined
      const rows = ROWS.map((r, i) => {
        const lead = v.lead === "icon" ? r.icon : v.lead === "emoji" ? r.emoji
          : v.lead === "avatar" ? <Avatar name={r.name} size="sm" decorative />
          : v.lead === "dot" ? <StatusDot tone={r.tone as StatusDotTone} /> : undefined
        const trail = v.trail === "badge" ? (r.count ? <Badge count={r.count} tone="neutral" /> : undefined)
          : v.trail === "kbd" ? <Kbd keys={r.keys} /> : v.trail === "chevron" ? <Chevron /> : undefined
        const actions = v.trail === "actions" ? <IconButton icon={more} label={`${r.name}: diğer`} size="sm" onClick={() => { $said = `eylem: ${r.name}` }} /> : undefined
        const pick = () => { $active = r.id; $said = `seçildi: ${r.name}` }
        const shared = {
          lead, trail, actions, title: i === 0 && v.title ? v.title : r.name, sub: v.sub ? r.sub : undefined, size: v.size as "md", color, overflow: v.overflow as "scroll",
          indicator: v.indicator, disabled: v.disabled && i === 2, active: () => $active === r.id || (v.active && i === 0),
          direction: v.direction === "row" ? "row" as const : "column" as const, align: v.direction === "center" ? "center" as const : undefined,
          titleAs: v.heading ? "h3" as const : undefined, subAs: v.heading ? "p" as const : undefined,
        }
        if (v.kind === "link") return <ListRow {...shared} href={`#${r.id}`} onClick={(e: MouseEvent) => { e.preventDefault(); pick() }} />
        if (option) return <ListRow {...shared} as="li" role="option" interactive aria-selected={() => String($active === r.id)} onClick={pick} />
        if (v.kind === "static") return <ListRow {...shared} />
        return <ListRow {...shared} onClick={pick} />
      })
      return option ? <ul class="sc-list-row-box" role="listbox" aria-label="Gezinme">{rows}</ul> : <div class="sc-list-row-box">{rows}</div>
    }}
    <p class="m-muted">{() => $said || "Bir satıra bas: etkin satır değişir. Uzun başlık üstüne gelince kayar."}</p>
  </div>
}
